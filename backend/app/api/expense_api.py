from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile, HTTPException

from backend.app.core.config import Config

from backend.app.database.database import SessionLocal

from backend.app.repositories.expense_repository import ExpenseRepository

from backend.app.schemas.expense_schema import ExpenseCreate

from backend.app.services.receipt_processor import ReceiptProcessor
from backend.app.clients.ollama_client import OllamaClient
from backend.app.utils.json_parser import JsonParser
from backend.app.services.validator import ExpenseValidator
from backend.app.services.expense_service import ExpenseService



router = APIRouter(
	prefix="/expenses",
	tags=["Expenses"],
)


# --------------------------------------------------
# Services
# --------------------------------------------------

receipt_processor = ReceiptProcessor(
	support_extensions=Config.SUPPORT_EXTENSIONS,
	pdf_dpi=Config.PDF_DPI,
)

ollama_client = OllamaClient(
	option=Config.MODEL_OPTIONS
)

json_parser = JsonParser()

validator = ExpenseValidator()


# --------------------------------------------------
# API
# --------------------------------------------------

@router.post("/scan")
async def scan_receipt(
	file: UploadFile = File(...)
):
	""" Scan and process an uploaded receipt file.

	Args:
		file (UploadFile): The uploaded receipt file.

	Returns:
		dict: A dictionary containing the processed expense data.
	"""
	Config.RECEIPT_DIR.mkdir(
		parents=True,
		exist_ok=True,
	)

	if not file.filename:
		raise HTTPException(
			status_code=400,
			detail="Filename is required",
		)

	extension = Path(file.filename).suffix.lower()

	if extension not in Config.SUPPORT_EXTENSIONS:
		raise HTTPException(
			status_code=400,
			detail=f"Unsupported file type: {extension}",
		)

	# --------------------------------------------------------
	# Save uploaded receipt
	# --------------------------------------------------------

	unique_filename = f"{uuid4()}_{file.filename}"

	file_path = Config.RECEIPT_DIR / unique_filename

	try:
		contents = await file.read()

		with open(file_path, "wb") as output_file:
			output_file.write(contents)

		expense_service = ExpenseService(
			receipt_processor=receipt_processor,
			ollama_client=ollama_client,
			json_parser=json_parser,
			validator=validator,
			model=Config.MODELS[0],
		)

		return expense_service.process_receipt(file_path)

	finally:
		if file_path.exists():
			file_path.unlink()

@router.post("/scan/batch")
async def scan_receipts_batch(
	files: list[UploadFile] = File(...)
):
	if not files:
		raise HTTPException(
			status_code=400,
			detail="At least one receipt is required."
		)

	Config.RECEIPT_DIR.mkdir(parents=True, exist_ok=True)

	batch_id = str(uuid4())

	results = []

	expense_service = ExpenseService(
		receipt_processor=receipt_processor,
		ollama_client=ollama_client,
		json_parser=json_parser,
		validator=validator,
		model=Config.MODELS[0],
	)

	for file in files:

		# -----------------------------
		# 1. Validate filename
		# -----------------------------
		if not file.filename:
			results.append({
				"success": False,
				"receipt": None,
				"data": None,
				"valid": False,
				"saved": False,
				"validation_error": None,
				"error": "Filename is required.",
			})
			continue

		# -----------------------------
		# 2. Validate extension
		# -----------------------------
		extension = Path(file.filename).suffix.lower()

		if extension not in Config.SUPPORT_EXTENSIONS:
			results.append({
				"success": False,
				"receipt": file.filename,
				"data": None,
				"valid": False,
				"saved": False,
				"validation_error": None,
				"error": f"Unsupported file type: {extension}",
			})
			continue

		# -----------------------------
		# 3. Create unique filename
		# -----------------------------
		unique_filename = f"{uuid4()}_{file.filename}"

		file_path = Config.RECEIPT_DIR / unique_filename

		try:
			# -----------------------------
			# 4. Save uploaded file
			# -----------------------------
			contents = await file.read()

			with open(file_path, "wb") as f:
				f.write(contents)

			# -----------------------------
			# 5. Run OCR
			# -----------------------------
			result = expense_service.process_receipt(file_path)

			# -----------------------------
			# 6. Return result
			# -----------------------------
			result["original_filename"] = file.filename
			result["batch_id"] = batch_id

			results.append(result)

		except Exception as e:

			results.append({
				"success": False,
				"original_filename": file.filename,
				"data": None,
				"valid": False,
				"saved": False,
				"validation_error": None,
				"batch_id": batch_id,
				"error": str(e),
			})

		finally:
			if file_path.exists():
				file_path.unlink()

	successful = sum(
		1 for result in results
		if result.get("success") is True
	)

	failed = len(results) - successful

	return {
		"success": failed == 0,
		"batch_id": batch_id,
		"total": len(results),
		"successful": successful,
		"failed": failed,
		"results": results,
	}

@router.get("")
def get_expenses():
	"""Retrieve all expenses from the database.

	Returns:
		list[dict]: A list of dictionaries containing expense data.
	"""

	db = SessionLocal()

	try:

		expense_repository = ExpenseRepository(
			db=db
		)

		expenses = expense_repository.get_all()

		return [
			{
				"id": expense.id,
				"merchant": expense.merchant,
				"date": (
					expense.date.isoformat()
					if expense.date
					else None
				),
				"currency": expense.currency,
				"total": expense.total,
				"category": expense.category,
			}
			for expense in expenses
		]

	finally:

		db.close()

@router.post("")
def create_expense(
	data: ExpenseCreate,
):
	"""Create a new expense record along with its associated receipt.

	Args:
		data (ExpenseCreate): The expense data.

	Returns:
		dict: A dictionary containing the created expense ID and receipt ID.
	"""

	# --------------------------------------------------------
	# Validate expense
	# --------------------------------------------------------

	expense_data = data.model_dump()

	valid, validation_error = (
		validator.validate_expense(expense_data)
	)

	if not valid:

		raise HTTPException(
			status_code=400,
			detail=validation_error
			or "Invalid expense data",
		)

	# --------------------------------------------------------
	# Save to database
	# --------------------------------------------------------

	db = SessionLocal()

	try:

		expense_repository = ExpenseRepository(
			db=db
		)

		expense = expense_repository.create(
			expense_data=expense_data,
		)

		return {
			"success": True,
			"saved": True,
			"expense_id": expense.id,
		}

	except Exception as e:

		db.rollback()

		raise HTTPException(
			status_code=500,
			detail=str(e),
		)

	finally:

		db.close()

@router.get("/{expense_id}")
def get_expense(expense_id: int):
	"""Retrieve a specific expense by its ID.

	Args:
		expense_id (int): The ID of the expense to retrieve.

	Returns:
		dict: A dictionary containing the expense data if found.
	"""
	db = SessionLocal()

	try:

		repository = ExpenseRepository(db)

		expense = repository.get_by_id(expense_id)

		if expense is None:
			raise HTTPException(
				status_code=404,
				detail="Expense not found",
			)

		return {
			"id": expense.id,
			"merchant": expense.merchant,
			"date": (
				expense.date.isoformat()
				if expense.date
				else None
			),
			"currency": expense.currency,
			"subtotal": expense.subtotal,
			"discount": expense.discount,
			"tax": expense.tax,
			"total": expense.total,
			"amount_paid": expense.amount_paid,
			"payment_method": expense.payment_method,
			"category": expense.category,
			"items": [
				{
					"id": item.id,
					"name": item.name,
					"quantity": item.quantity,
					"price": item.price,
				}
				for item in expense.items
			],
		}

	finally:
		db.close()

# @router.put(
# 	"/{expense_id}",
# 	response_model=ExpenseCreate
# )
# def update_expense(
# 	expense_id: int,
# 	data: ExpenseCreate
# ):
# 	""" Update a specific expense by its ID.

# 	Args:
# 		expense_id (int): The ID of the expense to update.
# 		data (ExpenseCreate): The updated expense data.

# 	Returns:
# 		dict: A dictionary containing the updated expense data.
# 	"""
# 	db = SessionLocal()

# 	try:

# 		repository = ExpenseRepository(db)

# 		expense = repository.update(
# 			expense_id,
# 			data.model_dump(exclude_unset=True)
# 		)

# 		if expense is None:

# 			raise HTTPException(
# 				status_code=404,
# 				detail="Expense not found"
# 			)

# 		return expense

# 	finally:

# 		db.close()

@router.delete("/{expense_id}")
def delete_expense(expense_id: int):
	""" Delete a specific expense by its ID.

	Args:
		expense_id (int): The ID of the expense to delete.

	Returns:
		dict: A dictionary indicating the success of the deletion.
	"""
	db = SessionLocal()

	try:

		repository = ExpenseRepository(db)

		deleted = repository.delete(expense_id)

		if not deleted:

			raise HTTPException(
				status_code=404,
				detail="Expense not found"
			)

		return {
			"success": True,
			"message": "Expense deleted"
		}

	finally:

		db.close()

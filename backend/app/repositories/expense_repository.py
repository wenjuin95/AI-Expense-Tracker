from sqlalchemy.orm import Session

from datetime import date

from backend.app.database.models import Expense, ExpenseItem


class ExpenseRepository:

	def __init__(self, db: Session):
		self.db = db

	def create(
		self,
		expense_data,
	):
		"""Creates a new expense record along with its expense items.

		Args:
			expense_data (dict): A dictionary containing the expense data.
		Returns:
			Expense: The created Expense object.
		"""
		# convert date
		expense_date = None

		if expense_data.get("date"):
			expense_date = date.fromisoformat(
				expense_data["date"]
			)

		# create expense record
		expense = Expense(
			merchant=expense_data.get("merchant"),
			date=expense_date,
			currency=expense_data.get("currency"),

			subtotal=expense_data.get("subtotal"),
			discount=expense_data.get("discount"),
			tax=expense_data.get("tax"),
			total=expense_data.get("total"),
			amount_paid=expense_data.get("amount_paid"),

			payment_method=expense_data.get("payment_method"),
			category=expense_data.get("category"),
		)

		self.db.add(expense)
		self.db.flush()

		# create expense items
		for item_data in expense_data.get("items", []):

			item = ExpenseItem(
				expense_id=expense.id,

				name=item_data.get("name"),
				quantity=item_data.get("quantity"),
				price=item_data.get("price"),
			)

			self.db.add(item)

		# save transaction
		self.db.commit()
		self.db.refresh(expense)

		return expense

	def get_by_id(self, expense_id: int) -> Expense | None:
		"""Retrieves an expense record by its ID.

		Args:
			expense_id (int): The ID of the expense to retrieve.

		Returns:
			Expense | None: The Expense object if found, otherwise None.
		"""
		return (
			self.db.query(Expense)
			.filter(Expense.id == expense_id)
			.first()
		)

	def get_all(self) -> list[Expense]:
		"""Retrieves all expense records.

		Returns:
			list[Expense]: A list of all Expense objects.
		"""
		return self.db.query(Expense).all()

	def delete(self, expense_id: int) -> bool:
		"""Deletes an expense record by its ID.

		Args:
			expense_id (int): The ID of the expense to delete.

		Returns:
			bool: True if the expense was deleted, False if not found.
		"""
		expense = self.get_by_id(expense_id)

		if expense is None:
			return False

		self.db.delete(expense)
		self.db.commit()

		return True

	def update(self, expense_id: int, data: dict):
		"""Updates an existing expense record with new data.

		Args:
			expense_id (int): The ID of the expense to update.
			data (dict): A dictionary containing the fields to update.

		Returns:
			Expense | None: The updated Expense object if found, otherwise None.
		"""

		expense = self.get_by_id(expense_id)

		if expense is None:
			return None

		for field, value in data.items():

			if value is not None:
				setattr(expense, field, value)

		self.db.commit()
		self.db.refresh(expense)

		return expense

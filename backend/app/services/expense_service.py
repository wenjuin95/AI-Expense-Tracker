class ExpenseService:

	def __init__(
		self,
		receipt_processor,
		model_client,
		json_parser,
		validator,
		model,
	):
		self.receipt_processor = receipt_processor
		self.model_client = model_client
		self.parser = json_parser
		self.validator = validator
		self.model = model

	def process_receipt(self, receipt):

		try:

			# Prepare receipt
			image = self.receipt_processor.check_extension(
				receipt
			)

			print(f"Prepared: {image}")

			# Run the selected model provider
			result = self.model_client.read_receipt_and_extract(
				self.model,
				image
			)

			# Check model result
			if not result["success"]:
				return {
					"success": False,
					"receipt": receipt.name,
					"data": None,
					"valid": False,
					"saved": False,
					"validation_error": None,
					"model": result.get("model"),
					"model_id": result.get("model_id"),
					"time_seconds": result.get("time_seconds"),
					"error": result.get("error"),
				}

			# Parse JSON
			data = self.parser.extract(
				result["response"]
			)

			if data is None:
				return {
					"success": False,
					"receipt": receipt.name,
					"data": None,
					"valid": False,
					"saved": False,
					"validation_error": (
						"Invalid JSON returned by model"
					),
					"model": result.get("model"),
					"model_id": result.get("model_id"),
					"time_seconds": result.get("time_seconds"),
					"error": None,
				}

			# Validate
			valid, validation_error = (
				self.validator.validate_expense(data)
			)

			# Return result
			return {
				"success": True,
				"receipt": receipt.name,
				"data": data,
				"valid": valid,
				"saved": False,
				"validation_error": validation_error,
				"model": result.get("model"),
				"model_id": result.get("model_id"),
				"time_seconds": result.get("time_seconds"),
				"error": None,
			}

		except Exception as e:

			return {
				"success": False,
				"receipt": receipt.name,
				"data": None,
				"valid": False,
				"saved": False,
				"validation_error": None,
				"model": None,
				"model_id": None,
				"time_seconds": None,
				"error": str(e),
			}

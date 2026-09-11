class ExpenseValidator:

	REQUIRED_FIELDS = {
		"merchant",
		"date",
		"currency",
		"subtotal",
		"discount",
		"tax",
		"total",
		"amount_paid",
		"payment_method",
		"category",
		"items",
	}

	def validate_expense(self, data):
		"""
		Validate the given data against the required fields and types.
		"""

		if data is None:
			return False, "Invalid JSON"

		missing = (
			self.REQUIRED_FIELDS - data.keys()
		)

		# if there are missing fields, return False with a message listing them
		if missing:
			return False, (
				"Missing fields: "
				+ ", ".join(sorted(missing))
			)

		# if any of the required fields are not of the expected type, return False with a message
		if not isinstance(data["items"], list):
			return False, "items must be a list"

		return True, None


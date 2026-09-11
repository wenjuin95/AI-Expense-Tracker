EXPENSES_PROMPT = """
Analyze the receipt image and return ONLY one JSON object.

Extract every purchased product row in the items array. Count the rows before
the subtotal or total section. Do not skip, merge, rename, or invent items.

Use null when a value cannot be read.
All prices and quantities must be JSON numbers, never strings.
Use currency separately, for example currency: "RM", total: 108.80.
Date must be in ISO 8601 format, for example "2023-08-15".
Get discount and tax if available, otherwise use null.

Required fields:
merchant, date, currency, subtotal, discount, tax, total, amount_paid,
payment_method, category, items.

Each item requires:
name, quantity, price.

Category must be one of:
food, transport, entertainment.

Do not include subtotal, tax, total, or payment rows in items.
"""

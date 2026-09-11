from typing import Optional

from pydantic import BaseModel, Field


class ExpenseItemCreate(BaseModel):

	name: Optional[str] = None
	quantity: Optional[float] = None
	price: Optional[float] = None


class ExpenseCreate(BaseModel):

	merchant: Optional[str] = None
	date: Optional[str] = None
	currency: Optional[str] = None

	subtotal: Optional[float] = None
	discount: Optional[float] = None
	tax: Optional[float] = None
	total: Optional[float] = None
	amount_paid: Optional[float] = None

	payment_method: Optional[str] = None
	category: Optional[str] = None

	items: list[ExpenseItemCreate] = Field(
		default_factory=list
	)

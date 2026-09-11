from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from datetime import datetime

from backend.app.database.database import Base


class Expense(Base):

    __tablename__ = "expenses"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    merchant = Column(
        String,
        nullable=True,
    )

    date = Column(
        Date,
        nullable=True,
    )

    currency = Column(
        String,
        nullable=True,
    )

    subtotal = Column(
        Float,
        nullable=True,
    )

    discount = Column(
        Float,
        nullable=True,
    )

    tax = Column(
        Float,
        nullable=True,
    )

    total = Column(
        Float,
        nullable=True,
    )

    amount_paid = Column(
        Float,
        nullable=True,
    )

    payment_method = Column(
        String,
        nullable=True,
    )

    category = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    items = relationship(
        "ExpenseItem",
        back_populates="expense",
        cascade="all, delete-orphan",
    )



class ExpenseItem(Base):

    __tablename__ = "expense_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    expense_id = Column(
        Integer,
        ForeignKey("expenses.id"),
        nullable=False,
    )

    name = Column(
        String,
        nullable=True,
    )

    quantity = Column(
        Float,
        nullable=True,
    )

    price = Column(
        Float,
        nullable=True,
    )

    expense = relationship(
        "Expense",
        back_populates="items",
    )

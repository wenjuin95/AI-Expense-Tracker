import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpense } from "../api/expenseApi";
import type { ExpenseFullDetail } from "../types/expenses";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expense, setExpense] = useState<ExpenseFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Expense ID is missing");
      setLoading(false);
      return;
    }

    const expenseId = Number(id);

    if (Number.isNaN(expenseId)) {
      setError("Invalid expense ID");
      setLoading(false);
      return;
    }

    async function loadExpense() {
      try {
        setLoading(true);
        setError(null);

        const data = await getExpense(expenseId);

        setExpense(data);
      } catch (err) {
        console.error("Failed to load expense:", err);
        setError("Failed to load expense");
      } finally {
        setLoading(false);
      }
    }

    loadExpense();
  }, [id]);

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <div>
        <p>Loading expense...</p>
      </div>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------

  if (error) {
    return (
      <div>
        <h1>Error</h1>

        <p>{error}</p>

        <button onClick={() => navigate("/expenses")}>
          ← Back to expenses
        </button>
      </div>
    );
  }

  // -----------------------------
  // No expense
  // -----------------------------

  if (!expense) {
    return (
      <div>
        <h1>Expense not found</h1>

        <button onClick={() => navigate("/expenses")}>
          ← Back to expenses
        </button>
      </div>
    );
  }

  // -----------------------------
  // Expense detail
  // -----------------------------

  return (
    <div>

      {/* Header */}

      <div>
        <button onClick={() => navigate("/expenses")}>
          ← Back
        </button>

        <h1>
          {expense.merchant ?? "Unknown Merchant"}
        </h1>

        <p>
          {expense.date ?? "No date"}
        </p>

        <p>
        </p>
      </div>


      {/* Expense Information */}

      <section>
        <h2>Expense Information</h2>

        <div>
          <strong>Merchant</strong>
          <p>{expense.merchant ?? "-"}</p>
        </div>

        <div>
          <strong>Date</strong>
          <p>{expense.date ?? "-"}</p>
        </div>

        <div>
          <strong>Currency</strong>
          <p>{expense.currency ?? "-"}</p>
        </div>

        <div>
          <strong>Category</strong>
          <p>{expense.category ?? "-"}</p>
        </div>

        <div>
          <strong>Payment Method</strong>
          <p>{expense.payment_method ?? "-"}</p>
        </div>
      </section>


      {/* Items */}

      <section>
        <h2>Items</h2>

        {expense.items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>

            <tbody>
              {expense.items.map((item) => (
                <tr key={item.id}>

                  <td>
                    {item.name ?? "-"}
                  </td>

                  <td>
                    {item.quantity ?? "-"}
                  </td>

                  <td>
                    {item.price ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>


      {/* Summary */}

      <section>
        <h2>Summary</h2>

        <div>
          <span>Subtotal</span>
          <span>
            {expense.subtotal ?? "-"}
          </span>
        </div>

        <div>
          <span>Discount</span>
          <span>
            {expense.discount ?? "-"}
          </span>
        </div>

        <div>
          <span>Tax</span>
          <span>
            {expense.tax ?? "-"}
          </span>
        </div>

        <div>
          <span>Total</span>
          <strong>
            {expense.total ?? "-"}
          </strong>
        </div>

        <div>
          <span>Amount Paid</span>
          <span>
            {expense.amount_paid ?? "-"}
          </span>
        </div>
      </section>

    </div>
  );
}


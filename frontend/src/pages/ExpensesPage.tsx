import { useEffect, useState } from "react";
import { getExpenses, getExpense, deleteExpense } from "../api/expenseApi";
import type { Expense, ExpenseDetail} from "../types/expenses";
import Popup from "../components/Popup";
import ExpensePieChart from "../components/ExpenseChart";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setExpenses(await getExpenses());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, []);

  const handleExpand = async (id: number) => {
    if (expandedId === id) return setExpandedId(null), setSelectedExpense(null);
    try {
      setExpandedId(id);
      setDetailLoading(true);
      setSelectedExpense(await getExpense(id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load details.");
      setExpandedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense(id);
      setExpenses(curr => curr.filter(e => e.id !== id));
      if (expandedId === id) setExpandedId(null), setSelectedExpense(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading expenses...</div>;

  return (
    <div className="space-y-6">

      <Popup
        open={showDeletePopup}
        type="cancel"
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        onOk={async () => {
            if (deleteId === null) return;
            await handleDelete(deleteId);
            setDeleteId(null);
            setShowDeletePopup(false);
        }}
        onCancel={() => {
            setDeleteId(null);
            setShowDeletePopup(false)
        }}
        okLabel="Delete"
        cancelLabel="Cancel"
      />

      <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>

      <ExpensePieChart expenses={expenses} />

      {expenses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">No expenses yet.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                {/* Removed the empty th for the arrow column */}
                <th className="p-4">Merchant</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100">
              {expenses.map(expense => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  expanded={expandedId === expense.id}
                  detail={expandedId === expense.id ? selectedExpense : null}
                  loading={expandedId === expense.id && detailLoading}
                  onExpand={handleExpand}
                  onDelete={(id: number) => {
                    setDeleteId(id);
                    setShowDeletePopup(true);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpenseRow({
    expense,
    expanded,
    detail,
    loading,
    onExpand,
    onDelete
}: any) {
  return (
    <>
      {/* Removed onClick and cursor-pointer from the row */}
      <tr className="block md:table-row p-4 md:p-0 hover:bg-slate-50/80 transition-colors">

        {/* Merchant */}
        <td className="flex md:table-cell justify-between items-center md:p-4 font-semibold text-slate-800 mb-2 md:mb-0">
            <div className="flex items-center gap-2">
                {/* Removed mobile arrow indicator */}
                {expense.merchant ?? "-"}
            </div>
            {/* Mobile Total */}
            <span className="md:hidden font-bold text-blue-600">
                {expense.currency ?? ""} {expense.total ?? "-"}
            </span>
        </td>

        {/* Date */}
        <td className="flex md:table-cell justify-between items-center md:p-4 text-slate-600 mb-2 md:mb-0">
            <span className="md:hidden text-slate-400 text-xs">Date</span>
            <span>{expense.date ?? "-"}</span>
        </td>

        {/* Category */}
        <td className="flex md:table-cell justify-between items-center md:p-4 mb-3 md:mb-0">
            <span className="md:hidden text-slate-400 text-xs">Category</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                {expense.category ?? "-"}
            </span>
        </td>

        {/* Total (Desktop) */}
        <td className="hidden md:table-cell p-4 font-bold text-blue-600">
            {expense.currency ?? ""} {expense.total ?? "-"}
        </td>

        {/* Actions - Now includes "More" and "Delete" side by side */}
        <td className="block md:table-cell mt-3 pt-3 border-t border-slate-100 md:border-none md:mt-0 md:pt-0 md:p-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onExpand(expense.id)}
              className="px-4 py-2 md:px-3 md:py-1.5 md:w-auto bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm md:text-xs font-medium transition-colors"
            >
              {expanded ? "Less" : "More"}
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="px-4 py-2 md:px-3 md:py-1.5 md:w-auto bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm md:text-xs font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Row */}
      {expanded && (
        <tr className="block md:table-row bg-slate-50/50">
          {/* Changed colSpan from 6 to 5 since we removed the arrow column */}
          <td colSpan={5} className="block md:table-cell p-0 md:p-4 border-t border-slate-100 md:border-none">
            <div className="p-4 md:p-2">
              {loading ? (
                  <p className="text-slate-400 text-sm">Loading details...</p>
              ) : (
                  detail && <ExpenseDetail expense={detail} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ExpenseDetail({ expense }: { expense: ExpenseDetail }) {
  return (
    <div className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
        <div><span className="text-xs text-slate-400 block">Payment Method</span><span className="font-medium text-slate-700">{expense.payment_method ?? "-"}</span></div>
        <div><span className="text-xs text-slate-400 block">Tax</span><span className="font-medium text-slate-700">{expense.tax ?? 0}</span></div>
        <div><span className="text-xs text-slate-400 block">Discount</span><span className="font-medium text-slate-700">{expense.discount ?? 0}</span></div>
        <div><span className="text-xs text-slate-400 block">Total</span><span className="font-medium text-slate-700">{expense.total ?? "-"}</span></div>
      </div>

      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm">Line Items</h3>
        {expense.items.length === 0 ? (
          <p className="text-slate-400 text-sm">No items found.</p>
        ) : (
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="hidden md:table-header-group bg-slate-100 text-slate-500">
                <tr>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Price</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-slate-100">
                {expense.items.map((item: any) => (
                  <tr key={item.id} className="block md:table-row p-3 md:p-0 hover:bg-slate-50">
                    <td className="flex md:table-cell justify-between items-center md:p-2.5 font-medium text-slate-800 mb-1 md:mb-0">
                        <span>{item.name ?? "-"}</span>
                        <span className="md:hidden font-bold text-slate-700">RM {item.price ?? "-"}</span>
                    </td>
                    <td className="flex md:table-cell justify-between items-center md:p-2.5 text-slate-600">
                        <span className="md:hidden text-slate-400">Qty</span>
                        <span>{item.quantity ?? "-"}</span>
                    </td>
                    <td className="hidden md:table-cell p-2.5 text-slate-600">RM {item.price ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

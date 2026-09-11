import { useEffect, useState } from "react";
import { getExpenses, getExpense, deleteExpense } from "../api/expenseApi";
import type { Expense, ExpenseDetail} from "../types/expenses";
import Popup from "../components/Popup";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
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
			onOk={() => {
				handleDelete(expandedId!);
				setShowDeletePopup(false);
			}}
			onCancel={() => setShowDeletePopup(false)}
			okLabel="Delete"
			cancelLabel="Cancel"
	  />
      <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
      {expenses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">No expenses yet.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">Merchant</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(expense => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  expanded={expandedId === expense.id}
                  detail={expandedId === expense.id ? selectedExpense : null}
                  loading={expandedId === expense.id && detailLoading}
                  onExpand={handleExpand}
                  onDelete={() => setShowDeletePopup(true)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpenseRow({ expense, expanded, detail, loading, onExpand, onDelete }: any) {
  return (
    <>
      <tr onClick={() => onExpand(expense.id)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
        <td className="p-4 text-slate-400 font-mono">{expanded ? "▼" : "▶"}</td>
        <td className="p-4 font-semibold text-slate-800">{expense.merchant ?? "-"}</td>
        <td className="p-4 text-slate-600">{expense.date ?? "-"}</td>
        <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{expense.category ?? "-"}</span></td>
        <td className="p-4 font-bold text-blue-600">{expense.currency ?? ""} {expense.total ?? "-"}</td>
        <td className="p-4 text-right">
          <button onClick={e => (e.stopPropagation(), onDelete(expense.id))} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors">Delete</button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={6} className="p-6">
            {loading ? <p className="text-slate-400 text-sm">Loading details...</p> : detail && <ExpenseDetail expense={detail} />}
          </td>
        </tr>
      )}
    </>
  );
}

function ExpenseDetail({ expense }: { expense: ExpenseDetail }) {
  return (
    <div className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
        <div><span className="text-xs text-slate-400 block">Payment Method</span><span className="font-medium text-slate-700">{expense.payment_method ?? "-"}</span></div>
        <div><span className="text-xs text-slate-400 block">Tax</span><span className="font-medium text-slate-700">{expense.tax ?? 0}</span></div>
        <div><span className="text-xs text-slate-400 block">Discount</span><span className="font-medium text-slate-700">{expense.discount ?? 0}</span></div>
        <div><span className="text-xs text-slate-400 block">Total</span><span className="font-medium text-slate-700">{expense.subtotal ?? "-"}</span></div>
      </div>

      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm">Line Items</h3>
        {expense.items.length === 0 ? (
          <p className="text-slate-400 text-sm">No items found.</p>
        ) : (
          <table className="w-full text-left text-xs border border-slate-100 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
				<th className="p-2.5">Item</th>
				<th className="p-2.5">Qty</th>
				<th className="p-2.5">Price</th>
				</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expense.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-800">{item.name ?? "-"}</td>
                  <td className="p-2.5 text-slate-600">{item.quantity ?? "-"}</td>
                  <td className="p-2.5 text-slate-600">RM {item.price ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

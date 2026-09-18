import { useState } from "react";
import { saveExpense } from "../api/expenseApi";
import PreventRefresh from "../components/PreventRefresh";
import Popup from "../components/Popup";
import type {
    ScanResponse,
    ExpenseData,
    ExpenseItem,
} from "../types/expenses";

interface ReviewReceiptProps {
    result: ScanResponse;
    index: number;
    total: number;
    onComplete: () => void;
}

export default function ReviewReceipt({
    result,
    index,
    total,
    onComplete,
}: ReviewReceiptProps) {
    const [saved, setSaved] = useState(false);
    const [discarded, setDiscarded] = useState(false);


    const handleDiscard = () => {
        setDiscarded(true);
        onComplete();
    };

    const [draft, setDraft] = useState<ExpenseData>(() => {
        const data = result.data;

        if (!data) {
            return {
                merchant: null,
                date: null,
                currency: null,
                subtotal: null,
                discount: null,
                tax: null,
                total: null,
                amount_paid: null,
                payment_method: null,
                category: null,
                items: [],
            };
        }

        return {
            merchant: data.merchant ?? null,
            date: data.date ?? null,
            currency: data.currency ?? null,
            subtotal: data.subtotal ?? null,
            discount: data.discount ?? null,
            tax: data.tax ?? null,
            total: data.total ?? null,
            amount_paid: data.amount_paid ?? null,
            payment_method: data.payment_method ?? null,
            category: data.category ?? null,
            items: data.items.map((item) => ({
                id: item.id,
                name: item.name ?? null,
                quantity: item.quantity ?? null,
                price: item.price ?? null,
            })),
        };
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    const updateField = (
        field: keyof ExpenseData,
        value: string | number | null
    ) => {
        setDraft((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateItem = (
        index: number,
        field: keyof ExpenseItem,
        value: string | number | null
    ) => {
        setDraft((current) => {
            const items = [...current.items];

            items[index] = {
                ...items[index],
                [field]: value,
            };

            return {
                ...current,
                items,
            };
        });
    };

    const addItem = () => {
        setDraft((current) => ({
            ...current,
            items: [
                ...current.items,
                {
                    name: "",
                    quantity: 1,
                    price: 0,
                },
            ],
        }));
    };

    const removeItem = (index: number) => {
        setDraft((current) => ({
            ...current,
            items: current.items.filter(
                (_, itemIndex) => itemIndex !== index
            ),
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            await saveExpense(draft);
            setSaved(true);
            onComplete();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to save expense."
            );
        } finally {
            setSaving(false);
        }
    };

    // Render the replacement board if processed
    if (saved || discarded) {
        return (
            <div className="w-full h-full">
                <div className="h-full min-h-[300px] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
                    <span className={`px-5 py-2 rounded-full font-bold text-lg ${saved ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {saved ? "Saved" : "Cancelled"}
                    </span>
                    <p className="text-sm text-slate-500 mt-4">
                        Receipt {index + 1} of {total}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <PreventRefresh enabled />

            <Popup
                open={showDiscardPopup}
                type="cancel"
                title="Discard Receipt?"
                message={`Are you sure you want to discard Receipt ${index + 1}?`}
                onOk={() => {
                    setShowDiscardPopup(false);
                    handleDiscard();
                }}
                onCancel={() => setShowDiscardPopup(false)}
                okLabel="Discard"
            />

            <Popup
                open={Boolean(error)}
                type="error"
                title="Save Error"
                message={error ?? ""}
                onOk={() => setError(null)}
            />

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">
                        Receipt {index + 1}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        OCR results may contain mistakes. Please check the
                        information before saving.
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        {index + 1} / {total}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Expense Information */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                            Expense Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Merchant */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Merchant
                                </label>

                                <input
                                    type="text"
                                    value={draft.merchant ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "merchant",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    value={draft.date ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "date",
                                            e.target.value || null
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Currency
                                </label>

                                <input
                                    type="text"
                                    value={draft.currency ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "currency",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Category
                                </label>

                                <select
                                    value={draft.category ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "category",
                                            e.target.value === ""
                                                ? null
                                                : e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="" disabled>
                                        Select a category...
                                    </option>

                                    <option value="food">
                                        Food
                                    </option>

                                    <option value="transport">
                                        Transport
                                    </option>

                                    <option value="entertainment">
                                        Entertainment
                                    </option>
                                </select>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Payment Method
                                </label>

                                <input
                                    type="text"
                                    value={draft.payment_method ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "payment_method",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Amounts */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                            Amounts
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Subtotal */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Subtotal
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.subtotal ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "subtotal",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            {/* Discount */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Discount
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.discount ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "discount",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            {/* Tax */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Tax
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.tax ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "tax",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            {/* Total */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Total
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.total ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "total",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                                />
                            </div>

                            {/* Amount Paid */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Amount Paid
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.amount_paid ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "amount_paid",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Items */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Items
                            </h3>

                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-blue-600 font-medium hover:text-blue-700"
                            >
                                + Add Item
                            </button>
                        </div>

                        {draft.items.length === 0 ? (
                            <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-sm text-slate-400">
                                No items found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {draft.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-slate-200 rounded-lg p-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            {/* Item */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                                    Item
                                                </label>

                                                <input
                                                    type="text"
                                                    value={item.name ?? ""}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                                    Quantity
                                                </label>

                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={
                                                        item.quantity ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "quantity",
                                                            e.target.value ===
                                                                ""
                                                                ? null
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  )
                                                        )
                                                    }
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            {/* Price */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                                    Price
                                                </label>

                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price ?? ""}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "price",
                                                            e.target.value ===
                                                                ""
                                                                ? null
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  )
                                                        )
                                                    }
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            {/* Remove */}
                                            <div className="md:col-span-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* OCR Warning */}
                    {!result.valid && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-sm font-medium text-amber-800">
                                ⚠️ OCR validation warning
                            </p>

                            {result.validation_error && (
                                <p className="text-sm text-amber-700 mt-1">
                                    {result.validation_error}
                                </p>
                            )}

                            <p className="text-xs text-amber-600 mt-1">
                                You can correct the information above before
                                saving.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setShowDiscardPopup(true)}
                            disabled={saving}
                            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        >
                            Discard
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saved ? "Saved" : saving ? "Saving..." : "Save Expense"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


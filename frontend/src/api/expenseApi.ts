import type {
	ScanResponse,
	BatchScanResponse,
	SaveExpenseRequest,
	SaveExpenseResponse,
	Expense,
	ExpenseDetail,
} from "../types/expenses";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// ============================================================
// Upload / Scan Receipt
// ============================================================

export async function uploadReceipt(
	file: File
): Promise<ScanResponse> {

	const formData = new FormData();

	formData.append("file", file);

	const response = await fetch(
		`${API_BASE_URL}/expenses/scan`,
		{
			method: "POST",
			body: formData,
		}
	);

	if (!response.ok) {

		let message = "Failed to process receipt.";

		try {

			const error = await response.json();

			message =
				error.detail ||
				message;

		} catch {
			// Keep default error message
		}

		throw new Error(message);
	}

	return response.json();
}

// ============================================================
// Upload / Scan Receipt Batch
// ============================================================
export async function uploadReceiptsBatch(
    files: File[]
): Promise<BatchScanResponse> {

    const formData = new FormData();

    for (const file of files) {
        formData.append("files", file);
    }

    const response = await fetch(
        `${API_BASE_URL}/expenses/scan/batch`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        let message = "Failed to process receipts.";

        try {
            const error = await response.json();
            message = error.detail || message;
        } catch {}

        throw new Error(message);
    }

    return response.json();
}


// ============================================================
// Save Expense
// ============================================================

export async function saveExpense(
	data: SaveExpenseRequest
): Promise<SaveExpenseResponse> {

	const response = await fetch(
		`${API_BASE_URL}/expenses`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		}
	);

	if (!response.ok) {

		let message = "Failed to save expense.";

		try {

			const error = await response.json();

			message =
				error.detail ||
				message;

		} catch {
			// Keep default error message
		}

		throw new Error(message);
	}

	return response.json();
}


// ============================================================
// Get All Expenses
// ============================================================

export async function getExpenses(): Promise<Expense[]> {

	const response = await fetch(
		`${API_BASE_URL}/expenses`
	);

	if (!response.ok) {

		throw new Error(
			"Failed to load expenses."
		);
	}

	return response.json();
}


// ============================================================
// Get Expense
// ============================================================

export async function getExpense(
	id: number
): Promise<ExpenseDetail> {

	const response = await fetch(
		`${API_BASE_URL}/expenses/${id}`
	);

	if (!response.ok) {

		throw new Error(
			"Failed to load expense details."
		);
	}

	return response.json();
}


// ============================================================
// Delete Expense
// ============================================================

export async function deleteExpense(
	id: number
): Promise<void> {

	const response = await fetch(
		`${API_BASE_URL}/expenses/${id}`,
		{
			method: "DELETE",
		}
	);

	if (!response.ok) {

		let message =
			"Failed to delete expense.";

		try {

			const error = await response.json();

			message =
				error.detail ||
				message;

		} catch {
			// Keep default error
		}

		throw new Error(message);
	}
}

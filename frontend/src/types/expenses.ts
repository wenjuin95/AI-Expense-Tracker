export interface ExpenseItem {
	id?: number;
	name: string | null;
	quantity: number | null;
	price: number | null;
}


export interface ExpenseData {
	merchant: string | null;
	date: string | null;
	currency: string | null;

	subtotal: number | null;
	discount: number | null;
	tax: number | null;
	total: number | null;
	amount_paid: number | null;

	payment_method: string | null;
	category: string | null;

	items: ExpenseItem[];
}


export interface ScanResponse {
	success: boolean;

	data: ExpenseData | null;

	valid: boolean;

	saved: boolean;

	validation_error: string | null;

	model?: string | null;
	model_id?: string | null;
	time_seconds?: number | null;

	error?: string | null;
}


export interface SaveExpenseRequest
	extends ExpenseData {}


export interface SaveExpenseResponse {
	success: boolean;
	saved: boolean;
	expense_id: number;
}


export interface Expense {
	id: number;

	merchant: string | null;
	date: string | null;
	currency: string | null;
	total: number | null;
	category: string | null;
}


export interface ExpenseDetail
	extends Expense {

	subtotal: number | null;
	discount: number | null;
	tax: number | null;
	amount_paid: number | null;

	payment_method: string | null;

	items: ExpenseItem[];
}

export interface ExpenseFullDetail {
	id: number;
	merchant: string | null;
	date: string | null;
	currency: string | null;
	subtotal: number | null;
	discount: number | null;
	tax: number | null;
	total: number | null;
	amount_paid: number | null;
	payment_method: string | null;
	category: string | null;
	items: ExpenseItem[];
}

export interface BatchScanResult extends ScanResponse {
    original_filename?: string;
    batch_id?: string;
}

export interface BatchScanResponse {
    success: boolean;
    batch_id: string;
    total: number;
    successful: number;
    failed: number;
    results: BatchScanResult[];
}

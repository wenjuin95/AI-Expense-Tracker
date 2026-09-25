import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { uploadReceiptsBatch } from "../api/expenseApi";
import type { ScanResponse } from "../types/expenses";
import PreventRefresh from "../components/PreventRefresh";
import Popup from "../components/Popup";
import BatchReviewPage from "./BatchReview";

export default function UploadPage() {
    const [files, setFiles] = useState<File[] | null>(null);
    const [results, setResults] = useState<ScanResponse[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFiles = Array.from(event.target.files ?? []);

        if (selectedFiles.length === 0) return;

        setFiles((prevFiles) => (prevFiles ? [...prevFiles, ...selectedFiles] : selectedFiles));
        setResults(null);
        setError(null);

        event.target.value = "";
    };

    const handleUpload = async () => {
        if (!files || files.length === 0) {
            setError("Please select at least one receipt.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const batch = await uploadReceiptsBatch(files);
            setResults(batch.results);

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("Failed to fetch")) {
                    setError("To request testing access for the app, please email Low Wen Juin at lowwenjuin27@gmail.com.");
                } else {
                    setError(error.message);
                }
            } else {
                setError("Failed to process receipts.");
            }
        } finally {
            setLoading(false);
        }
    };

    // If OCR is complete, render the review component
    if (results && results.length > 0) {
        return (
            <BatchReviewPage
                results={results}
                setResults={setResults}
                setFiles={setFiles}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PreventRefresh enabled={Boolean(files?.length || results?.length)} />
            <Popup
                open={Boolean(error)}
                type="error"
                title="Upload Error"
                message={error ?? ""}
                onOk={() => setError(null)}
            />
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Upload Receipt</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Upload a receipt and review the extracted information before saving.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50 relative">
                    <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 pointer-events-none">
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                            ↑
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">PNG, JPG, WEBP or PDF</p>
                    </div>
                </div>

                {files && files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-sm"
                            >
                                <span className="font-medium text-slate-700 truncate max-w-xs">
                                    {file.name}
                                </span>

                                <span className="text-xs text-slate-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFiles((prevFiles) => prevFiles?.filter((_, i) => i !== index) ?? null);
                                    }}
                                    aria-label={`Remove ${file.name}`}
                                    title="Remove receipt"
                                    className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!files || loading}
                    className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing Receipt...
                        </span>
                    ) : (
                        "Process Receipt"
                    )}
                </button>
            </div>

        </div>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ScanResponse } from "../types/expenses";
import ReviewReceipt from "../pages/ReviewPage";

interface BatchReviewPageProps {
    results: ScanResponse[];
    setResults: React.Dispatch<React.SetStateAction<ScanResponse[] | null>>;
    setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
}

export default function BatchReviewPage({
    results,
    setResults,
    setFiles,
}: BatchReviewPageProps) {
    const navigate = useNavigate();
	const [processedCount, setProcessedCount] = useState(0);

	const handleReceiptComplete = () => {
        setProcessedCount((prevCount) => {
            const newCount = prevCount + 1;

            // If all receipts have been processed (saved or cancelled)
            if (newCount === results.length) {
                // Add a small delay so the user can see the final "Saved" or "Cancelled" UI
                setTimeout(() => {
                    setResults(null);
                    setFiles(null);
                    // Redirect to the expense overview page
                    navigate("/");
                }, 1000);
            }

            return newCount;
        });
    }

    if (results.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <p className="text-slate-500">
                    No receipts to review.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Review Receipts
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    Review each receipt before saving it.
                </p>
            </div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				{results.map((result, index) => (
					<ReviewReceipt
						key={index}
						result={result}
						index={index}
						total={results.length}
						onComplete={handleReceiptComplete}
					/>
				))}
			</div>
        </div>
    );
}

import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import type { CategoryData, ExpensePieChartProps } from "../types/expenses";


export default function ExpensePieChart({
	expenses,
}: ExpensePieChartProps) {

	const categoryColors: Record<string, string> = {
		food: "#f97316",
		transport: "#3b82f6",
		entertainment: "#a855f7",
	}

	// dashboard chart data
	const categoryTotals = expenses.reduce<Record<string, number>>(
		(totals, expense) => {
			const category = expense.category ?? "Uncategorized";
			const total = expense.total ?? 0;

			totals[category] = (totals[category] ?? 0) + total;

			return totals;
		},
		{}
	);

	// Convert the categoryTotals object into an array of CategoryData
	const data: CategoryData[] = Object.entries(categoryTotals).map(
		([name, value]) => ({
			name,
			value,
		})
	);

	// Calculate the total expenses for percentage calculations
	const totalExpenses = data.reduce(
		(sum, category) => sum + category.value,
		0
	);

	if (data.length === 0) {
		return (
			<div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
				<h2 className="text-lg font-bold text-slate-900">
					Expense Overview
				</h2>

				<div className="h-64 flex items-center justify-center text-sm text-slate-400">
					No expense data available.
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
			<div className="mb-4">
				<h2 className="text-lg font-bold text-slate-900">
					Expense Overview
				</h2>

				<p className="text-sm text-slate-500 mt-1">
					Spending by category
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

				{/* Pie Chart */}
				<div className="h-72">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								outerRadius={100}
								innerRadius={55}
								paddingAngle={2}
							>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={
											categoryColors[entry.name.toLowerCase()] ?? "#64748b"
										}
									/>
								))}
							</Pie>

							<Tooltip
								formatter={(value) =>
									`RM ${Number(value).toFixed(2)}`
								}
							/>

							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Summary */}
				<div className="space-y-4">

					<div className="bg-slate-50 rounded-lg p-4">
						<p className="text-xs text-slate-400 uppercase tracking-wide">
							Total Expenses
						</p>

						<p className="text-2xl font-bold text-slate-900 mt-1">
							RM {totalExpenses.toFixed(2)}
						</p>
					</div>

					<div className="space-y-3">
						{data.map((category) => {
							const percentage =
								totalExpenses > 0
									? (category.value / totalExpenses) * 100
									: 0;

							return (
								<div
									key={category.name}
									className="flex items-center justify-between"
								>
									<div>
										<p className="text-sm font-medium text-slate-700">
											{category.name}
										</p>

										<p className="text-xs text-slate-400">
											{percentage.toFixed(1)}%
										</p>
									</div>

									<p className="text-sm font-semibold text-slate-800">
										RM {category.value.toFixed(2)}
									</p>
								</div>
							);
						})}
					</div>

				</div>
			</div>
		</div>
	);
}

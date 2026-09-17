import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold tracking-wide mb-8">Expense Tracker</h1>

        <nav className="flex flex-col space-y-2">
          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Expenses Overview
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Upload Receipt
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

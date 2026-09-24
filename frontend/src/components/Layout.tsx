import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-gray-100 overflow-hidden w-full">

      {/* Mobile Overlay - Darkens the background when menu is open on phones */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col p-6 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold tracking-wide">Expense Tracker</h1>

          {/* Close button (only visible on mobile) */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          <NavLink
            to="/expenses"
            onClick={() => setIsSidebarOpen(false)} // Auto-close menu after clicking on mobile
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
            onClick={() => setIsSidebarOpen(false)} // Auto-close menu after clicking on mobile
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

      {/* Main content wrapper */}
      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Mobile Header with Hamburger Button (Only visible on small screens) */}
        <header className="sticky top-0 z-30 flex-none md:hidden flex items-center bg-white p-4 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 mr-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-800">Expense Tracker</h2>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

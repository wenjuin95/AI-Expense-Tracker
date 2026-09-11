import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";

import UploadPage from "./pages/UploadPage";
import ExpensesPage from "./pages/ExpensesPage";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Dashboard */}
        <Route element={<Layout />}>

          {/* / */}
          <Route
            path="/"
            element={
              <Navigate
                to="/expenses"
                replace
              />
            }
          />

          {/* /expenses */}
          <Route
            path="/expenses"
            element={<ExpensesPage />}
          />

          {/* /upload */}
          <Route
            path="/upload"
            element={<UploadPage />}
          />

        </Route>

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/expenses"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

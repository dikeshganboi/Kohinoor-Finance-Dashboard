import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import useStore from "./store/useStore";

/**
 * App — Root layout component
 *
 * Navigation:
 *   React Router handles page routing via URL.
 *   Navbar uses NavLink for tab highlighting.
 *   Role + transactions live in the Zustand store — no prop drilling.
 */
function App() {
  const theme = useStore((s) => s.theme);

  // Sync .dark class on <html> whenever theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <Toast />

      <main className="flex-1 p-4 md:px-10 md:py-8 max-w-[1400px] mx-auto w-full">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

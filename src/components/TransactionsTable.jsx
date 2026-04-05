import { useState, useMemo } from "react";
import useStore from "../store/useStore";
import TransactionModal from "./TransactionModal";

/**
 * TransactionsTable — Filterable, searchable, sortable table
 *
 * Store:
 *   transactions, role, addTransaction, deleteTransaction
 *   all read from the Zustand store — no props needed.
 *
 * Features:
 *   1. Search — filters by category name (case-insensitive)
 *   2. Filter — dropdown: All / Income / Expense
 *   3. Sort   — by date or amount, toggles ascending ↔ descending
 *
 * Architecture:
 *   Store data → filter by type → filter by search → sort → render
 *   All transformations happen in a single useMemo for performance.
 */

// ─── Sort indicator arrow ────────────────────────────────────
function SortArrow({ column, sortConfig }) {
  if (sortConfig.key !== column) return null;
  return (
    <span className="ml-1 text-emerald-500">
      {sortConfig.direction === "asc" ? "▲" : "▼"}
    </span>
  );
}

function TransactionsTable() {
  // ─── Zustand store ─────────────────────────────────────────
  const transactions = useStore((s) => s.transactions);
  const role = useStore((s) => s.role);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const addToast = useStore((s) => s.addToast);

  // ─── Local UI state ────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [page, setPage] = useState(1);

  const ROWS_PER_PAGE = 10;
  const isAdmin = role === "admin";

  // ─── Derived: filtered + sorted data ───────────────────────
  const processedData = useMemo(() => {
    let result = [...transactions];

    // Step 1: Filter by date range
    if (dateFilter !== "all") {
      const now = new Date();
      let start, end;
      if (dateFilter === "this-month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (dateFilter === "last-month") {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      }
      result = result.filter((tx) => {
        const d = new Date(tx.date);
        return d >= start && d <= end;
      });
    }

    // Step 2: Filter by type (income / expense / all)
    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    // Step 2: Filter by search term (matches category)
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((tx) =>
        tx.category.toLowerCase().includes(term)
      );
    }

    // Step 3: Sort by the active column
    result.sort((a, b) => {
      let comparison = 0;

      if (sortConfig.key === "date") {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortConfig.key === "amount") {
        comparison = a.amount - b.amount;
      }

      // Flip for descending
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, search, typeFilter, dateFilter, sortConfig]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(processedData.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedData = processedData.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  // ─── Sort handler ──────────────────────────────────────────
  // Clicking the same column toggles direction; new column defaults to asc
  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  // ─── Format helpers ────────────────────────────────────────
  function formatDate(iso) {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function relativeTime(iso) {
    const now = Date.now();
    const diff = now - new Date(iso).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  function formatAmount(amount, type) {
    const sign = type === "income" ? "+" : "-";
    return `${sign} ₹${amount.toLocaleString("en-IN")}`;
  }

  return (
    <div className="space-y-4">
      {/* ─── Controls row: search + filter + admin add button ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by category..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600
                     bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800
                     focus:border-emerald-300 dark:focus:border-emerald-600 transition-all"
        />

        {/* Type filter dropdown */}
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600
                     bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                     focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800
                     focus:border-emerald-300 dark:focus:border-emerald-600 transition-all"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Date filter dropdown */}
        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600
                     bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                     focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800
                     focus:border-emerald-300 dark:focus:border-emerald-600 transition-all"
        >
          <option value="all">All Time</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
        </select>

        {/* Admin-only: Add Transaction button */}
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500
                       text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600
                       transition-all shadow-sm hover:shadow-md shrink-0"
          >
            + Add Transaction
          </button>
        )}
      </div>

      {/* ─── Table with horizontal scroll on mobile ─── */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full text-sm">
          {/* Table header — clickable columns trigger sorting */}
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-left text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <th
                onClick={() => handleSort("date")}
                className="px-5 py-3 font-medium cursor-pointer hover:text-emerald-600 transition-colors"
              >
                Date <SortArrow column="date" sortConfig={sortConfig} />
              </th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th
                onClick={() => handleSort("amount")}
                className="px-5 py-3 font-medium cursor-pointer hover:text-emerald-600 transition-colors"
              >
                Amount <SortArrow column="amount" sortConfig={sortConfig} />
              </th>
              <th className="px-5 py-3 font-medium">Type</th>
              {isAdmin && <th className="px-5 py-3 font-medium">Action</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {pagedData.length > 0 ? (
              pagedData.map((tx) => (
                <tr
                  key={tx.id}
                  className="odd:bg-white even:bg-slate-50/50
                             dark:odd:bg-slate-800 dark:even:bg-slate-800/50
                             hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10
                             transition-all duration-150 origin-left"
                >
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="text-slate-600 dark:text-slate-400">{formatDate(tx.date)}</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500">{relativeTime(tx.date)}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-medium">
                    {tx.category}
                  </td>
                  <td
                    className={`px-5 py-3 font-semibold whitespace-nowrap ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {formatAmount(tx.amount, tx.type)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === "income"
                          ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>

                  {/* Admin-only: Edit + Delete buttons */}
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setModalOpen(true);
                          }}
                          className="text-xs font-medium text-emerald-600 dark:text-emerald-400
                                     hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline
                                     transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete?")) {
                              deleteTransaction(tx.id);
                              addToast("Transaction deleted");
                            }
                          }}
                          className="text-xs font-medium text-rose-500
                                     hover:text-rose-700 hover:underline
                                     transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              /* ─── Empty state ─── */
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="px-5 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination + result count ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {processedData.length === 0
            ? "No transactions found"
            : `Showing ${(safePage - 1) * ROWS_PER_PAGE + 1}–${Math.min(safePage * ROWS_PER_PAGE, processedData.length)} of ${processedData.length} results`}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Page {safePage} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        editingTx={editingTx}
      />
    </div>
  );
}

export default TransactionsTable;

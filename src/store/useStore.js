import { create } from "zustand";
import initialTransactions from "../data/transactions";

const STORAGE_KEY = "bank_dashboard_transactions";
const THEME_KEY = "bank_dashboard_theme";
const ROLE_KEY = "bank_dashboard_role";

const loadTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* corrupted data — fall through to default */
  }
  return initialTransactions;
};

const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
};

const loadTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* fall through */
  }
  return "light";
};

const loadRole = () => {
  try {
    const stored = localStorage.getItem(ROLE_KEY);
    if (stored === "viewer" || stored === "admin") return stored;
  } catch {
    /* fall through */
  }
  return "viewer";
};

/**
 * useStore — Global Zustand store
 *
 * State:
 *   transactions  → Array of transaction objects (seeded from mock data)
 *   role          → "viewer" | "admin"
 *
 * Actions:
 *   addTransaction(tx)   → Prepends a new transaction
 *   deleteTransaction(id) → Removes transaction by id
 *   setRole(role)         → Switches the active role
 */
const useStore = create((set) => ({
  // ─── State ─────────────────────────────────────────────────
  transactions: loadTransactions(),
  role: loadRole(),
  theme: loadTheme(),
  toasts: [],

  // ─── Actions ───────────────────────────────────────────────
  addTransaction: (tx) =>
    set((state) => {
      const next = [tx, ...state.transactions];
      saveTransactions(next);
      return { transactions: next };
    }),

  deleteTransaction: (id) =>
    set((state) => {
      const next = state.transactions.filter((tx) => tx.id !== id);
      saveTransactions(next);
      return { transactions: next };
    }),

  editTransaction: (id, updatedData) =>
    set((state) => {
      const next = state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updatedData } : tx
      );
      saveTransactions(next);
      return { transactions: next };
    }),

  setRole: (role) => {
    try { localStorage.setItem(ROLE_KEY, role); } catch {}
    set({ role });
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch {}
      return { theme: next };
    }),

  addToast: (message) => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export default useStore;

import { useState, useEffect, useRef } from "react";
import useStore from "../store/useStore";

const CATEGORIES = ["Salary", "Freelance", "Food", "Travel", "Shopping", "Bills", "Entertainment", "Misc"];

function TransactionModal({ isOpen, onClose, defaultType, editingTx }) {
  const addTransaction = useStore((s) => s.addTransaction);
  const editTransaction = useStore((s) => s.editTransaction);
  const addToast = useStore((s) => s.addToast);
  const backdropRef = useRef(null);

  const isEditing = !!editingTx;

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "Misc",
    type: defaultType || "expense",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingTx) {
        setForm({
          date: editingTx.date.slice(0, 10),
          amount: String(editingTx.amount),
          category: editingTx.category,
          type: editingTx.type,
        });
      } else {
        setForm({
          date: new Date().toISOString().split("T")[0],
          amount: "",
          category: "Misc",
          type: defaultType || "expense",
        });
      }
      setErrors({});
    }
  }, [isOpen, defaultType, editingTx]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  function validate() {
    const next = {};
    if (!form.date) next.date = "Date is required";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Enter a valid amount";
    if (!form.category) next.category = "Select a category";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildTimestamp(dateStr, originalIso) {
    const today = new Date().toISOString().slice(0, 10);
    if (!originalIso && dateStr === today) {
      // New transaction with today's date → use real current time
      return new Date().toISOString();
    }
    // Preserve original time if editing, or use current time for a different date
    const timePart = originalIso ? originalIso.slice(10) : new Date().toISOString().slice(10);
    return new Date(dateStr + timePart).toISOString();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      editTransaction(editingTx.id, {
        date: buildTimestamp(form.date, editingTx.date),
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
      });
      addToast("Transaction updated");
    } else {
      addTransaction({
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date: buildTimestamp(form.date, null),
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
      });
      addToast("Transaction added");
    }
    onClose();
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const inputBase =
    "w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2";
  const inputNormal =
    "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-emerald-500/30 focus:border-emerald-400";
  const inputError =
    "border-rose-300 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-500/5 text-slate-900 dark:text-slate-100 focus:ring-rose-500/30 focus:border-rose-400";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Type
            </label>
            <div className="flex gap-2">
              {["income", "expense"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange("type", t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${form.type === t
                      ? t === "income"
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-500/30"
                        : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/30"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600"
                    }`}
                >
                  {t === "income" ? "↗ Income" : "↙ Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className={`${inputBase} ${errors.amount ? inputError : inputNormal} pl-8`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`${inputBase} ${errors.category ? inputError : inputNormal}`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={`${inputBase} ${errors.date ? inputError : inputNormal}`}
            />
            {errors.date && <p className="mt-1 text-xs text-rose-500">{errors.date}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md transition-all"
            >
              {isEditing ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;

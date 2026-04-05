/**
 * Mock transaction data — 15 entries
 *
 * Each transaction has:
 *   id       → Unique identifier
 *   date     → ISO date string (sortable)
 *   amount   → Raw number (formatted in UI)
 *   category → Spending/earning category
 *   type     → "income" or "expense"
 *
 * Dates span the last ~2 months so sorting is meaningful.
 * Mix of income + expense so filtering shows real results.
 */
const transactions = [
  { id: 1,  date: "2026-04-01T09:00:00.000Z", amount: 45000, category: "Salary",        type: "income"  },
  { id: 2,  date: "2026-04-02T12:30:00.000Z", amount: 1200,  category: "Food",          type: "expense" },
  { id: 3,  date: "2026-04-03T15:45:00.000Z", amount: 8500,  category: "Travel",        type: "expense" },
  { id: 4,  date: "2026-04-04T10:20:00.000Z", amount: 3200,  category: "Shopping",      type: "expense" },
  { id: 5,  date: "2026-04-05T14:00:00.000Z", amount: 15000, category: "Freelance",     type: "income"  },
  { id: 6,  date: "2026-03-28T08:15:00.000Z", amount: 950,   category: "Food",          type: "expense" },
  { id: 7,  date: "2026-03-25T19:30:00.000Z", amount: 2100,  category: "Entertainment", type: "expense" },
  { id: 8,  date: "2026-03-22T09:00:00.000Z", amount: 5000,  category: "Salary",        type: "income"  },
  { id: 9,  date: "2026-03-20T16:45:00.000Z", amount: 4500,  category: "Bills",         type: "expense" },
  { id: 10, date: "2026-03-18T11:10:00.000Z", amount: 1800,  category: "Shopping",      type: "expense" },
  { id: 11, date: "2026-03-15T13:00:00.000Z", amount: 10000, category: "Freelance",     type: "income"  },
  { id: 12, date: "2026-03-12T07:30:00.000Z", amount: 750,   category: "Food",          type: "expense" },
  { id: 13, date: "2026-03-08T17:20:00.000Z", amount: 3500,  category: "Travel",        type: "expense" },
  { id: 14, date: "2026-03-05T09:00:00.000Z", amount: 25000, category: "Salary",        type: "income"  },
  { id: 15, date: "2026-03-01T20:00:00.000Z", amount: 2800,  category: "Entertainment", type: "expense" },
];

export default transactions;

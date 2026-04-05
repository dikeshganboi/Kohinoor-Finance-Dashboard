# Kohinoor Finance Dashboard

> Smart financial tracking and insights dashboard

A modern, responsive finance dashboard built with React that lets users track income, expenses, and spending patterns through interactive charts and a full-featured transaction manager — with role-based access control and dark mode.

## The Problem

Managing personal or business finances requires a clear, at-a-glance view of where money is coming from and where it's going. Kohinoor Finance Dashboard provides a single interface to monitor balances, drill into transactions, and surface spending insights — without the complexity of a full accounting tool.

## Features

### Dashboard

- **Summary cards** — Total Balance, Income, and Expenses for the current month
- **Balance Trend** — Area chart showing net balance over time (Recharts)
- **Spending Breakdown** — Donut chart of expenses by category
- **Recent Activity** — Quick-view list of the latest transactions

### Transactions

- Full data table with **Date, Amount, Category, and Type** columns
- **Search** by category name
- **Filter** by type (Income / Expense) and date range (This Month / Last Month)
- **Sort** by date or amount (ascending ↔ descending)
- **Pagination** (10 rows per page)
- Admin-only **Add / Edit / Delete** with form validation

### Role-Based UI

- **Viewer** — read-only access across the entire app
- **Admin** — full CRUD access to transactions
- Instant role switching via dropdown in the navbar

### Insights

- Highest spending category (all-time)
- Monthly income and expense totals
- Month-over-month expense comparison with percentage change
- Category breakdown table with visual distribution bars

### Extras

- **Dark mode** with system-aware toggle
- **LocalStorage persistence** for transactions, theme, and role
- **Page transitions** powered by Framer Motion
- **Toast notifications** on add, edit, and delete actions

## Tech Stack

| Layer            | Technology      |
| ---------------- | --------------- |
| Framework        | React 19        |
| Styling          | Tailwind CSS v4 |
| State Management | Zustand         |
| Charts           | Recharts        |
| Animations       | Framer Motion   |
| Build Tool       | Vite            |

## Folder Structure

```
src/
├── components/
│   ├── BalanceTrendChart.jsx   # Area chart — balance over time
│   ├── Card.jsx                # Reusable container panel
│   ├── Navbar.jsx              # Top navigation + role switch + theme toggle
│   ├── PageTransition.jsx      # Framer Motion fade-in wrapper
│   ├── SpendingPieChart.jsx    # Donut chart — expense categories
│   ├── Toast.jsx               # Notification toasts
│   ├── TransactionModal.jsx    # Add / Edit transaction form (modal)
│   └── TransactionsTable.jsx   # Filterable, sortable, paginated table
├── data/
│   └── transactions.js         # Mock transaction dataset (15 entries)
├── pages/
│   ├── Dashboard.jsx           # Overview — cards, charts, recent activity
│   ├── Insights.jsx            # Analytics — top category, comparisons
│   └── Transactions.jsx        # Full transaction history
├── store/
│   └── useStore.js             # Zustand global store
├── utils/                      # Utility helpers (extensible)
├── App.jsx                     # Root layout + page routing
├── index.css                   # Tailwind entry + base styles
└── main.jsx                    # React DOM entry point
```

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/kohinoor-finance-dashboard.git
cd kohinoor-finance-dashboard

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

To create a production build:

```bash
npm run build
npm run preview
```

## Screenshots

> Replace these placeholders with actual screenshots of your app.

| Dashboard (Light)                                   | Dashboard (Dark)                                  |
| --------------------------------------------------- | ------------------------------------------------- |
| ![Dashboard Light](screenshots/dashboard-light.png) | ![Dashboard Dark](screenshots/dashboard-dark.png) |

| Transactions                                  | Insights                              |
| --------------------------------------------- | ------------------------------------- |
| ![Transactions](screenshots/transactions.png) | ![Insights](screenshots/insights.png) |

## Key Highlights

- **No prop drilling** — Zustand selectors provide state exactly where it's needed, keeping components decoupled and re-renders minimal.
- **Fully responsive** — Grid layouts adapt from mobile to desktop; the navbar collapses into a hamburger menu on small screens.
- **Real calculations** — Summary cards, charts, and insights are all derived from the live transaction array, not hardcoded values. Add or delete a transaction and every view updates instantly.
- **Persistent state** — Refreshing the page preserves transactions, theme preference, and role selection via localStorage.
- **Role-based access control** — UI elements (add, edit, delete buttons) are conditionally rendered based on role, not just hidden with CSS.
- **Production-grade form handling** — The transaction modal validates inputs, shows inline errors, supports keyboard dismiss (Escape), and resets state cleanly on open/close.
- **Clean architecture** — Pages, components, store, and data are separated into clear directories with single-responsibility modules.

## License

MIT

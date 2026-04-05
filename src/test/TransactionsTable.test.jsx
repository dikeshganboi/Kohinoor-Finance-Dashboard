import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionsTable from "../components/TransactionsTable";
import useStore from "../store/useStore";

// ─── Mock transactions ───────────────────────────────────────
const MOCK_DATA = [
  { id: "t1", date: "2026-04-01", amount: 45000, category: "Salary",   type: "income"  },
  { id: "t2", date: "2026-04-02", amount: 1200,  category: "Food",     type: "expense" },
  { id: "t3", date: "2026-04-03", amount: 8500,  category: "Travel",   type: "expense" },
  { id: "t4", date: "2026-04-04", amount: 3200,  category: "Shopping", type: "expense" },
  { id: "t5", date: "2026-04-05", amount: 15000, category: "Freelance",type: "income"  },
];

// ─── Seed the Zustand store before each test ─────────────────
beforeEach(() => {
  useStore.setState({ transactions: MOCK_DATA, role: "viewer" });
});

describe("TransactionsTable filtering", () => {
  it("shows all rows when no filter is applied", () => {
    render(<TransactionsTable />);

    // All 5 categories should appear in the table
    MOCK_DATA.forEach((tx) => {
      expect(screen.getByText(tx.category)).toBeInTheDocument();
    });
  });

  it("shows only expense rows when type filter is set to Expense", async () => {
    const user = userEvent.setup();
    render(<TransactionsTable />);

    // Select "Expense" from the type filter dropdown
    const typeSelect = screen.getByDisplayValue("All Types");
    await user.selectOptions(typeSelect, "expense");

    // Expense categories should be visible
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
    expect(screen.getByText("Shopping")).toBeInTheDocument();

    // Income categories should NOT be in the table body
    const table = screen.getByRole("table");
    const tbody = within(table).getAllByRole("rowgroup")[1]; // tbody
    expect(within(tbody).queryByText("Salary")).not.toBeInTheDocument();
    expect(within(tbody).queryByText("Freelance")).not.toBeInTheDocument();
  });

  it("shows only income rows when type filter is set to Income", async () => {
    const user = userEvent.setup();
    render(<TransactionsTable />);

    const typeSelect = screen.getByDisplayValue("All Types");
    await user.selectOptions(typeSelect, "income");

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Freelance")).toBeInTheDocument();

    const table = screen.getByRole("table");
    const tbody = within(table).getAllByRole("rowgroup")[1];
    expect(within(tbody).queryByText("Food")).not.toBeInTheDocument();
    expect(within(tbody).queryByText("Travel")).not.toBeInTheDocument();
    expect(within(tbody).queryByText("Shopping")).not.toBeInTheDocument();
  });
});

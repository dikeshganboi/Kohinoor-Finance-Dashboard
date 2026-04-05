import Card from "../components/Card";
import TransactionsTable from "../components/TransactionsTable";
import PageTransition from "../components/PageTransition";

/**
 * Transactions — Page that displays the full transaction history
 *
 * Wraps the TransactionsTable inside a Card for consistent styling.
 * Data and role come from the Zustand store — no props needed.
 */
function Transactions() {
  return (
    <PageTransition>
    <section className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Transactions
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          View, search, and filter your transaction history
        </p>
      </div>

      {/* Table wrapped in the reusable Card component */}
      <Card>
        <TransactionsTable />
      </Card>
    </section>
    </PageTransition>
  );
}

export default Transactions;

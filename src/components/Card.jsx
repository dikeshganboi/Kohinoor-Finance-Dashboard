/**
 * Card — Reusable container used across the dashboard
 *
 * Provides a consistent "panel" look:
 *   - White background
 *   - Rounded corners (2xl)
 *   - Subtle shadow + border
 *   - Comfortable padding
 *   - Optional title at the top
 *
 * Usage:
 *   <Card title="Balance Trend">
 *     <MyChart />
 *   </Card>
 */
function Card({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl
                  shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none
                  border border-slate-100 dark:border-slate-700
                  p-6 transition-all duration-300 ease-out ${className}`}
    >
      {title && (
        <h2 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

export default Card;

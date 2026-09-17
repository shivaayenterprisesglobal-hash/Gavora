export function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-card border-ink-100 bg-canvas-raised border p-4 sm:p-5">
      <p className="text-ink-500 text-xs font-medium tracking-[0.16em] uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-[1.65rem]" data-numeric>
        {value}
      </p>
      {hint ? <p className="text-ink-400 mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

export default StatCard;

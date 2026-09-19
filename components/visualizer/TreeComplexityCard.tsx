export function TreeComplexityCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60" aria-label="Tree complexity comparison">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Complexity comparison</p>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-rose-600 dark:text-rose-400">BST</span> O(n) worst case</p>
        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-teal-600 dark:text-teal-400">AVL</span> O(log n) guaranteed</p>
      </div>
    </div>
  )
}
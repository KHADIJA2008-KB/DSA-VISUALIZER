import Link from 'next/link'

type TreeModeToggleProps = {
  mode: 'bst' | 'avl'
}

export function TreeModeToggle({ mode }: TreeModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" aria-label="Tree mode">
      <Link
        href="/visualizer/tree/bst"
        aria-current={mode === 'bst' ? 'page' : undefined}
        className={`rounded-md px-3 py-2 text-sm font-semibold transition ${mode === 'bst' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
      >
        BST-only
      </Link>
      <Link
        href="/visualizer/tree/avl"
        aria-current={mode === 'avl' ? 'page' : undefined}
        className={`rounded-md px-3 py-2 text-sm font-semibold transition ${mode === 'avl' ? 'bg-teal-500 text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
      >
        AVL-balanced
      </Link>
    </div>
  )
}
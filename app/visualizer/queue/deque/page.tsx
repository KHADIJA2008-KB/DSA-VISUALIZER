import Link from 'next/link'
import { DequeVisualizer } from '@/components/DequeVisualizer'

export default function DequePage() {
  return <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16"><Link href="/visualizer/queue/array" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Queue visualizers</Link><div className="mt-10 max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">Queue variant</p><h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Double-ended queue</h1><p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Insert and remove values from either end of the same sequence.</p></div><section className="mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><h2 className="font-semibold text-slate-900 dark:text-white">How a deque works</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">A deque supports queue operations at both ends. The front and back can each accept an insertion, removal, or peek.</p></section><DequeVisualizer /></div>
}

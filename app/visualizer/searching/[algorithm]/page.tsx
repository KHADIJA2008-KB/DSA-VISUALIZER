import Link from 'next/link'
import { notFound } from 'next/navigation'

const algorithms = {
  linear: { name: 'Linear Search', summary: 'Check each value in sequence until the target is found.', complexity: 'O(n)' },
  binary: { name: 'Binary Search', summary: 'Repeatedly halve a sorted range to narrow in on the target.', complexity: 'O(log n)' },
} as const

type Algorithm = keyof typeof algorithms

export function generateStaticParams() {
  return Object.keys(algorithms).map((algorithm) => ({ algorithm }))
}

export default function SearchingAlgorithmPage({ params }: { params: { algorithm: string } }) {
  const { algorithm } = params
  const details = algorithms[algorithm as Algorithm]

  if (!details) notFound()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← All visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Searching algorithm</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">{details.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">{details.summary}</p>
      </div>
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Search canvas</h2><span className="rounded-full bg-teal-50 px-3 py-1 font-mono text-xs text-teal-700 dark:bg-teal-950 dark:text-teal-300">{details.complexity}</span></div>
        <div className="mt-10 grid grid-cols-8 gap-2 sm:grid-cols-12">{[12, 24, 31, 47, 53, 61, 68, 72, 81, 89, 94, 99].map((value, index) => <div key={value} className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-mono ${index === 6 ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}>{value}</div>)}</div>
        <p className="mt-6 text-sm text-slate-500">Choose a target to begin the walkthrough.</p>
      </section>
    </div>
  )
}

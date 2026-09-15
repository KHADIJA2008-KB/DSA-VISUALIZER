import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SortingVisualizer, type SortingAlgorithm } from '@/components/SortingVisualizer'

const algorithms = {
  bubble: { name: 'Bubble Sort', summary: 'Repeatedly compare neighboring values and move the largest value to the end.', complexity: 'O(n²)', accent: 'from-cyan-500 to-blue-500' },
  selection: { name: 'Selection Sort', summary: 'Find the smallest remaining value and place it at the next open position.', complexity: 'O(n²)', accent: 'from-violet-500 to-fuchsia-500' },
  insertion: { name: 'Insertion Sort', summary: 'Build a sorted section by inserting each new value into its correct position.', complexity: 'O(n²)', accent: 'from-amber-400 to-orange-500' },
  merge: { name: 'Merge Sort', summary: 'Split the array, sort each half, and merge the ordered results.', complexity: 'O(n log n)', accent: 'from-emerald-400 to-teal-500' },
  quick: { name: 'Quick Sort', summary: 'Partition around a pivot, then recursively sort the smaller sections.', complexity: 'O(n log n)', accent: 'from-rose-500 to-pink-500' },
} as const

type Algorithm = keyof typeof algorithms

export function generateStaticParams() {
  return Object.keys(algorithms).map((algorithm) => ({ algorithm }))
}

export default async function SortingAlgorithmPage({ params }: { params: Promise<{ algorithm: string }> }) {
  const { algorithm } = await params
  const details = algorithms[algorithm as Algorithm]

  if (!details) notFound()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← All visualizers</Link>
      <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Sorting algorithm</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">{details.name}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">{details.summary}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs uppercase tracking-widest text-slate-400">Typical runtime</p><p className="mt-1 font-mono text-xl text-slate-900 dark:text-white">{details.complexity}</p></div>
      </div>
      <SortingVisualizer algorithm={algorithm as SortingAlgorithm} />
    </div>
  )
}

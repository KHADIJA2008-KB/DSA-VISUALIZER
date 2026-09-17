import Link from 'next/link'
import { LinkedListOperationsVisualizer, type Operation } from '@/components/visualizer/LinkedListOperationsVisualizer'

const operations: Operation[] = ['reverse', 'merge', 'compare']

export default function LinkedListOperationsPage({ searchParams }: { searchParams?: { mode?: string } }) {
  const initialOperation = operations.includes(searchParams?.mode as Operation) ? searchParams?.mode as Operation : 'reverse'

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer/linked-list/singly" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Linked list variants</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Linked-list operations</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Transform and compare</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Switch between pointer reversal, sorted merging, and parallel list comparison in one workspace.</p>
      </div>
      <LinkedListOperationsVisualizer initialOperation={initialOperation} />
    </div>
  )
}
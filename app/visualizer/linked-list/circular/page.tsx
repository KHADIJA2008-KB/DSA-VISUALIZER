import Link from 'next/link'
import { CircularLinkedListVisualizer } from '@/components/visualizer/CircularLinkedListVisualizer'

export default function CircularLinkedListPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer/linked-list/singly" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Linked list variants</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-600 dark:text-fuchsia-400">Linked list data structure</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Circular linked list</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">See the tail feed back into the head, with a toggle between singly and doubly circular pointers.</p>
      </div>
      <CircularLinkedListVisualizer />
    </div>
  )
}
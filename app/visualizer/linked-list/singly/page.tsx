import Link from 'next/link'
import { LinkedListVisualizer } from '@/components/visualizer/LinkedListVisualizer'

export default function SinglyLinkedListPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← All visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Linked list data structure</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Singly linked list</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Watch nodes appear, disappear, and redirect their next pointers one operation at a time.</p>
      </div>
      <LinkedListVisualizer />
    </div>
  )
}
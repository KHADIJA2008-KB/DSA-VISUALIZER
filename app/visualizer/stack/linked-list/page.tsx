import Link from 'next/link'
import { StackVisualizer } from '@/components/StackVisualizer'

export default function LinkedListStackPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← All visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Stack data structure</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Linked-list stack</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Follow the head pointer as plates are pushed onto and popped from a linked list.</p>
      </div>
      <StackVisualizer representation="linked-list" />
    </div>
  )
}

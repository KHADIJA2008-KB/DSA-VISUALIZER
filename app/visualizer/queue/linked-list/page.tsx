import Link from 'next/link'
import { QueueVisualizer } from '@/components/QueueVisualizer'

export default function LinkedListQueuePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer/queue/array" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Queue visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Queue data structure</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Linked-list queue</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Follow the front and rear pointers as nodes enter at the rear and leave from the front.</p>
      </div>
      <section className="mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-white">How a linked-list queue works</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">The front pointer identifies the next node to dequeue, while the rear pointer marks where the next node is enqueued. Each node points toward the rear.</p>
      </section>
      <QueueVisualizer representation="linked-list" />
    </div>
  )
}

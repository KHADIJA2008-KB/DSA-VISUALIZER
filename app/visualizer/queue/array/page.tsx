import Link from 'next/link'
import { QueueVisualizer } from '@/components/QueueVisualizer'

export default function QueueArrayPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← All visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Queue data structure</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Array-backed queue</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Send values into the rear and release them from the front to see first in, first out in action.</p>
      </div>
      <QueueVisualizer representation="array" />
    </div>
  )
}

import Link from 'next/link'
import { DoublyLinkedListVisualizer } from '@/components/visualizer/DoublyLinkedListVisualizer'

export default function DoublyLinkedListPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer/linked-list/singly" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Singly linked list</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Linked list data structure</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Doubly linked list</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Follow the forward and backward pointers as every insertion and deletion updates both directions.</p>
      </div>
      <DoublyLinkedListVisualizer />
    </div>
  )
}
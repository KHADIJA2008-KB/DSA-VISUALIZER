'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Category = {
  label: string
  href: string
  items?: { label: string; href: string }[]
}

const categories: Category[] = [
  { label: 'Overview', href: '/visualizer' },
  { label: 'Sorting', href: '/visualizer/sorting/bubble', items: ['bubble', 'selection', 'insertion', 'merge', 'quick'].map((algorithm) => ({ label: `${algorithm[0].toUpperCase()}${algorithm.slice(1)} sort`, href: `/visualizer/sorting/${algorithm}` })) },
  { label: 'Searching', href: '/visualizer/searching/linear', items: ['linear', 'binary'].map((algorithm) => ({ label: `${algorithm[0].toUpperCase()}${algorithm.slice(1)} search`, href: `/visualizer/searching/${algorithm}` })) },
  { label: 'Array', href: '/visualizer#array' },
  { label: 'Stack', href: '/visualizer/stack/array', items: [
    { label: 'Array stack', href: '/visualizer/stack/array' },
    { label: 'Linked-list stack', href: '/visualizer/stack/linked-list' },
    { label: 'Postfix evaluator', href: '/visualizer/stack/postfix' },
    { label: 'Prefix evaluator', href: '/visualizer/stack/prefix' },
  ] },
  { label: 'Queue', href: '/visualizer/queue/array', items: [
    { label: 'Array queue', href: '/visualizer/queue/array' },
    { label: 'Linked-list queue', href: '/visualizer/queue/linked-list' },
    { label: 'Circular queue', href: '/visualizer/queue/circular' },
    { label: 'Deque', href: '/visualizer/queue/deque' },
    { label: 'Priority queue', href: '/visualizer/queue/priority' },
  ] },
  { label: 'Linked List', href: '/visualizer/linked-list/singly', items: [
    { label: 'Singly linked list', href: '/visualizer/linked-list/singly' },
    { label: 'Doubly linked list', href: '/visualizer/linked-list/doubly' },
    { label: 'Circular linked list', href: '/visualizer/linked-list/circular' },
    { label: 'Operations', href: '/visualizer/linked-list/operations' },
  ] },
  { label: 'Tree', href: '/visualizer#tree' },
  { label: 'Graph', href: '/visualizer#graph' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap sm:gap-6 sm:px-8">
        <Link href="/visualizer" className="flex shrink-0 items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 font-mono text-sm font-bold text-white">DSA</span>
          <span className="whitespace-nowrap font-semibold tracking-tight text-slate-900">DSA Visualizer</span>
        </Link>
        <button type="button" onClick={() => setMobileOpen((value) => !value)} className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 sm:hidden" aria-expanded={mobileOpen} aria-label="Toggle navigation menu">{mobileOpen ? 'Close' : 'Menu'}</button>
        <nav className="hidden min-w-0 flex-1 gap-1 overflow-x-auto py-1 sm:flex" aria-label="Visualizer categories">
          {categories.map((category) => {
            const hasItems = Boolean(category.items)
            const isOpen = open === category.label
            const isActive = pathname === category.href || pathname.startsWith(`${category.href}/`) || (category.label === 'Linked List' && pathname.startsWith('/visualizer/linked-list/'))
            return (
              <div key={category.label} className="group relative z-50 min-w-max">
                <div className="flex items-center">
                  <Link href={category.href} className={`rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-teal-50 font-semibold text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>{category.label}</Link>
                  {hasItems && <button type="button" onClick={() => setOpen(isOpen ? null : category.label)} className="rounded-md p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`${isOpen ? 'Close' : 'Open'} ${category.label} menu`}>⌄</button>}
                </div>
                {hasItems && <div className={`${isOpen ? 'visible opacity-100' : 'invisible opacity-0'} absolute left-0 top-full z-[100] mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-300/40 transition`}>
                  {category.items?.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(null)} className={`block rounded-lg px-3 py-2.5 text-sm transition ${pathname === item.href ? 'bg-teal-50 font-semibold text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>{item.label}</Link>)}
                </div>}
              </div>
            )
          })}
        </nav>
        {mobileOpen && <nav className="basis-full rounded-xl border border-slate-200 bg-slate-50 p-2 sm:hidden" aria-label="Mobile visualizer categories">
          {categories.map((category) => <div key={category.label} className="border-b border-slate-200 last:border-0">
            <Link href={category.href} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === category.href ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-white'}`}>{category.label}</Link>
            {category.items && <div className="grid gap-1 px-3 pb-2">{category.items.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-white hover:text-teal-700">{item.label}</Link>)}</div>}
          </div>)}
        </nav>}
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

type Category = {
  label: string
  href: string
  items?: { label: string; href: string }[]
}

const categories: Category[] = [
  { label: 'Overview', href: '/visualizer' },
  {
    label: 'Sorting',
    href: '/visualizer/sorting/bubble',
    items: ['bubble', 'selection', 'insertion', 'merge', 'quick'].map((algorithm) => ({
      label: `${algorithm[0].toUpperCase()}${algorithm.slice(1)} sort`,
      href: `/visualizer/sorting/${algorithm}`,
    })),
  },
  {
    label: 'Searching',
    href: '/visualizer/searching/linear',
    items: ['linear', 'binary'].map((algorithm) => ({
      label: `${algorithm[0].toUpperCase()}${algorithm.slice(1)} search`,
      href: `/visualizer/searching/${algorithm}`,
    })),
  },
  { label: 'Array', href: '/visualizer#array' },
  { label: 'Stack', href: '/visualizer#stack' },
  { label: 'Queue', href: '/visualizer#queue' },
  { label: 'Linked List', href: '/visualizer#linked-list' },
  { label: 'Tree', href: '/visualizer#tree' },
  { label: 'Graph', href: '/visualizer#graph' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState<Record<string, boolean>>({})

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-6 py-6">
        <Link href="/visualizer" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 font-mono text-sm font-bold text-white">DSA</span>
          <span className="font-semibold tracking-tight text-slate-900 dark:text-white">DSA Visualizer</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-3" aria-label="Visualizer categories">
        {categories.map((category) => {
          const hasItems = Boolean(category.items)
          const isOpen = open[category.label]
          const isActive = pathname === category.href || pathname.startsWith(`${category.href}/`)

          return (
            <div key={category.label} className={`group relative min-w-max lg:min-w-0 ${hasItems ? 'lg:z-20' : ''}`}>
              <div className="flex items-center">
                <Link href={category.href} className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition ${isActive ? 'bg-teal-50 font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'}`}>
                  {category.label}
                </Link>
                {hasItems && (
                  <button type="button" onClick={() => setOpen((state) => ({ ...state, [category.label]: !isOpen }))} className="rounded-md p-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:pointer-events-none" aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${category.label}`}>
                    <span className="lg:hidden">{isOpen ? '−' : '+'}</span>
                    <span className="hidden lg:inline">⌄</span>
                  </button>
                )}
              </div>
              {hasItems && (
                <div className={`mt-1 ${isOpen ? 'block' : 'hidden'} border-l border-slate-200 pl-3 dark:border-slate-800 lg:invisible lg:absolute lg:left-0 lg:top-full lg:z-30 lg:mt-0 lg:block lg:w-56 lg:rounded-lg lg:border lg:bg-white lg:p-2 lg:opacity-0 lg:shadow-xl lg:shadow-slate-200/60 lg:transition lg:group-hover:visible lg:group-hover:opacity-100 dark:lg:border-slate-700 dark:lg:bg-slate-900 dark:lg:shadow-black/30`}>
                  {category.items?.map((item) => (
                    <Link key={item.href} href={item.href} className={`block rounded-md px-3 py-1.5 text-xs transition ${pathname === item.href ? 'font-semibold text-teal-600 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="mt-auto hidden border-t border-slate-200 px-6 py-5 text-xs leading-5 text-slate-400 dark:border-slate-800 lg:block">
        <p>Build intuition, one step at a time.</p>
        <p className="mt-1 text-slate-300 dark:text-slate-700">v0.1 learning workspace</p>
      </div>
    </aside>
  )
}

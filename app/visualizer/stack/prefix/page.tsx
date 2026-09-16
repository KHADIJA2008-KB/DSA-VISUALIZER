import Link from 'next/link'
import { PrefixEvaluator } from '@/components/PrefixEvaluator'

export default function PrefixStackPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer/stack/array" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Stack visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Stack expression lab</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Prefix evaluator</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Watch a stack evaluate an expression written with operators before their operands.</p>
      </div>
      <section className="mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-white">How prefix evaluation works</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Scan the expression from right to left. Push each number. When an operator appears, pop the top two values, apply the operator in operand order, and push the result.</p>
        <p className="mt-3 font-mono text-sm text-teal-700 dark:text-teal-300">*+234 = (2 + 3) * 4 = 20</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-slate-400">Time O(n) · Space O(n)</p>
      </section>
      <PrefixEvaluator />
    </div>
  )
}

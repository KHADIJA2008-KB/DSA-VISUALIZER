import Link from 'next/link'
import { PostfixEvaluator } from '@/components/PostfixEvaluator'

export default function PostfixStackPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer/stack/array" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← Stack visualizers</Link>
      <div className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Stack expression lab</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">Postfix evaluator</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Watch a stack evaluate an expression written with operators after their operands.</p>
      </div>
      <section className="mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-white">How postfix evaluation works</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Scan the expression from left to right. Push each number. When an operator appears, pop the top two values, apply the operator, and push the result back.</p>
        <p className="mt-3 font-mono text-sm text-teal-700 dark:text-teal-300">23+4* = (2 + 3) * 4 = 20</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-slate-400">Time O(n) · Space O(n)</p>
      </section>
      <PostfixEvaluator />
    </div>
  )
}

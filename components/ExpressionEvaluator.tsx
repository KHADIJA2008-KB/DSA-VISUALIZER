'use client'

import { useState } from 'react'
import { evaluatePostfix, evaluatePrefix, type EvalStep } from '@/lib/algorithms/stack/postfixEvaluator'
import { ExpressionEvaluatorVisualizer } from '@/components/visualizer/ExpressionEvaluatorVisualizer'

type EvaluationMode = 'postfix' | 'prefix'

type ExpressionEvaluatorProps = {
  mode: EvaluationMode
}

const expressionPlaceholders: Record<EvaluationMode, string> = {
  postfix: '23+4*',
  prefix: '*+235',
}

const expressionExamples: Record<EvaluationMode, { label: string; value: string }[]> = {
  postfix: [
    { label: 'Simple: 2 + 3', value: '23+' },
    { label: 'Nested: (2 + 3) * 4', value: '23+4*' },
    { label: 'Division: 12 / 3', value: '12 3 /' },
    { label: 'Deeper: (2 + 3) * (4 + 5)', value: '23+45+*' },
  ],
  prefix: [
    { label: 'Simple: 2 + 3', value: '+23' },
    { label: 'Nested: (2 + 3) * 4', value: '*+234' },
    { label: 'Division: 8 / 2', value: '/82' },
    { label: 'Deeper: (2 + 3) * (4 + 5)', value: '*+23+45' },
  ],
}

function modeCopy(mode: EvaluationMode) {
  return mode === 'postfix'
    ? {
        scanDirection: 'left to right' as const,
        hint: 'Numbers are pushed. Each operator pops two values, applies itself, and pushes the result.',
      }
    : {
        scanDirection: 'right to left' as const,
        hint: 'Scan from right to left. Numbers are pushed, then operators combine the top two values.',
      }
}

export function ExpressionEvaluator({ mode }: ExpressionEvaluatorProps) {
  const copy = modeCopy(mode)
  const [expression, setExpression] = useState('')
  const [steps, setSteps] = useState<EvalStep[]>([])
  const [error, setError] = useState('')

  function evaluate() {
    try {
      const nextSteps = mode === 'postfix' ? evaluatePostfix(expression) : evaluatePrefix(expression)
      setSteps(nextSteps)
      setError('')
    } catch (evaluationError) {
      setSteps([])
      const message = evaluationError instanceof Error ? evaluationError.message : 'Unable to evaluate expression.'
      setError(`Please check your expression: ${message}`)
    }
  }

  function clear() {
    setSteps([])
    setError('')
  }

  function chooseExample(value: string) {
    setExpression(value)
    setSteps([])
    setError('')
  }

  return (
    <div className="mt-8">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label={`${mode} expression evaluator`}>
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Expression scanner</p>
            <p className="mt-1 text-sm text-slate-500">Scan {copy.scanDirection}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-500">Expression<input value={expression} placeholder={expressionPlaceholders[mode]} onChange={(event) => setExpression(event.target.value)} className="mt-1 block w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-400" aria-label="Expression" /></label>
            <label className="text-xs text-slate-500">Try an example<select value={expression} onChange={(event) => chooseExample(event.target.value)} className="mt-1 block max-w-52 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-teal-400" aria-label="Try an example"><option value="">Choose one</option>{expressionExamples[mode].map((example) => <option key={example.value} value={example.value}>{example.label}</option>)}</select></label>
            <button type="button" onClick={evaluate} className="rounded-lg bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-300">Visualize</button>
            <button type="button" onClick={clear} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-teal-400 hover:text-white">Clear</button>
          </div>
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300" role="alert">{error}</p>}
        {!steps.length && !error && <p className="mt-4 text-sm text-slate-500">{copy.hint}</p>}
      </section>
      <ExpressionEvaluatorVisualizer expression={expression} steps={steps} scanDirection={copy.scanDirection} />
    </div>
  )
}

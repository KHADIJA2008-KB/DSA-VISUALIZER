'use client'

import { useEffect, useMemo } from 'react'
import type { EvalStep } from '@/lib/algorithms/stack/postfixEvaluator'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

type ExpressionEvaluatorVisualizerProps = {
  expression: string
  steps: EvalStep[]
  scanDirection?: 'left to right' | 'right to left'
}

function expressionTokens(expression: string) {
  const trimmed = expression.trim()
  return /\s/.test(trimmed) ? trimmed.split(/\s+/) : trimmed.split('')
}

function toPlayerSteps(steps: EvalStep[]): Step[] {
  return steps.map((step) => ({
    type: step.type,
    indices: [],
    array: step.stackAfter,
    token: step.token,
    tokenIndex: step.tokenIndex,
    description: step.message,
  }))
}

function narrationTone(type: EvalStep['type']) {
  if (type === 'push') return 'border-l-2 border-emerald-400 bg-emerald-400/5 text-emerald-200'
  if (type === 'pop') return 'border-l-2 border-orange-400 bg-orange-400/5 text-orange-200'
  return 'border-l-2 border-sky-400 bg-sky-400/5 text-sky-200'
}

export function ExpressionEvaluatorVisualizer({ expression, steps, scanDirection = 'left to right' }: ExpressionEvaluatorVisualizerProps) {
  const playerSteps = useMemo(() => toPlayerSteps(steps), [steps])
  const player = useStepPlayer(playerSteps, 520)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const previousStep = player.currentStep > 0 ? steps[player.currentStep - 1] : undefined
  const tokens = expressionTokens(expression)
  const visibleStack = activeStep?.stackAfter ?? []
  const poppedValue = activeStep?.type === 'pop' && previousStep ? previousStep.stackAfter[previousStep.stackAfter.length - 1] : undefined
  const play = player.play

  useEffect(() => {
    if (playerSteps.length > 0) play()
  }, [playerSteps.length, play])

  return (
    <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]" aria-label="expression evaluator visualizer">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scanning {scanDirection}</p>
          <div className="mt-4 flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 font-mono text-lg" aria-label="Expression tokens">
            {tokens.length > 0 ? tokens.map((token, index) => <span key={`${token}-${index}`} className={`grid min-h-9 min-w-9 place-items-center rounded-md border px-2 transition ${activeStep?.tokenIndex === index ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>{token}</span>) : <span className="text-sm text-slate-600">Enter an expression</span>}
          </div>

          <div className="mt-6 flex min-h-[21rem] flex-col-reverse items-center justify-start gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4" aria-label="Evaluation stack">
            {visibleStack.map((value, index) => { const isTop = index === visibleStack.length - 1; const isPush = activeStep?.type === 'push' && isTop; const isCompute = activeStep?.type === 'compute' && isTop; return <div key={`${value}-${index}-${player.currentStep}`} className={`flex h-12 w-full max-w-sm items-center justify-between rounded-lg border px-4 font-mono text-lg transition ${isTop ? 'border-teal-400 bg-teal-400/15 text-teal-100' : 'border-slate-700 bg-slate-800 text-slate-300'} ${isPush || isCompute ? 'animate-stack-push' : ''}`}><span className="text-xs text-current/60">stack[{index}]</span><span>{value}</span>{isTop && <span className="text-xs uppercase tracking-widest text-current/60">top</span>}</div> })}
            {poppedValue !== undefined && <div className="flex h-12 w-full max-w-sm animate-stack-pop items-center justify-between rounded-lg border border-red-400 bg-red-400/15 px-4 font-mono text-lg text-red-200"><span className="text-xs text-red-300/70">pop</span><span>{poppedValue}</span><span className="text-xs uppercase tracking-widest text-red-300/70">out</span></div>}
            {visibleStack.length === 0 && poppedValue === undefined && <p className="text-sm text-slate-600">Stack is empty</p>}
            <div className="mt-auto h-2 w-full max-w-sm rounded-full bg-slate-700" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={playerSteps.length} /></div>
      </div>

      <aside className="max-h-[34rem] overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="Narration log">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Narration log</p><p className="mt-1 text-sm font-semibold text-white">{steps.length} steps</p></div>
        <div className="max-h-[28rem] overflow-y-auto p-3">
          {steps.slice(0, player.currentStep + 1).reverse().map((step, index) => <div key={`${step.tokenIndex}-${step.type}-${index}`} className={`mb-1 rounded-r px-2 py-3 text-xs leading-5 ${narrationTone(step.type)} ${index === 0 ? 'ring-1 ring-white/10' : ''}`}><span className="mr-2 font-mono text-slate-500">{step.tokenIndex >= 0 ? `#${step.tokenIndex}` : 'done'}</span>{step.message}</div>)}
          {player.currentStep < 0 && <p className="px-2 py-3 text-xs leading-5 text-slate-600">Press play or step forward to see each operation.</p>}
        </div>
      </aside>
    </section>
  )
}

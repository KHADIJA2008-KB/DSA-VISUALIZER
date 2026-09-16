'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_STACK_CAPACITY, isEmpty, isFull, peek, pop, push } from '@/lib/algorithms/stack'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

const initialStack = [18, 42, 27]

type StackRepresentation = 'array' | 'linked-list'

const actionLabels: Record<string, string> = {
  push: 'Pushed value',
  pop: 'Popped value',
  peek: 'Peeked at top',
  empty: 'Stack is empty',
  notEmpty: 'Stack has values',
  full: 'Stack is full',
  notFull: 'Stack has space',
}

function operationDescription(step?: Step) {
  if (!step) return 'Choose an operation to create a step.'
  const label = actionLabels[step.type] ?? step.type
  return step.value === undefined ? label : `${label}: ${step.value}`
}

export function StackVisualizer({ representation = 'array' }: { representation?: StackRepresentation }) {
  const [stack, setStack] = useState(initialStack)
  const [steps, setSteps] = useState<Step[]>([])
  const [inputValue, setInputValue] = useState('64')
  const player = useStepPlayer(steps, 220)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const visibleStack = activeStep?.array ?? stack
  const topIndex = visibleStack.length - 1
  const isPopping = activeStep?.type === 'pop'
  const isPushing = activeStep?.type === 'push'
  const poppedValue = isPopping ? activeStep.value : undefined
  const isLinkedList = representation === 'linked-list'

  useEffect(() => {
    if (steps.length > 0) player.play()
  }, [steps, player])

  function playOperation(nextSteps: Step[]) {
    setSteps(nextSteps)
    const finalState = nextSteps[nextSteps.length - 1]?.array
    if (finalState) setStack(finalState)
  }

  function handlePush() {
    const value = Number(inputValue)
    if (!Number.isInteger(value)) return
    playOperation(push(stack, value))
  }

  function handlePop() {
    playOperation(pop(stack))
  }

  function handlePeek() {
    playOperation(peek(stack))
  }

  function handleIsEmpty() {
    playOperation(isEmpty(stack))
  }

  function handleIsFull() {
    playOperation(isFull(stack))
  }

  return (
    <div className="mt-12 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label={`${representation} stack visualizer`}>
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">{isLinkedList ? 'Linked nodes' : 'Stack memory'}</p>
            <p className="mt-1 text-sm text-slate-500">Last in, first out · {visibleStack.length} / {DEFAULT_STACK_CAPACITY} slots used</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-500">Value<input type="number" value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="mt-1 block w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-400" /></label>
            <button type="button" onClick={handlePush} className="rounded-lg bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-300">Push</button>
            <button type="button" onClick={handlePop} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-teal-400 hover:text-white">Pop</button>
          </div>
        </div>

        <div className={`mt-8 flex min-h-[31rem] items-center rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 ${isLinkedList ? 'flex-col justify-start' : 'flex-col-reverse justify-start gap-2'}`}>
          {isLinkedList ? (
            <div className="flex w-full flex-col items-center">
              {poppedValue !== undefined && <div className="mb-2 flex h-12 w-full max-w-sm animate-stack-pop items-center justify-between rounded-lg border border-red-400 bg-red-400/15 px-4 font-mono text-lg text-red-200"><span className="text-xs text-red-300/70">pop</span><span>{poppedValue}</span><span className="text-xs uppercase tracking-widest text-red-300/70">out</span></div>}
              <div className="mb-3 flex flex-col items-center text-xs font-semibold uppercase tracking-[0.2em] text-teal-300"><span>head</span><span className="text-lg leading-5">↓</span></div>
              {visibleStack.slice().reverse().map((value, displayIndex) => {
                const index = visibleStack.length - 1 - displayIndex
                const isActive = activeStep?.index === index
                return <div key={`${value}-${index}-${player.currentStep}`} className="flex flex-col items-center"><div className={`flex h-12 w-full max-w-sm items-center justify-between rounded-lg border px-4 font-mono text-lg transition ${isActive ? 'border-amber-300 bg-amber-300 text-slate-950' : index === topIndex ? 'border-teal-400 bg-teal-400/15 text-teal-100' : 'border-slate-700 bg-slate-800 text-slate-300'} ${isPushing && isActive ? 'animate-stack-push' : ''}`}><span className="text-xs text-current/60">node {index}</span><span>{value}</span>{index === topIndex && <span className="text-xs uppercase tracking-widest text-current/60">top</span>}</div>{displayIndex < visibleStack.length - 1 && <span className="py-1 text-xl leading-5 text-slate-500" aria-hidden="true">↓</span>}</div>
              })}
              {visibleStack.length === 0 && poppedValue === undefined && <p className="text-sm text-slate-600">Stack is empty</p>}
            </div>
          ) : (
            <>
              {visibleStack.map((value, index) => {
                const isTop = index === topIndex
                const isActive = activeStep?.index === index
                return <div key={`${value}-${index}-${player.currentStep}`} className={`flex h-12 w-full max-w-sm items-center justify-between rounded-lg border px-4 font-mono text-lg transition ${isActive ? 'border-amber-300 bg-amber-300 text-slate-950' : isTop ? 'border-teal-400 bg-teal-400/15 text-teal-100' : 'border-slate-700 bg-slate-800 text-slate-300'} ${isPushing && isActive ? 'animate-stack-push' : ''}`}><span className="text-xs text-current/60">slot {index}</span><span>{value}</span>{isTop && <span className="text-xs uppercase tracking-widest text-current/60">top</span>}</div>
              })}
              {poppedValue !== undefined && <div className="flex h-12 w-full max-w-sm animate-stack-pop items-center justify-between rounded-lg border border-red-400 bg-red-400/15 px-4 font-mono text-lg text-red-200"><span className="text-xs text-red-300/70">pop</span><span>{poppedValue}</span><span className="text-xs uppercase tracking-widest text-red-300/70">out</span></div>}
              {visibleStack.length === 0 && poppedValue === undefined && <p className="text-sm text-slate-600">Stack is empty</p>}
              <div className="mt-auto h-2 w-full max-w-sm rounded-full bg-slate-700" aria-hidden="true" />
            </>
          )}
          {isLinkedList && <div className="mt-auto h-2 w-full max-w-sm rounded-full bg-slate-700" aria-hidden="true" />}
        </div>

        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="stack operations">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p><p className="mt-1 text-sm font-semibold text-white">StackOps.ts</p></div>
        <div className="grid gap-2 p-4">
          <button type="button" onClick={handlePeek} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">peek()</button>
          <button type="button" onClick={handleIsEmpty} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">isEmpty()</button>
          <button type="button" onClick={handleIsFull} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">isFull()</button>
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">{operationDescription(activeStep)}</div>
      </aside>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_QUEUE_CAPACITY, dequeue, enqueue, isEmpty, isFull, peek } from '@/lib/algorithms/queue'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

const initialQueue = [18, 42, 27]

type QueueRepresentation = 'array' | 'linked-list'

const actionLabels: Record<string, string> = {
  enqueue: 'Enqueued value',
  dequeue: 'Dequeued value',
  peek: 'Peeked at front',
  empty: 'Queue is empty',
  notEmpty: 'Queue has values',
  full: 'Queue is full',
  notFull: 'Queue has space',
}

function operationDescription(step?: Step) {
  if (!step) return 'Choose an operation to create a step.'
  const label = actionLabels[step.type] ?? step.type
  return step.value === undefined ? label : `${label}: ${step.value}`
}

export function QueueVisualizer({ representation = 'array' }: { representation?: QueueRepresentation }) {
  const [queue, setQueue] = useState(initialQueue)
  const [steps, setSteps] = useState<Step[]>([])
  const [inputValue, setInputValue] = useState('64')
  const player = useStepPlayer(steps, 220)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const visibleQueue = activeStep?.array ?? queue
  const dequeuedValue = activeStep?.type === 'dequeue' ? activeStep.value : undefined
  const play = player.play
  const isLinkedList = representation === 'linked-list'

  useEffect(() => {
    if (steps.length > 0) play()
  }, [steps, play])

  function playOperation(nextSteps: Step[]) {
    setSteps(nextSteps)
    const finalState = nextSteps[nextSteps.length - 1]?.array
    if (finalState) setQueue(finalState)
  }

  function handleEnqueue() {
    const value = Number(inputValue)
    if (!Number.isInteger(value)) return
    playOperation(enqueue(queue, value))
  }

  function handleDequeue() {
    playOperation(dequeue(queue))
  }

  function handlePeek() {
    playOperation(peek(queue))
  }

  function handleIsEmpty() {
    playOperation(isEmpty(queue))
  }

  function handleIsFull() {
    playOperation(isFull(queue))
  }

  return (
    <div className="mt-12 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label={`${representation} queue visualizer`}>
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{isLinkedList ? 'Linked nodes' : 'Queue memory'}</p>
            <p className="mt-1 text-sm text-slate-500">First in, first out · {visibleQueue.length} / {DEFAULT_QUEUE_CAPACITY} slots used</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-500">Value<input type="number" value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="mt-1 block w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" /></label>
            <button type="button" onClick={handleEnqueue} className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-200">Enqueue</button>
            <button type="button" onClick={handleDequeue} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-400 hover:text-white">Dequeue</button>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          {isLinkedList ? (
            <div className="flex min-h-[18rem] min-w-[44rem] items-center justify-center">
              {dequeuedValue !== undefined && <div className="mr-3 flex w-24 shrink-0 animate-stack-pop flex-col gap-2"><span className="text-center text-xs font-semibold uppercase tracking-widest text-red-300">dequeue</span><div className="flex h-16 items-center justify-center rounded-lg border border-red-400 bg-red-400/15 font-mono text-lg text-red-200">{dequeuedValue}</div></div>}
              {visibleQueue.length > 0 ? visibleQueue.map((value, index) => { const isFront = index === 0; const isRear = index === visibleQueue.length - 1; const isActive = activeStep?.index === index; return <div key={`${value}-${index}-${player.currentStep}`} className="flex items-center"><div className="flex w-28 shrink-0 flex-col items-center gap-2"><div className="h-8 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">{isFront ? 'front' : isRear ? 'rear' : ''}</div><div className={`flex h-16 w-full items-center justify-center rounded-lg border font-mono text-lg transition ${isActive ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-amber-400/70 bg-amber-400/10 text-amber-100'}`}>{value}</div><span className="text-xs text-slate-600">node {index}</span></div>{!isRear && <span className="px-2 text-2xl text-amber-300" aria-hidden="true">→</span>}</div> }) : dequeuedValue === undefined && <p className="text-sm text-slate-600">Queue is empty</p>}
            </div>
          ) : (
            <>
              <div className="mx-auto flex min-w-[44rem] items-end gap-3">
                {dequeuedValue !== undefined && <div className="flex w-24 shrink-0 animate-stack-pop flex-col gap-2"><span className="text-center text-xs font-semibold uppercase tracking-widest text-red-300">dequeue</span><div className="flex h-16 items-center justify-center rounded-lg border border-red-400 bg-red-400/15 font-mono text-lg text-red-200">{dequeuedValue}</div></div>}
                {Array.from({ length: DEFAULT_QUEUE_CAPACITY }, (_, index) => {
                  const value = visibleQueue[index]
                  const isFront = index === 0 && visibleQueue.length > 0
                  const isRear = index === visibleQueue.length - 1 && visibleQueue.length > 0
                  const isActive = activeStep?.index === index
                  return <div key={index} className="flex w-24 shrink-0 flex-col gap-2"><div className="h-8 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">{isFront ? 'front' : isRear ? 'rear' : ''}</div><div className={`flex h-16 items-center justify-center rounded-lg border font-mono text-lg transition ${value === undefined ? 'border-dashed border-slate-700 text-slate-700' : isActive ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-amber-400/70 bg-amber-400/10 text-amber-100'}`}>{value ?? '·'}</div><span className="text-center text-xs text-slate-600">slot {index}</span></div>
                })}
              </div>
              {visibleQueue.length === 0 && dequeuedValue === undefined && <p className="mt-6 text-center text-sm text-slate-600">Queue is empty</p>}
            </>
          )}
        </div>

        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="queue operations">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p><p className="mt-1 text-sm font-semibold text-white">QueueOps.ts</p></div>
        <div className="grid gap-2 p-4">
          <button type="button" onClick={handlePeek} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-400 hover:text-white">peek()</button>
          <button type="button" onClick={handleIsEmpty} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-400 hover:text-white">isEmpty()</button>
          <button type="button" onClick={handleIsFull} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-400 hover:text-white">isFull()</button>
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">{operationDescription(activeStep)}</div>
      </aside>
    </div>
  )
}

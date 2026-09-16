'use client'

import { useEffect, useState } from 'react'
import { circularDequeue, circularEnqueue, circularIsEmpty, circularIsFull, circularPeek, type CircularQueueState } from '@/lib/algorithms/queue/variants'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

const initialQueue: CircularQueueState = { slots: [18, 42, 27, null, null, null, null, null], front: 0, rear: 2, size: 3 }

const labels: Record<string, string> = {
  enqueue: 'Enqueued value',
  dequeue: 'Dequeued value',
  peek: 'Peeked at front',
  empty: 'Queue is empty',
  notEmpty: 'Queue has values',
  full: 'Queue is full',
  notFull: 'Queue has space',
}

function description(step?: Step) {
  if (!step) return 'Choose an operation to create a step.'
  const label = labels[step.type] ?? step.type
  return step.value === undefined ? label : `${label}: ${step.value}`
}

function stepState(step: Step, fallback: CircularQueueState): CircularQueueState {
  return {
    slots: step.slots ?? fallback.slots,
    front: step.frontIndex ?? fallback.front,
    rear: step.rearIndex ?? fallback.rear,
    size: step.slots?.filter((slot) => slot !== null).length ?? fallback.size,
  }
}

export function CircularQueueVisualizer() {
  const [queue, setQueue] = useState(initialQueue)
  const [steps, setSteps] = useState<Step[]>([])
  const [inputValue, setInputValue] = useState('64')
  const player = useStepPlayer(steps, 420)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const slots = activeStep?.slots ?? queue.slots
  const front = activeStep?.frontIndex ?? queue.front
  const rear = activeStep?.rearIndex ?? queue.rear
  const play = player.play

  useEffect(() => {
    if (steps.length > 0) play()
  }, [steps, play])

  function playOperation(nextSteps: Step[]) {
    setSteps(nextSteps)
    const finalStep = nextSteps[nextSteps.length - 1]
    if (finalStep) setQueue(stepState(finalStep, queue))
  }

  function handleEnqueue() {
    const value = Number(inputValue)
    if (Number.isInteger(value)) playOperation(circularEnqueue(queue, value))
  }

  function handleDequeue() { playOperation(circularDequeue(queue)) }
  function handlePeek() { playOperation(circularPeek(queue)) }
  function handleIsEmpty() { playOperation(circularIsEmpty(queue)) }
  function handleIsFull() { playOperation(circularIsFull(queue)) }

  return (
    <div className="mt-12 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label="circular queue visualizer">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Circular buffer</p><p className="mt-1 text-sm text-slate-500">Front and rear wrap around · {slots.filter((slot) => slot !== null).length} / {slots.length} slots used</p></div><div className="flex flex-wrap items-end gap-2"><label className="text-xs text-slate-500">Value<input type="number" value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="mt-1 block w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" /></label><button type="button" onClick={handleEnqueue} className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-200">Enqueue</button><button type="button" onClick={handleDequeue} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-white">Dequeue</button></div></div>

        <div className="mt-8 flex min-h-[31rem] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6"><div className="relative size-[20rem] max-w-full sm:size-[26rem]"><div className="absolute inset-10 rounded-full border border-dashed border-slate-700" aria-hidden="true" />{slots.map((value, index) => { const angle = (index / slots.length) * 360; const isPointer = index === front || index === rear; const isActive = activeStep?.index === index; return <div key={index} className="absolute left-1/2 top-1/2 flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 sm:w-24" style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-9.5rem) rotate(${-angle}deg)` }}><div className={`flex h-12 w-20 items-center justify-center rounded-lg border font-mono text-lg transition sm:w-24 ${value === null ? 'border-dashed border-slate-700 text-slate-700' : isActive ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-cyan-400/70 bg-cyan-400/10 text-cyan-100'}`}>{value ?? '·'}</div><span className="text-[10px] text-slate-600">slot {index}</span>{isPointer && <span className={`text-[10px] font-bold uppercase tracking-widest ${index === front ? 'text-amber-300' : 'text-rose-300'}`}>{index === front ? 'front' : 'rear'}</span>}</div>})}<div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">wrap-around</p><p className="mt-1 font-mono text-sm text-slate-300">F {front} · R {rear}</p></div></div></div></div>
        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="circular queue operations"><div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p><p className="mt-1 text-sm font-semibold text-white">circularQueueOps.ts</p></div><div className="grid gap-2 p-4"><button type="button" onClick={handlePeek} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-cyan-400 hover:text-white">peek()</button><button type="button" onClick={handleIsEmpty} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-cyan-400 hover:text-white">isEmpty()</button><button type="button" onClick={handleIsFull} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-cyan-400 hover:text-white">isFull()</button></div><div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">{description(activeStep)}</div></aside>
    </div>
  )
}

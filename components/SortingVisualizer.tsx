'use client'

import { useMemo, useState } from 'react'
import { bubbleSort } from '@/lib/algorithms/sorting/bubbleSort'
import { insertionSort } from '@/lib/algorithms/sorting/insertionSort'
import { mergeSort } from '@/lib/algorithms/sorting/mergeSort'
import { quickSort } from '@/lib/algorithms/sorting/quickSort'
import { selectionSort } from '@/lib/algorithms/sorting/selectionSort'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

export type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'

type CodeLine = {
  text: string
  event?: 'compare' | 'swap'
}

const sorters: Record<SortingAlgorithm, (input: number[]) => Step[]> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
}

const codeByAlgorithm: Record<SortingAlgorithm, CodeLine[]> = {
  bubble: [
    { text: 'for end := n - 1 down to 1' },
    { text: '  for i := 0 to end - 1' },
    { text: '    compare values[i], values[i + 1]', event: 'compare' },
    { text: '    if values[i] > values[i + 1]' },
    { text: '      swap values[i], values[i + 1]', event: 'swap' },
  ],
  selection: [
    { text: 'for start := 0 to n - 2' },
    { text: '  minimum := start' },
    { text: '  for i := start + 1 to n - 1' },
    { text: '    compare minimum, i', event: 'compare' },
    { text: '  swap start, minimum', event: 'swap' },
  ],
  insertion: [
    { text: 'for i := 1 to n - 1' },
    { text: '  while i > 0' },
    { text: '    compare i - 1, i', event: 'compare' },
    { text: '    if values[i - 1] > values[i]' },
    { text: '      swap i - 1, i', event: 'swap' },
  ],
  merge: [
    { text: 'split the current range' },
    { text: 'compare left and right values', event: 'compare' },
    { text: 'choose the smaller value' },
    { text: 'shift value into sorted position', event: 'swap' },
  ],
  quick: [
    { text: 'choose the final value as pivot' },
    { text: 'for each value before pivot' },
    { text: '  compare value with pivot', event: 'compare' },
    { text: '  move smaller values left' },
    { text: 'swap pivot into position', event: 'swap' },
  ],
}

function createRandomArray() {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 82) + 14)
}

function barColor(status: string, index: number, isFinished: boolean) {
  if (isFinished) return 'bg-emerald-400'
  if (status === 'compare') return 'bg-yellow-300'
  if (status === 'swap') return 'bg-red-500'
  return ['bg-cyan-400', 'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500'][index % 4]
}

export function SortingVisualizer({ algorithm }: { algorithm: SortingAlgorithm }) {
  const [initialValues, setInitialValues] = useState(createRandomArray)
  const steps = useMemo(() => sorters[algorithm](initialValues), [algorithm, initialValues])
  const player = useStepPlayer(steps, 180)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const values = activeStep?.array ?? initialValues
  const activeIndices = new Set(activeStep?.indices ?? [])
  const isFinished = player.currentStep >= steps.length - 1 && steps.length > 0
  const codeLines = codeByAlgorithm[algorithm]
  const activeLine = activeStep ? codeLines.findIndex((line) => line.event === activeStep.type) : -1

  function generateNewArray() {
    player.reset()
    setInitialValues(createRandomArray())
  }

  return (
    <div className="mt-12 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label={`${algorithm} sort visualizer`}>
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Live sequence</p>
            <p className="mt-1 text-sm text-slate-500">Yellow compares · red swaps · green complete</p>
          </div>
          <button type="button" onClick={generateNewArray} className="w-fit rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-teal-400 hover:text-white">Generate new array</button>
        </div>

        <div className="mt-8 flex h-72 items-end gap-1 rounded-xl border border-slate-800 bg-slate-900/70 px-3 pb-3 pt-5 sm:gap-1.5 sm:px-5">
          {values.map((value, index) => {
            const status = activeIndices.has(index) ? activeStep?.type ?? '' : ''
            return <div key={index} className={`min-w-0 flex-1 rounded-t-sm transition-[height,background-color] duration-150 ${barColor(status, index, isFinished)}`} style={{ height: `${value}%` }} title={`Value ${value}`} />
          })}
        </div>
        <div className="mt-3 flex justify-between text-xs text-slate-500"><span>0</span><span>{values.length} values</span><span>100</span></div>
        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="Algorithm source code">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Source</p><p className="mt-1 text-sm font-semibold text-white">{algorithm}Sort.ts</p></div>
        <div className="overflow-x-auto p-3 font-mono text-xs leading-7">
          {codeLines.map((line, index) => <div key={`${line.text}-${index}`} className={`flex min-w-max rounded px-2 ${index === activeLine ? 'bg-teal-400/15 text-teal-200' : 'text-slate-500'}`}><span className="mr-4 w-5 select-none text-right text-slate-700">{index + 1}</span><code>{line.text}</code></div>)}
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">{activeStep ? `Current action: ${activeStep.type}` : 'Press play or step forward to begin.'}</div>
      </aside>
    </div>
  )
}

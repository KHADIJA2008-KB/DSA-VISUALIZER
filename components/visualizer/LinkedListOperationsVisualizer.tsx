'use client'

import { useEffect, useMemo, useState } from 'react'
import { mergeSortedLists, compareLists, reverseList, type LLStep } from '@/lib/algorithms/linkedList/operations'
import type { Node } from '@/lib/algorithms/linkedList/singlyLinkedList'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

export type Operation = 'reverse' | 'merge' | 'compare'

const initialReverse: Node[] = [
  { id: 'r-0', value: 10, next: 'r-1' },
  { id: 'r-1', value: 20, next: 'r-2' },
  { id: 'r-2', value: 30, next: null },
]
const initialA: Node[] = [
  { id: 'a-0', value: 1, next: 'a-1' },
  { id: 'a-1', value: 4, next: 'a-2' },
  { id: 'a-2', value: 7, next: null },
]
const initialB: Node[] = [
  { id: 'b-0', value: 2, next: 'b-1' },
  { id: 'b-1', value: 3, next: 'b-2' },
  { id: 'b-2', value: 8, next: null },
]

function copyList(list: Node[]) {
  return list.map((node) => ({ ...node }))
}

function toPlayerSteps(steps: LLStep[]): Step[] {
  return steps.map((step) => ({ type: step.type, indices: [], description: step.message }))
}

function listForStep(steps: LLStep[], currentStep: number, fallback: Node[], field: 'listAfter' | 'listAAfter' | 'listBAfter' | 'resultAfter') {
  if (currentStep < 0) return fallback
  return steps[currentStep]?.[field] ?? fallback
}

function nodeTone(node: Node, activeStep: LLStep | undefined, lane: 'a' | 'b' | 'result') {
  const isCompared = activeStep?.comparedNodeIds?.includes(node.id)
  if (!activeStep || !isCompared) return 'border-slate-700 bg-slate-900 text-slate-200'
  if (activeStep.comparison === 'equal') return 'border-emerald-300 bg-emerald-400/20 text-emerald-100 animate-ll-pulse'
  if (activeStep.comparison === 'mismatch') return 'border-red-300 bg-red-400/20 text-red-100 animate-ll-pulse'
  if (lane === 'result') return 'border-teal-300 bg-teal-400/20 text-teal-100'
  return 'border-amber-300 bg-amber-400/20 text-amber-100 animate-ll-pulse'
}

function ListLane({ title, list, activeStep, lane }: { title: string; list: Node[]; activeStep?: LLStep; lane: 'a' | 'b' | 'result' }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 p-4" aria-label={`${title} list`}>
      <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</h2><span className="font-mono text-xs text-slate-600">{list.length} nodes</span></div>
      <div className="mt-4 flex min-h-24 items-center gap-2 overflow-x-auto pb-2">
        {list.map((node, index) => <div key={node.id} className="flex shrink-0 items-center gap-2"><div className={`grid h-16 w-24 place-items-center rounded-lg border font-mono text-xl font-bold transition ${nodeTone(node, activeStep, lane)}`} title={node.id}>{node.value}</div>{index < list.length - 1 && <span className="text-lg text-teal-300" aria-hidden="true">→</span>}</div>)}
        {list.length === 0 && <span className="text-sm text-slate-600">Empty</span>}
      </div>
    </section>
  )
}

export function LinkedListOperationsVisualizer({ initialOperation = 'reverse' }: { initialOperation?: Operation }) {
  const [operation, setOperation] = useState<Operation>(initialOperation)
  const [reverseBase, setReverseBase] = useState(initialReverse)
  const [steps, setSteps] = useState<LLStep[]>([])
  const playerSteps = useMemo(() => toPlayerSteps(steps), [steps])
  const player = useStepPlayer(playerSteps, 620)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const play = player.play

  useEffect(() => {
    if (playerSteps.length > 0) play()
  }, [playerSteps, play])

  function run(nextSteps: LLStep[]) {
    setSteps(nextSteps)
    if (operation === 'reverse') {
      const finalList = nextSteps.at(-1)?.listAfter
      if (finalList) setReverseBase(copyList(finalList))
    }
  }

  function runOperation() {
    if (operation === 'reverse') run(reverseList(reverseBase))
    if (operation === 'merge') run(mergeSortedLists(initialA, initialB))
    if (operation === 'compare') run(compareLists(initialA, initialB))
  }

  function changeOperation(nextOperation: Operation) {
    setOperation(nextOperation)
    setSteps([])
    player.reset()
  }

  const reverseListState = listForStep(steps, player.currentStep, reverseBase, 'listAfter')
  const listA = listForStep(steps, player.currentStep, initialA, 'listAAfter')
  const listB = listForStep(steps, player.currentStep, initialB, 'listBAfter')
  const result = listForStep(steps, player.currentStep, [], 'resultAfter')
  const title = operation === 'reverse' ? 'Reverse linked list' : operation === 'merge' ? 'Merge sorted lists' : 'Compare linked lists'
  const description = operation === 'reverse'
    ? 'Flip each next pointer in place until the tail becomes the new head.'
    : operation === 'merge'
      ? 'Compare the current heads and append the smaller value to the result.'
      : 'Walk both lists in parallel and stop at the first mismatch.'

  return (
    <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label={`${title} visualizer`}>
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Linked-list operation</p><p className="mt-1 text-sm text-slate-500">{description}</p></div><button type="button" onClick={runOperation} className="rounded-lg bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-300">Run operation</button></div><div className="flex w-full max-w-xl rounded-lg border border-slate-700 p-1" role="group" aria-label="Linked-list operation"><button type="button" onClick={() => changeOperation('reverse')} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${operation === 'reverse' ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Reverse</button><button type="button" onClick={() => changeOperation('merge')} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${operation === 'merge' ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Merge</button><button type="button" onClick={() => changeOperation('compare')} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition ${operation === 'compare' ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Compare</button></div></div>
        <div className="mt-6 grid gap-3">
          {operation === 'reverse' ? <ListLane title="Working list" list={reverseListState} activeStep={activeStep} lane="result" /> : <><ListLane title="List A" list={listA} activeStep={activeStep} lane="a" /><ListLane title="List B" list={listB} activeStep={activeStep} lane="b" /><ListLane title="Result" list={result} activeStep={activeStep} lane="result" /></>}
        </div>
        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>
      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="operation narration">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step narration</p><p className="mt-1 text-sm font-semibold text-white">{steps.length ? `${Math.max(player.currentStep + 1, 0)} / ${steps.length} steps` : 'Ready'}</p></div>
        <div className="p-4"><div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{activeStep?.message ?? 'Press Run operation or step forward to begin.'}</div>{operation === 'compare' && activeStep?.comparisonResult && <p className={`mt-4 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest ${activeStep.comparisonResult === 'equal' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'}`}>{activeStep.comparisonResult === 'equal' ? 'Lists equal' : 'Lists not equal'}</p>}{operation === 'merge' && activeStep?.comparedNodeIds && <p className="mt-4 text-xs text-amber-300">Comparing current nodes</p>}</div>
      </aside>
    </div>
  )
}
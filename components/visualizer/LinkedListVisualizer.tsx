'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  deleteAtHead,
  deleteAtIndex,
  deleteAtTail,
  deleteByValue,
  insertAtHead,
  insertAtIndex,
  insertAtTail,
  search,
  type LLStep,
  type Node,
  traverse,
} from '@/lib/algorithms/linkedList/singlyLinkedList'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

const NODE_WIDTH = 160
const NODE_GAP = 72
const ROW_HEIGHT = 150

const initialList: Node[] = [
  { id: 'node-a', value: 12, next: 'node-b' },
  { id: 'node-b', value: 27, next: 'node-c' },
  { id: 'node-c', value: 41, next: null },
]

function toPlayerSteps(steps: LLStep[]): Step[] {
  return steps.map((step) => ({
    type: step.type,
    indices: [],
    description: step.message,
  }))
}

function stepList(steps: LLStep[], currentStep: number, fallback: Node[]) {
  return currentStep >= 0 ? steps[currentStep]?.listAfter ?? fallback : fallback
}

function nodeAt(list: Node[], id: string | undefined) {
  return id ? list.find((node) => node.id === id) : undefined
}

function nodeClass(active: boolean, isNew: boolean) {
  return [
    'relative flex h-24 w-40 shrink-0 flex-col justify-between rounded-xl border p-3 shadow-lg transition-colors',
    active ? 'border-amber-300 bg-amber-300/15 shadow-amber-300/20' : 'border-slate-700 bg-slate-900/95',
    isNew ? 'animate-ll-create' : '',
  ].join(' ')
}

type ArrowProps = {
  from: Node
  to: Node
  fromIndex: number
  toIndex: number
  faded?: boolean
  delayed?: boolean
  drawn?: boolean
}

function Arrow({ fromIndex, toIndex, faded = false, delayed = false, drawn = false }: ArrowProps) {
  const startX = fromIndex * (NODE_WIDTH + NODE_GAP) + NODE_WIDTH
  const endX = toIndex * (NODE_WIDTH + NODE_GAP)
  const y = 68
  const curve = Math.max(16, Math.abs(endX - startX) * 0.28)
  const path = `M ${startX} ${y} C ${startX + curve} ${y}, ${endX - curve} ${y}, ${endX} ${y}`

  return (
    <path
      d={path}
      fill="none"
      stroke={faded ? '#f97316' : '#2dd4bf'}
      strokeLinecap="round"
      strokeWidth="2.5"
      markerEnd="url(#linked-list-arrow)"
      pathLength="100"
      className={drawn ? 'animate-ll-link' : ''}
      style={{
        opacity: faded ? 0 : 1,
        strokeDasharray: drawn ? '100 100' : undefined,
        strokeDashoffset: drawn ? 100 : undefined,
        transition: `opacity 220ms ease ${delayed ? '220ms' : '0ms'}, stroke-dashoffset 520ms ease`,
      }}
    />
  )
}

function LinkLayer({ list, previousList, activeStep }: { list: Node[]; previousList: Node[]; activeStep?: LLStep }) {
  const byId = new Map(list.map((node) => [node.id, node]))
  const indexById = new Map(list.map((node, index) => [node.id, index]))
  const previousById = new Map(previousList.map((node) => [node.id, node]))
  const previousIndexById = new Map(previousList.map((node, index) => [node.id, index]))
  const currentLinks = list.flatMap((node) => {
    const target = node.next ? byId.get(node.next) : undefined
    const targetIndex = target ? indexById.get(target.id) : undefined
    return target && targetIndex !== undefined ? [{ from: node, to: target, fromIndex: indexById.get(node.id) ?? 0, toIndex: targetIndex }] : []
  })
  const oldLinks = previousList.flatMap((node) => {
    const target = node.next ? previousById.get(node.next) : undefined
    const targetIndex = target ? previousIndexById.get(target.id) : undefined
    return target && targetIndex !== undefined ? [{ from: node, to: target, fromIndex: previousIndexById.get(node.id) ?? 0, toIndex: targetIndex }] : []
  })
  const isUnlink = activeStep?.type === 'unlink'
  const width = Math.max(NODE_WIDTH, list.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP)

  return (
    <svg className="pointer-events-none absolute left-0 top-0" width={width} height={ROW_HEIGHT} aria-hidden="true">
      <defs>
        <marker id="linked-list-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5" viewBox="0 0 7 7">
          <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#2dd4bf" />
        </marker>
      </defs>
      {isUnlink && oldLinks.map((link) => <Arrow key={`old-${link.from.id}-${link.to.id}`} {...link} faded />)}
      {currentLinks.map((link) => (
        <Arrow
          key={`${link.from.id}-${link.to.id}`}
          {...link}
          delayed={isUnlink}
          drawn={activeStep?.type === 'link' || isUnlink}
        />
      ))}
    </svg>
  )
}

export function LinkedListVisualizer() {
  const [list, setList] = useState(initialList)
  const [steps, setSteps] = useState<LLStep[]>([])
  const [value, setValue] = useState('55')
  const [index, setIndex] = useState('1')
  const playerSteps = useMemo(() => toPlayerSteps(steps), [steps])
  const player = useStepPlayer(playerSteps, 520)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const previousStep = player.currentStep > 0 ? steps[player.currentStep - 1] : undefined
  const visibleList = stepList(steps, player.currentStep, list)
  const previousList = previousStep?.listAfter ?? list
  const activeNodeId = activeStep?.nodeId
  const exitingNode = activeStep?.type === 'delete' ? nodeAt(previousList, activeNodeId) : undefined
  const rowWidth = Math.max(NODE_WIDTH, visibleList.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP)
  const play = player.play

  useEffect(() => {
    if (playerSteps.length > 0) play()
  }, [playerSteps, play])

  function run(nextSteps: LLStep[]) {
    setSteps(nextSteps)
    const finalState = nextSteps.at(-1)?.listAfter
    if (finalState) setList(finalState)
  }

  function numericValue() {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : undefined
  }

  function numericIndex() {
    const parsed = Number(index)
    return Number.isInteger(parsed) ? parsed : undefined
  }

  function handleInsertAtHead() {
    const parsed = numericValue()
    if (parsed !== undefined) run(insertAtHead(list, parsed))
  }

  function handleInsertAtTail() {
    const parsed = numericValue()
    if (parsed !== undefined) run(insertAtTail(list, parsed))
  }

  function handleInsertAtIndex() {
    const parsedValue = numericValue()
    const parsedIndex = numericIndex()
    if (parsedValue !== undefined && parsedIndex !== undefined) run(insertAtIndex(list, parsedValue, parsedIndex))
  }

  function handleDeleteAtIndex() {
    const parsedIndex = numericIndex()
    if (parsedIndex !== undefined) run(deleteAtIndex(list, parsedIndex))
  }

  function handleDeleteByValue() {
    const parsed = numericValue()
    if (parsed !== undefined) run(deleteByValue(list, parsed))
  }

  const operationLabel = activeStep?.message ?? 'Choose an operation to create a step.'

  return (
    <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label="singly linked list visualizer">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Pointer choreography</p>
            <p className="mt-1 text-sm text-slate-500">{visibleList.length} nodes · head to tail</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-500">Value<input type="number" value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 block w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-400" /></label>
            <label className="text-xs text-slate-500">Index<input type="number" value={index} onChange={(event) => setIndex(event.target.value)} className="mt-1 block w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-400" /></label>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          <div className="relative mx-auto" style={{ minHeight: ROW_HEIGHT, width: rowWidth }}>
            <LinkLayer list={visibleList} previousList={previousList} activeStep={activeStep} />
            {visibleList.map((node, nodeIndex) => {
              const isActive = activeNodeId === node.id && (activeStep?.type === 'visit' || activeStep?.type === 'found')
              const isNew = activeStep?.type === 'create' && activeNodeId === node.id
              return (
                <div key={node.id} className="absolute top-4" style={{ left: nodeIndex * (NODE_WIDTH + NODE_GAP) }}>
                  <div className={nodeClass(Boolean(isActive), Boolean(isNew))}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{node.id}</span>
                    <span className="font-mono text-2xl font-bold text-white">{node.value}</span>
                    <span className="absolute bottom-2 right-2 rounded border border-teal-400/50 px-1.5 py-0.5 font-mono text-[9px] uppercase text-teal-300">next</span>
                  </div>
                  {isActive && <span className="sr-only">Currently visiting node {node.id}</span>}
                </div>
              )
            })}
            {exitingNode && (
              <div className="pointer-events-none absolute top-4 z-10 animate-ll-delete" style={{ left: previousList.indexOf(exitingNode) * (NODE_WIDTH + NODE_GAP) }}>
                <div className="flex h-24 w-40 shrink-0 flex-col justify-between rounded-xl border border-orange-400 bg-orange-400/15 p-3 shadow-lg shadow-orange-400/20">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-orange-300">{exitingNode.id}</span>
                  <span className="font-mono text-2xl font-bold text-orange-100">{exitingNode.value}</span>
                  <span className="text-[9px] uppercase tracking-widest text-orange-300">deleting</span>
                </div>
              </div>
            )}
          </div>
          {visibleList.length === 0 && <p className="py-10 text-center text-sm text-slate-600">The list is empty</p>}
        </div>

        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="linked list operations">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p><p className="mt-1 text-sm font-semibold text-white">singlyLinkedList.ts</p></div>
        <div className="grid gap-2 p-4">
          <button type="button" onClick={handleInsertAtHead} className="rounded-lg bg-teal-400 px-3 py-2 text-left font-mono text-xs font-bold text-slate-950 transition hover:bg-teal-300">insertAtHead(value)</button>
          <button type="button" onClick={handleInsertAtTail} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">insertAtTail(value)</button>
          <button type="button" onClick={handleInsertAtIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">insertAtIndex(value, index)</button>
          <div className="my-1 border-t border-slate-800" />
          <button type="button" onClick={() => run(deleteAtHead(list))} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtHead()</button>
          <button type="button" onClick={() => run(deleteAtTail(list))} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtTail()</button>
          <button type="button" onClick={handleDeleteAtIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtIndex(index)</button>
          <button type="button" onClick={handleDeleteByValue} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteByValue(value)</button>
          <div className="my-1 border-t border-slate-800" />
          <button type="button" onClick={() => run(traverse(list))} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-300 hover:text-white">traverse()</button>
          <button type="button" onClick={() => { const parsed = numericValue(); if (parsed !== undefined) run(search(list, parsed)) }} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-300 hover:text-white">search(value)</button>
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs leading-5 text-slate-500">{operationLabel}</div>
      </aside>
    </div>
  )
}
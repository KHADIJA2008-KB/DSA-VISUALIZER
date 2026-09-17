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
} from '@/lib/algorithms/linkedList/doublyLinkedList'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

const NODE_WIDTH = 176
const NODE_GAP = 76
const ROW_HEIGHT = 166

const initialList: Node[] = [
  { id: 'node-a', value: 12, next: 'node-b', prev: null },
  { id: 'node-b', value: 27, next: 'node-c', prev: 'node-a' },
  { id: 'node-c', value: 41, next: null, prev: 'node-b' },
]

function toPlayerSteps(steps: LLStep[]): Step[] {
  return steps.map((step) => ({ type: step.type, indices: [], description: step.message }))
}

function nodeAt(list: Node[], id: string | undefined) {
  return id ? list.find((node) => node.id === id) : undefined
}

function nodeClass(active: boolean, isNew: boolean) {
  return [
    'relative flex h-28 w-44 shrink-0 flex-col justify-between rounded-xl border p-3 shadow-lg transition-colors',
    active ? 'border-amber-300 bg-amber-300/15 shadow-amber-300/20' : 'border-slate-700 bg-slate-900/95',
    isNew ? 'animate-ll-create' : '',
  ].join(' ')
}

type ArrowProps = {
  fromIndex: number
  toIndex: number
  direction: 'next' | 'prev'
  faded?: boolean
  delayed?: boolean
  drawn?: boolean
}

function Arrow({ fromIndex, toIndex, direction, faded = false, delayed = false, drawn = false }: ArrowProps) {
  const isNext = direction === 'next'
  const startX = fromIndex * (NODE_WIDTH + NODE_GAP) + (isNext ? NODE_WIDTH : 0)
  const endX = toIndex * (NODE_WIDTH + NODE_GAP) + (isNext ? 0 : NODE_WIDTH)
  const y = isNext ? 61 : 102
  const curve = Math.max(18, Math.abs(endX - startX) * 0.28)
  const path = isNext
    ? `M ${startX} ${y} C ${startX + curve} ${y}, ${endX - curve} ${y}, ${endX} ${y}`
    : `M ${startX} ${y} C ${startX - curve} ${y}, ${endX + curve} ${y}, ${endX} ${y}`
  const color = isNext ? '#2dd4bf' : '#60a5fa'

  return (
    <path
      d={path}
      fill="none"
      stroke={faded ? '#f97316' : color}
      strokeLinecap="round"
      strokeWidth="2.5"
      markerEnd={`url(#doubly-list-${direction}-arrow)`}
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
  const links = (source: Node[], targets: Map<string, Node>, indexes: Map<string, number>) => source.flatMap((node) => {
    const nextTarget = node.next ? targets.get(node.next) : undefined
    const prevTarget = node.prev ? targets.get(node.prev) : undefined
    const result: Array<{ fromIndex: number; toIndex: number; direction: 'next' | 'prev' }> = []
    if (nextTarget && indexes.has(nextTarget.id)) result.push({ fromIndex: indexes.get(node.id) ?? 0, toIndex: indexes.get(nextTarget.id) ?? 0, direction: 'next' })
    if (prevTarget && indexes.has(prevTarget.id)) result.push({ fromIndex: indexes.get(node.id) ?? 0, toIndex: indexes.get(prevTarget.id) ?? 0, direction: 'prev' })
    return result
  })
  const currentLinks = links(list, byId, indexById)
  const oldLinks = links(previousList, previousById, previousIndexById)
  const isUnlink = activeStep?.type === 'unlink'
  const width = Math.max(NODE_WIDTH, list.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP)

  return (
    <svg className="pointer-events-none absolute left-0 top-0" width={width} height={ROW_HEIGHT} aria-hidden="true">
      <defs>
        <marker id="doubly-list-next-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5" viewBox="0 0 7 7">
          <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#2dd4bf" />
        </marker>
        <marker id="doubly-list-prev-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5" viewBox="0 0 7 7">
          <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#60a5fa" />
        </marker>
      </defs>
      {isUnlink && oldLinks.map((link, index) => <Arrow key={`old-${link.direction}-${index}`} {...link} faded />)}
      {currentLinks.map((link, index) => <Arrow key={`${link.direction}-${index}`} {...link} delayed={isUnlink} drawn={activeStep?.type === 'link' || isUnlink} />)}
    </svg>
  )
}

export function DoublyLinkedListVisualizer() {
  const [list, setList] = useState(initialList)
  const [steps, setSteps] = useState<LLStep[]>([])
  const [value, setValue] = useState('55')
  const [index, setIndex] = useState('1')
  const playerSteps = useMemo(() => toPlayerSteps(steps), [steps])
  const player = useStepPlayer(playerSteps, 520)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const previousStep = player.currentStep > 0 ? steps[player.currentStep - 1] : undefined
  const visibleList = player.currentStep >= 0 ? steps[player.currentStep]?.listAfter ?? list : list
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

  function numberValue() {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : undefined
  }

  function numberIndex() {
    const parsed = Number(index)
    return Number.isInteger(parsed) ? parsed : undefined
  }

  function insertHead() { const parsed = numberValue(); if (parsed !== undefined) run(insertAtHead(list, parsed)) }
  function insertTail() { const parsed = numberValue(); if (parsed !== undefined) run(insertAtTail(list, parsed)) }
  function insertIndex() { const parsedValue = numberValue(); const parsedIndex = numberIndex(); if (parsedValue !== undefined && parsedIndex !== undefined) run(insertAtIndex(list, parsedValue, parsedIndex)) }
  function deleteIndex() { const parsed = numberIndex(); if (parsed !== undefined) run(deleteAtIndex(list, parsed)) }
  function deleteValue() { const parsed = numberValue(); if (parsed !== undefined) run(deleteByValue(list, parsed)) }
  function findValue() { const parsed = numberValue(); if (parsed !== undefined) run(search(list, parsed)) }

  return (
    <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label="doubly linked list visualizer">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Bidirectional pointers</p>
            <p className="mt-1 text-sm text-slate-500">{visibleList.length} nodes · next and prev links</p>
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
              const active = activeNodeId === node.id && (activeStep?.type === 'visit' || activeStep?.type === 'found')
              const isNew = activeStep?.type === 'create' && activeNodeId === node.id
              return (
                <div key={node.id} className="absolute top-4" style={{ left: nodeIndex * (NODE_WIDTH + NODE_GAP) }}>
                  <div className={nodeClass(Boolean(active), Boolean(isNew))}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{node.id}</span>
                    <span className="font-mono text-2xl font-bold text-white">{node.value}</span>
                    <span className="flex justify-between gap-2 font-mono text-[9px] uppercase tracking-wider"><span className="rounded border border-blue-400/50 px-1.5 py-0.5 text-blue-300">prev</span><span className="rounded border border-teal-400/50 px-1.5 py-0.5 text-teal-300">next</span></span>
                  </div>
                  {active && <span className="sr-only">Currently visiting node {node.id}</span>}
                </div>
              )
            })}
            {exitingNode && (
              <div className="pointer-events-none absolute top-4 z-10 animate-ll-delete" style={{ left: previousList.indexOf(exitingNode) * (NODE_WIDTH + NODE_GAP) }}>
                <div className="flex h-28 w-44 shrink-0 flex-col justify-between rounded-xl border border-orange-400 bg-orange-400/15 p-3 shadow-lg shadow-orange-400/20"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-orange-300">{exitingNode.id}</span><span className="font-mono text-2xl font-bold text-orange-100">{exitingNode.value}</span><span className="text-[9px] uppercase tracking-widest text-orange-300">deleting</span></div>
              </div>
            )}
          </div>
          {visibleList.length === 0 && <p className="py-10 text-center text-sm text-slate-600">The list is empty</p>}
          <div className="mt-2 flex justify-center gap-5 text-[10px] uppercase tracking-widest"><span className="text-teal-300">→ next</span><span className="text-blue-300">← prev</span></div>
        </div>

        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="doubly linked list operations">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p><p className="mt-1 text-sm font-semibold text-white">doublyLinkedList.ts</p></div>
        <div className="grid gap-2 p-4">
          <button type="button" onClick={insertHead} className="rounded-lg bg-teal-400 px-3 py-2 text-left font-mono text-xs font-bold text-slate-950 transition hover:bg-teal-300">insertAtHead(value)</button>
          <button type="button" onClick={insertTail} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">insertAtTail(value)</button>
          <button type="button" onClick={insertIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-teal-400 hover:text-white">insertAtIndex(value, index)</button>
          <div className="my-1 border-t border-slate-800" />
          <button type="button" onClick={() => run(deleteAtHead(list))} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtHead()</button>
          <button type="button" onClick={() => run(deleteAtTail(list))} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtTail()</button>
          <button type="button" onClick={deleteIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtIndex(index)</button>
          <button type="button" onClick={deleteValue} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteByValue(value)</button>
          <div className="my-1 border-t border-slate-800" />
          <button type="button" onClick={() => run(traverse(list))} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-300 hover:text-white">traverse()</button>
          <button type="button" onClick={findValue} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-300 hover:text-white">search(value)</button>
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs leading-5 text-slate-500">{activeStep?.message ?? 'Choose an operation to create a step.'}</div>
      </aside>
    </div>
  )
}
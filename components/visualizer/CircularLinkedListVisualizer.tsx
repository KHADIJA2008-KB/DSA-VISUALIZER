'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  circularDoublyDeleteAtHead,
  circularDoublyDeleteAtIndex,
  circularDoublyDeleteAtTail,
  circularDoublyDeleteByValue,
  circularDoublyInsertAtHead,
  circularDoublyInsertAtIndex,
  circularDoublyInsertAtTail,
  circularDoublySearch,
  circularDoublyTraverse,
  circularSinglyDeleteAtHead,
  circularSinglyDeleteAtIndex,
  circularSinglyDeleteAtTail,
  circularSinglyDeleteByValue,
  circularSinglyInsertAtHead,
  circularSinglyInsertAtIndex,
  circularSinglyInsertAtTail,
  circularSinglySearch,
  circularSinglyTraverse,
  type CircularDoublyNode,
  type CircularSinglyNode,
  type LLStep,
} from '@/lib/algorithms/linkedList/circularLinkedList'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

const CANVAS_WIDTH = 760
const CANVAS_HEIGHT = 560
const NODE_WIDTH = 150
const NODE_HEIGHT = 104

type Mode = 'singly' | 'doubly'
type CircularNode = CircularSinglyNode | CircularDoublyNode
type CircularStep = LLStep<CircularNode>

const initialSingly: CircularSinglyNode[] = [
  { id: 'node-a', value: 12, next: 'node-b' },
  { id: 'node-b', value: 27, next: 'node-c' },
  { id: 'node-c', value: 41, next: 'node-a' },
]
const initialDoubly: CircularDoublyNode[] = [
  { id: 'node-a', value: 12, next: 'node-b', prev: 'node-c' },
  { id: 'node-b', value: 27, next: 'node-c', prev: 'node-a' },
  { id: 'node-c', value: 41, next: 'node-a', prev: 'node-b' },
]

function toPlayerSteps(steps: CircularStep[]): Step[] {
  return steps.map((step) => ({ type: step.type, indices: [], description: step.message }))
}

function position(index: number, count: number) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(count, 1)
  return { x: CANVAS_WIDTH / 2 + Math.cos(angle) * 275, y: CANVAS_HEIGHT / 2 + Math.sin(angle) * 190 }
}

function nodeAt(list: CircularNode[], id: string | undefined) {
  return id ? list.find((node) => node.id === id) : undefined
}

function arrowPath(fromIndex: number, toIndex: number, count: number, direction: 'next' | 'prev') {
  const from = position(fromIndex, count)
  const to = position(toIndex, count)
  const fromAngle = -Math.PI / 2 + (fromIndex * Math.PI * 2) / Math.max(count, 1)
  const toAngle = -Math.PI / 2 + (toIndex * Math.PI * 2) / Math.max(count, 1)
  let midpoint = (fromAngle + toAngle) / 2
  if (Math.abs(fromIndex - toIndex) > 1 || (fromIndex === count - 1 && toIndex === 0) || (direction === 'prev' && fromIndex === 0 && toIndex === count - 1)) midpoint = direction === 'next' ? fromAngle + Math.PI / count : fromAngle - Math.PI / count
  const controlRadiusX = 330
  const controlRadiusY = 245
  const control = { x: CANVAS_WIDTH / 2 + Math.cos(midpoint) * controlRadiusX, y: CANVAS_HEIGHT / 2 + Math.sin(midpoint) * controlRadiusY }
  return `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`
}

type ArrowProps = {
  fromIndex: number
  toIndex: number
  count: number
  direction: 'next' | 'prev'
  faded?: boolean
  delayed?: boolean
  drawn?: boolean
}

function Arrow({ fromIndex, toIndex, count, direction, faded = false, delayed = false, drawn = false }: ArrowProps) {
  const color = direction === 'next' ? '#2dd4bf' : '#60a5fa'
  return (
    <path
      d={arrowPath(fromIndex, toIndex, count, direction)}
      fill="none"
      stroke={faded ? '#f97316' : color}
      strokeLinecap="round"
      strokeWidth="2.5"
      markerEnd={`url(#circular-${direction}-arrow)`}
      pathLength="100"
      className={drawn ? 'animate-ll-link' : ''}
      style={{ opacity: faded ? 0 : 1, strokeDasharray: drawn ? '100 100' : undefined, strokeDashoffset: drawn ? 100 : undefined, transition: `opacity 220ms ease ${delayed ? '220ms' : '0ms'}, stroke-dashoffset 520ms ease` }}
    />
  )
}

function linksFor(list: CircularNode[], direction: 'next' | 'prev') {
  const indexById = new Map(list.map((node, index) => [node.id, index]))
  return list.flatMap((node, fromIndex) => {
    const targetId = direction === 'next' ? node.next : 'prev' in node ? node.prev : null
    const toIndex = targetId ? indexById.get(targetId) : undefined
    return toIndex === undefined ? [] : [{ fromIndex, toIndex }]
  })
}

function LinkLayer({ list, previousList, activeStep, doubly }: { list: CircularNode[]; previousList: CircularNode[]; activeStep?: CircularStep; doubly: boolean }) {
  const directions: Array<'next' | 'prev'> = doubly ? ['next', 'prev'] : ['next']
  const currentLinks = directions.flatMap((direction) => linksFor(list, direction).map((link) => ({ ...link, direction })))
  const oldLinks = directions.flatMap((direction) => linksFor(previousList, direction).map((link) => ({ ...link, direction })))
  const isUnlink = activeStep?.type === 'unlink'
  return (
    <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} aria-hidden="true">
      <defs>
        <marker id="circular-next-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5" viewBox="0 0 7 7"><path d="M 0 0 L 7 3.5 L 0 7 z" fill="#2dd4bf" /></marker>
        <marker id="circular-prev-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5" viewBox="0 0 7 7"><path d="M 0 0 L 7 3.5 L 0 7 z" fill="#60a5fa" /></marker>
      </defs>
      {isUnlink && oldLinks.map((link, index) => <Arrow key={`old-${link.direction}-${index}`} {...link} count={previousList.length} faded />)}
      {currentLinks.map((link, index) => <Arrow key={`${link.direction}-${index}`} {...link} count={list.length} delayed={isUnlink} drawn={activeStep?.type === 'link' || isUnlink} />)}
    </svg>
  )
}

export function CircularLinkedListVisualizer() {
  const [mode, setMode] = useState<Mode>('singly')
  const [singlyList, setSinglyList] = useState<CircularSinglyNode[]>(initialSingly)
  const [doublyList, setDoublyList] = useState<CircularDoublyNode[]>(initialDoubly)
  const [steps, setSteps] = useState<CircularStep[]>([])
  const [value, setValue] = useState('55')
  const [index, setIndex] = useState('1')
  const list: CircularNode[] = mode === 'singly' ? singlyList : doublyList
  const playerSteps = useMemo(() => toPlayerSteps(steps), [steps])
  const player = useStepPlayer(playerSteps, 520)
  const activeStep = player.currentStep >= 0 ? steps[player.currentStep] : undefined
  const previousStep = player.currentStep > 0 ? steps[player.currentStep - 1] : undefined
  const visibleList = player.currentStep >= 0 ? steps[player.currentStep]?.listAfter ?? list : list
  const previousList = previousStep?.listAfter ?? list
  const exitingNode = activeStep?.type === 'delete' ? nodeAt(previousList, activeStep.nodeId) : undefined
  const play = player.play

  useEffect(() => {
    if (playerSteps.length > 0) play()
  }, [playerSteps, play])

  function changeMode(nextMode: Mode) {
    setMode(nextMode)
    setSteps([])
    player.reset()
  }

  function run(nextSteps: CircularStep[]) {
    setSteps(nextSteps)
    const finalState = nextSteps.at(-1)?.listAfter
    if (!finalState) return
    if (mode === 'singly') setSinglyList(finalState as CircularSinglyNode[])
    else setDoublyList(finalState as CircularDoublyNode[])
  }

  function numberValue() { const parsed = Number(value); return Number.isInteger(parsed) ? parsed : undefined }
  function numberIndex() { const parsed = Number(index); return Number.isInteger(parsed) ? parsed : undefined }
  function insertHead() { const parsed = numberValue(); if (parsed === undefined) return; if (mode === 'singly') run(circularSinglyInsertAtHead(singlyList, parsed)); else run(circularDoublyInsertAtHead(doublyList, parsed)) }
  function insertTail() { const parsed = numberValue(); if (parsed === undefined) return; if (mode === 'singly') run(circularSinglyInsertAtTail(singlyList, parsed)); else run(circularDoublyInsertAtTail(doublyList, parsed)) }
  function insertIndex() { const parsedValue = numberValue(); const parsedIndex = numberIndex(); if (parsedValue === undefined || parsedIndex === undefined) return; if (mode === 'singly') run(circularSinglyInsertAtIndex(singlyList, parsedValue, parsedIndex)); else run(circularDoublyInsertAtIndex(doublyList, parsedValue, parsedIndex)) }
  function deleteHead() { if (mode === 'singly') run(circularSinglyDeleteAtHead(singlyList)); else run(circularDoublyDeleteAtHead(doublyList)) }
  function deleteTail() { if (mode === 'singly') run(circularSinglyDeleteAtTail(singlyList)); else run(circularDoublyDeleteAtTail(doublyList)) }
  function deleteIndex() { const parsed = numberIndex(); if (parsed === undefined) return; if (mode === 'singly') run(circularSinglyDeleteAtIndex(singlyList, parsed)); else run(circularDoublyDeleteAtIndex(doublyList, parsed)) }
  function deleteValue() { const parsed = numberValue(); if (parsed === undefined) return; if (mode === 'singly') run(circularSinglyDeleteByValue(singlyList, parsed)); else run(circularDoublyDeleteByValue(doublyList, parsed)) }
  function traverseList() { if (mode === 'singly') run(circularSinglyTraverse(singlyList)); else run(circularDoublyTraverse(doublyList)) }
  function searchList() { const parsed = numberValue(); if (parsed === undefined) return; if (mode === 'singly') run(circularSinglySearch(singlyList, parsed)); else run(circularDoublySearch(doublyList, parsed)) }

  return (
    <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-300/30 dark:shadow-black/30 sm:p-7" aria-label="circular linked list visualizer">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Circular pointer loop</p><p className="mt-1 text-sm text-slate-500">{visibleList.length} nodes · tail wraps to head</p></div>
          <div className="flex rounded-lg border border-slate-700 p-1" role="group" aria-label="Circular linked list mode">
            <button type="button" onClick={() => changeMode('singly')} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${mode === 'singly' ? 'bg-fuchsia-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Singly</button>
            <button type="button" onClick={() => changeMode('doubly')} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${mode === 'doubly' ? 'bg-fuchsia-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Doubly</button>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-5">
          <div className="relative mx-auto" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <div className="absolute inset-[70px] rounded-[50%] border border-dashed border-fuchsia-400/20" />
            <LinkLayer list={visibleList} previousList={previousList} activeStep={activeStep} doubly={mode === 'doubly'} />
            {visibleList.map((node, nodeIndex) => {
              const point = position(nodeIndex, visibleList.length)
              const active = activeStep?.nodeId === node.id && (activeStep.type === 'visit' || activeStep.type === 'found')
              const isNew = activeStep?.type === 'create' && activeStep.nodeId === node.id
              return <div key={node.id} className="absolute" style={{ left: point.x - NODE_WIDTH / 2, top: point.y - NODE_HEIGHT / 2 }}><div className={`relative flex h-[104px] w-[150px] flex-col justify-between rounded-xl border p-3 shadow-xl transition-colors ${active ? 'border-amber-300 bg-amber-300/15 shadow-amber-300/20' : 'border-slate-700 bg-slate-900/95'} ${isNew ? 'animate-ll-create' : ''}`}><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{node.id}</span><span className="font-mono text-2xl font-bold text-white">{node.value}</span><span className="flex justify-between gap-2 font-mono text-[9px] uppercase tracking-wider"><span className="rounded border border-teal-400/50 px-1.5 py-0.5 text-teal-300">next</span>{mode === 'doubly' && <span className="rounded border border-blue-400/50 px-1.5 py-0.5 text-blue-300">prev</span>}</span></div>{active && <span className="sr-only">Currently visiting node {node.id}</span>}</div>
            })}
            {exitingNode && <div className="pointer-events-none absolute z-10 animate-ll-delete" style={{ left: position(previousList.findIndex((node) => node.id === exitingNode.id), previousList.length).x - NODE_WIDTH / 2, top: position(previousList.findIndex((node) => node.id === exitingNode.id), previousList.length).y - NODE_HEIGHT / 2 }}><div className="flex h-[104px] w-[150px] flex-col justify-between rounded-xl border border-orange-400 bg-orange-400/15 p-3 shadow-lg shadow-orange-400/20"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-orange-300">{exitingNode.id}</span><span className="font-mono text-2xl font-bold text-orange-100">{exitingNode.value}</span><span className="text-[9px] uppercase tracking-widest text-orange-300">deleting</span></div></div>}
          </div>
          <div className="flex justify-center gap-5 text-[10px] uppercase tracking-widest"><span className="text-teal-300">→ next</span>{mode === 'doubly' && <span className="text-blue-300">← prev</span>}<span className="text-fuchsia-300">↻ wrap-around</span></div>
        </div>
        <div className="mt-6"><StepControls {...player} currentStep={player.currentStep} totalSteps={steps.length} /></div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl" aria-label="circular linked list operations">
        <div className="border-b border-slate-800 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p><p className="mt-1 text-sm font-semibold text-white">circularLinkedList.ts</p></div>
        <div className="grid gap-2 p-4">
          <label className="text-xs text-slate-500">Value<input type="number" value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400" /></label>
          <label className="text-xs text-slate-500">Index<input type="number" value={index} onChange={(event) => setIndex(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400" /></label>
          <button type="button" onClick={insertHead} className="rounded-lg bg-fuchsia-400 px-3 py-2 text-left font-mono text-xs font-bold text-slate-950 transition hover:bg-fuchsia-300">insertAtHead(value)</button>
          <button type="button" onClick={insertTail} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-fuchsia-400 hover:text-white">insertAtTail(value)</button>
          <button type="button" onClick={insertIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-fuchsia-400 hover:text-white">insertAtIndex(value, index)</button>
          <div className="my-1 border-t border-slate-800" />
          <button type="button" onClick={deleteHead} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtHead()</button>
          <button type="button" onClick={deleteTail} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtTail()</button>
          <button type="button" onClick={deleteIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteAtIndex(index)</button>
          <button type="button" onClick={deleteValue} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-orange-400 hover:text-white">deleteByValue(value)</button>
          <div className="my-1 border-t border-slate-800" />
          <button type="button" onClick={traverseList} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-300 hover:text-white">traverse()</button>
          <button type="button" onClick={searchList} className="rounded-lg border border-slate-700 px-3 py-2 text-left font-mono text-xs text-slate-300 transition hover:border-amber-300 hover:text-white">search(value)</button>
        </div>
        <div className="border-t border-slate-800 px-5 py-4 text-xs leading-5 text-slate-500">{activeStep?.message ?? 'Choose an operation to create a step.'}</div>
      </aside>
    </div>
  )
}
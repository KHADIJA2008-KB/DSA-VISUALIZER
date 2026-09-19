'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TreeVisualizer } from '@/components/visualizer/TreeVisualizer'
import { TreeComplexityCard } from '@/components/visualizer/TreeComplexityCard'
import { TreeModeToggle } from '@/components/visualizer/TreeModeToggle'
import { avlDelete, avlInsert, type AVLStep } from '@/lib/algorithms/tree/avl'
import type { TreeNode } from '@/lib/algorithms/tree/treeTypes'
import { StepControls } from '@/lib/visualizer/StepControls'
import { useStepPlayer } from '@/lib/visualizer/useStepPlayer'
import type { Step } from '@/lib/visualizer/types'

type Operation = {
  kind: 'insert' | 'delete' | 'search'
  value: number
  steps: AVLStep[]
  log: string
}

const EMPTY_TREE: TreeNode[] = []

function copyTree(nodes: TreeNode[]) {
  return nodes.map((node) => ({ ...node }))
}

function makeStep(nodeId: string, message: string, tree: TreeNode[]): AVLStep {
  return { type: 'visit', nodeId, message, treeAfter: copyTree(tree) }
}

function searchOperation(tree: TreeNode[], value: number): Operation {
  const byId = new Map(tree.map((node) => [node.id, node]))
  const steps: AVLStep[] = []
  let current = tree[0]
  while (current) {
    steps.push(makeStep(current.id, `Compared ${value} with ${current.value}.`, tree))
    if (value === current.value) {
      steps.push({ type: 'done', nodeId: current.id, message: `Found ${value}.`, treeAfter: copyTree(tree) })
      return { kind: 'search', value, steps, log: `Found ${value}` }
    }
    const nextId = value < current.value ? current.left : current.right
    current = nextId ? byId.get(nextId) as TreeNode : undefined as unknown as TreeNode
  }
  steps.push({ type: 'done', nodeId: tree[0]?.id ?? 'search', message: `${value} was not found.`, treeAfter: copyTree(tree) })
  return { kind: 'search', value, steps, log: `${value} was not found` }
}

function createOperation(tree: TreeNode[], kind: Operation['kind'], value: number): Operation {
  if (kind === 'search') return searchOperation(tree, value)
  const steps = kind === 'insert' ? avlInsert(tree, tree[0]?.id ?? 'root', value) : avlDelete(tree, tree[0]?.id ?? 'root', value)
  const finalStep = steps.at(-1)
  return {
    kind,
    value,
    steps,
    log: finalStep?.message ?? `${kind === 'insert' ? 'Inserted' : 'Deleted'} ${value}`,
  }
}

function randomValues(count: number) {
  const values = new Set<number>()
  while (values.size < count) values.add(Math.floor(Math.random() * 89) + 10)
  return Array.from(values)
}

function balanceFactors(nodes: TreeNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const heights = new Map<string, number>()
  const height = (id: string | null): number => {
    if (!id) return 0
    if (heights.has(id)) return heights.get(id) as number
    const node = byId.get(id)
    if (!node) return 0
    const value = 1 + Math.max(height(node.left), height(node.right))
    heights.set(id, value)
    return value
  }
  return new Map(nodes.map((node) => [node.id, height(node.left) - height(node.right)]))
}

export default function AvlPage() {
  const [tree, setTree] = useState<TreeNode[]>(EMPTY_TREE)
  const [operation, setOperation] = useState<Operation | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [randomizing, setRandomizing] = useState(false)
  const randomQueue = useRef<number[]>([])
  const playerSteps = useMemo<Step[]>(() => operation?.steps.map((step) => ({ type: step.type, indices: [], description: step.message })) ?? [], [operation])
  const player = useStepPlayer(playerSteps, 420)
  const { play } = player
  const activeStep = operation?.steps[player.currentStep]
  const previousStep = operation?.steps[player.currentStep - 1]
  const isRotation = activeStep?.type === 'rotate'
  const displayTree = isRotation ? activeStep.treeAfter : tree
  const visitedNodeIds = operation?.steps.slice(0, player.currentStep + 1).filter((step) => step.type === 'visit').map((step) => step.nodeId) ?? []
  const balances = useMemo(() => balanceFactors(displayTree), [displayTree])
  const rootId = displayTree[0]?.id ?? ''
  const isBusy = Boolean(operation) || randomizing
  const rotationLabel = isRotation ? `${activeStep.rotationType === 'left' ? 'Left' : activeStep.rotationType === 'right' ? 'Right' : activeStep.rotationType === 'left-right' ? 'Left-right' : 'Right-left'} Rotation` : null
  const rotationAnimation = useMemo(
    () => isRotation ? { beforeNodes: previousStep?.treeAfter ?? tree, key: player.currentStep } : undefined,
    [isRotation, player.currentStep, previousStep, tree],
  )

  const startOperation = useCallback((kind: Operation['kind'], value: number) => {
    if (operation) return
    setOperation(createOperation(tree, kind, value))
    setInputValue('')
  }, [operation, tree])

  useEffect(() => {
    if (operation) play()
  }, [operation, play])

  useEffect(() => {
    if (!operation || player.currentStep !== operation.steps.length - 1) return
    const finalStep = operation.steps.at(-1)
    if (!finalStep) return
    setTree(finalStep.treeAfter)
    setHistory((items) => [operation.log, ...items].slice(0, 8))
    setOperation(null)
  }, [operation, player.currentStep])

  useEffect(() => {
    if (randomizing || operation || randomQueue.current.length === 0) return
    const value = randomQueue.current.shift()
    if (value === undefined) {
      setRandomizing(false)
      return
    }
    const timer = window.setTimeout(() => startOperation('insert', value), 250)
    return () => window.clearTimeout(timer)
  }, [operation, randomizing, startOperation, tree])

  useEffect(() => {
    if (!randomizing || operation || randomQueue.current.length > 0) return
    setRandomizing(false)
  }, [operation, randomizing])

  function parseValue() {
    const value = Number(inputValue)
    return Number.isInteger(value) ? value : undefined
  }

  function handleRandomTree() {
    if (isBusy) return
    randomQueue.current = randomValues(7 + Math.floor(Math.random() * 4))
    setRandomizing(true)
  }

  function handleClear() {
    if (isBusy) return
    setTree([])
    setHistory((items) => ['Cleared tree', ...items].slice(0, 8))
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <Link href="/visualizer" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">← All visualizers</Link>
      <header className="mt-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Self-balancing tree</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl">Keep the branches level.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">Watch AVL rotations preserve fast search as values arrive and leave.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <TreeModeToggle mode="avl" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Repeat the same sequence in BST-only mode to compare shapes.</span>
        </div>
      </header>

      <main className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20" aria-label="AVL tree controls">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-5 dark:border-slate-800">
            <input value={inputValue} onChange={(event) => setInputValue(event.target.value)} type="number" placeholder="Value" aria-label="Tree value" className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            <button type="button" onClick={() => { const value = parseValue(); if (value !== undefined) startOperation('insert', value) }} disabled={isBusy} className="rounded-lg bg-teal-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-40">Insert</button>
            <button type="button" onClick={() => { const value = parseValue(); if (value !== undefined) startOperation('delete', value) }} disabled={isBusy} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">Delete</button>
            <button type="button" onClick={() => { const value = parseValue(); if (value !== undefined) startOperation('search', value) }} disabled={isBusy} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">Search</button>
            <button type="button" onClick={handleRandomTree} disabled={isBusy} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">Random tree</button>
            <button type="button" onClick={handleClear} disabled={isBusy} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">Clear</button>
          </div>

          <div className="relative mt-7">
            <TreeVisualizer
              nodes={displayTree}
              rootId={rootId}
              highlightedNodeId={activeStep?.type === 'done' ? null : activeStep?.nodeId}
              visitedNodeIds={visitedNodeIds}
              balanceFactors={balances}
              rotationAnimation={rotationAnimation}
            />
            {rotationLabel && <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg animate-pulse">{rotationLabel}</div>}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400"><span>Balance factor:</span><span>left height − right height</span></div>
          <p className="mt-3 min-h-6 text-sm text-slate-500 dark:text-slate-400">{activeStep?.message ?? (tree.length === 0 ? 'Start by inserting a value.' : 'Choose an operation to explore the AVL tree.')}</p>
          <div className="mt-4"><StepControls {...player} currentStep={operation ? player.currentStep : -1} totalSteps={operation ? playerSteps.length : undefined} /></div>

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Operation history</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">{history.length > 0 ? history.map((item, index) => <p key={`${item}-${index}`}>{item}</p>) : <p className="text-slate-400">No operations yet.</p>}</div>
          </div>
          <div className="mt-5"><TreeComplexityCard /></div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">AVL rules</p>
          <h2 className="mt-3 text-2xl font-semibold">Balance stays between −1 and 1.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">After each update, AVL checks every ancestor on the path back to the root. A left, right, left-right, or right-left rotation restores the height balance.</p>
          <div className="mt-6 border-t border-slate-800 pt-5 text-sm leading-6 text-slate-400">The small badge on each node shows its current balance factor.</div>
        </aside>
      </main>
    </div>
  )
}
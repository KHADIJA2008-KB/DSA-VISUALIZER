'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { computeTreeLayout, type TreeLayoutPosition } from '@/lib/algorithms/tree/treeLayout'
import type { TreeNode } from '@/lib/algorithms/tree/treeTypes'

type TreeVisualizerProps = {
  nodes: TreeNode[]
  rootId: string
  highlightedNodeId?: string | null
  visitedNodeIds?: string[]
  rotationAnimation?: {
    beforeNodes: TreeNode[]
    key: string | number
  }
  balanceFactors?: Map<string, number>
}

const NODE_RADIUS = 28
const MIN_HORIZONTAL_GAP = 84
const MAX_HORIZONTAL_GAP = 140
const PADDING = 36

function nodePosition(position: TreeLayoutPosition, horizontalGap: number) {
  return {
    x: PADDING + position.x * horizontalGap,
    y: PADDING + position.y,
  }
}

export function TreeVisualizer({
  nodes,
  rootId,
  highlightedNodeId,
  visitedNodeIds = [],
  rotationAnimation,
  balanceFactors,
}: TreeVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateWidth = () => setContainerWidth(container.clientWidth)
    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  const layout = useMemo(() => computeTreeLayout(nodes, rootId), [nodes, rootId])
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const positionById = useMemo(
    () => new Map(layout.map((position) => [position.id, position])),
    [layout],
  )
  const maxX = layout.reduce((maximum, position) => Math.max(maximum, position.x), 0)
  const horizontalGap = Math.max(
    MIN_HORIZONTAL_GAP,
    Math.min(MAX_HORIZONTAL_GAP, (Math.max(containerWidth, 0) - PADDING * 2) / Math.max(maxX, 1)),
  )
  const positionedNodes = useMemo(
    () => layout.map((position) => ({
      node: nodeById.get(position.id),
      position: nodePosition(position, horizontalGap),
    })),
    [layout, nodeById, horizontalGap],
  )
  const beforeLayout = useMemo(
    () => rotationAnimation ? computeTreeLayout(rotationAnimation.beforeNodes, rootId) : [],
    [rotationAnimation, rootId],
  )
  const beforePositionById = useMemo(
    () => new Map(beforeLayout.map((position) => [position.id, nodePosition(position, horizontalGap)])),
    [beforeLayout, horizontalGap],
  )
  const positionByNodeId = useMemo(
    () => new Map(positionedNodes.flatMap(({ node, position }) => node ? [[node.id, position] as const] : [])),
    [positionedNodes],
  )
  const [animatedPositions, setAnimatedPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    if (!rotationAnimation) {
      setAnimatedPositions(positionByNodeId)
      setIsRotating(false)
      return
    }

    const startPositions = new Map<string, { x: number; y: number }>()
    positionByNodeId.forEach((position, id) => startPositions.set(id, beforePositionById.get(id) ?? position))
    setAnimatedPositions(startPositions)
    setIsRotating(true)
    const frame = window.requestAnimationFrame(() => setAnimatedPositions(positionByNodeId))
    const timer = window.setTimeout(() => setIsRotating(false), 520)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [beforePositionById, positionByNodeId, rotationAnimation])
  const svgWidth = Math.max(containerWidth, PADDING * 2 + maxX * horizontalGap)
  const svgHeight = PADDING * 2 + (layout.reduce((maximum, position) => Math.max(maximum, position.y), 0) || 0)
  const visited = new Set(visitedNodeIds)

  return (
    <div ref={containerRef} className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950" aria-label="tree visualizer">
      {layout.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">No tree nodes to display.</div>
      ) : (
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label="Tree structure"
          className="block min-w-full"
        >
          {positionedNodes.flatMap(({ node, position }) => {
            if (!node) return []
            return [node.left, node.right].flatMap((childId) => {
              if (!childId) return []
              const childPosition = positionById.get(childId)
              if (!childPosition) return []
              const child = animatedPositions.get(childId) ?? nodePosition(childPosition, horizontalGap)
              const from = animatedPositions.get(node.id) ?? position
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={from.x}
                  y1={from.y}
                  x2={child.x}
                  y2={child.y}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-300 dark:text-slate-700"
                  style={{ transition: isRotating ? 'x1 520ms ease, y1 520ms ease, x2 520ms ease, y2 520ms ease' : undefined }}
                />
              )
            })
          })}

          {positionedNodes.map(({ node, position }) => {
            if (!node) return null
            const isHighlighted = highlightedNodeId === node.id
            const isVisited = visited.has(node.id)
            const circleClass = isHighlighted
              ? 'tree-node-highlight text-amber-500'
              : isVisited
                ? 'text-teal-500 opacity-60'
                : 'text-slate-700 dark:text-slate-300'
            const fillClass = isHighlighted
              ? 'fill-amber-50 dark:fill-amber-950'
              : isVisited
                ? 'fill-teal-50 dark:fill-teal-950'
                : 'fill-white dark:fill-slate-900'

            return (
              <g
                key={node.id}
                className={circleClass}
                transform={`translate(${(animatedPositions.get(node.id) ?? position).x} ${(animatedPositions.get(node.id) ?? position).y})`}
                style={{ transition: isRotating ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)' : undefined }}
              >
                <circle r={NODE_RADIUS} className={fillClass} stroke="currentColor" strokeWidth="3" />
                <text y="6" textAnchor="middle" className="fill-slate-800 text-sm font-semibold dark:fill-slate-100">
                  {node.value}
                </text>
                {balanceFactors && <text x="22" y="-20" textAnchor="middle" className="fill-teal-700 text-[10px] font-semibold dark:fill-teal-300">{balanceFactors.get(node.id) ?? 0}</text>}
                <title>{`${node.id}: ${node.value}`}</title>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
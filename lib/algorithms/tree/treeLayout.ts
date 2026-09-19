import type { TreeNode } from './treeTypes'

export type TreeLayoutPosition = {
  id: string
  x: number
  y: number
}

const levelHeight = 100

export function computeTreeLayout(nodes: TreeNode[], rootId: string): TreeLayoutPosition[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const positions: TreeLayoutPosition[] = []
  const visited = new Set<string>()
  let nextX = 0

  function layoutNode(nodeId: string, depth: number): TreeLayoutPosition | null {
    const node = nodesById.get(nodeId)
    if (!node || visited.has(nodeId)) return null

    visited.add(nodeId)
    const left = node.left === null ? null : layoutNode(node.left, depth + 1)
    const right = node.right === null ? null : layoutNode(node.right, depth + 1)
    const x = left && right ? (left.x + right.x) / 2 : nextX++
    const position = { id: node.id, x, y: depth * levelHeight }

    positions.push(position)
    return position
  }

  layoutNode(rootId, 0)
  return positions
}
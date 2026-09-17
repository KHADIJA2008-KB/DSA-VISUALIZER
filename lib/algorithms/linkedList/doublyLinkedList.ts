export type Node = {
  id: string
  value: number
  next: string | null
  prev: string | null
}

export type LLStep = {
  type: 'visit' | 'create' | 'link' | 'unlink' | 'delete' | 'found' | 'not-found'
  nodeId?: string
  fromId?: string
  toId?: string | null
  direction?: 'next' | 'prev'
  listAfter: Node[]
  message: string
}

function copyList(list: Node[]): Node[] {
  return list.map((node) => ({ ...node }))
}

function step(
  type: LLStep['type'],
  list: Node[],
  message: string,
  details: Pick<LLStep, 'nodeId' | 'fromId' | 'toId' | 'direction'> = {},
): LLStep {
  return { type, ...details, listAfter: copyList(list), message }
}

function nextNodeId(list: Node[]): string {
  const ids = new Set(list.map((node) => node.id))
  let number = 1
  while (ids.has(`node-${number}`)) number += 1
  return `node-${number}`
}

function newNode(list: Node[], value: number): Node {
  return { id: nextNodeId(list), value, next: null, prev: null }
}

function validInsertIndex(list: Node[], index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index <= list.length
}

function validNodeIndex(list: Node[], index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < list.length
}

function invalidIndex(list: Node[], index: number, operation: string): LLStep[] {
  return [step('not-found', list, `${operation}: index ${index} is out of bounds.`)]
}

export function traverse(list: Node[]): LLStep[] {
  const steps: LLStep[] = []
  const byId = new Map(list.map((node) => [node.id, node]))
  const visited = new Set<string>()
  let node: Node | undefined = list[0]

  while (node && !visited.has(node.id)) {
    visited.add(node.id)
    steps.push(step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
    node = node.next === null ? undefined : byId.get(node.next)
  }

  return steps.length > 0 ? steps : [step('not-found', list, 'The list is empty.')]
}

export function insertAtHead(list: Node[], value: number): LLStep[] {
  const node = newNode(list, value)
  const nextList = [node, ...copyList(list)]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]

  if (list.length === 0) return steps

  node.next = nextList[1].id
  steps.push(step('link', nextList, `Linked ${node.id}.next to ${node.next}.`, {
    nodeId: node.id,
    fromId: node.id,
    toId: node.next,
    direction: 'next',
  }))

  nextList[1].prev = node.id
  steps.push(step('link', nextList, `Linked ${nextList[1].id}.prev to ${node.id}.`, {
    nodeId: nextList[1].id,
    fromId: nextList[1].id,
    toId: node.id,
    direction: 'prev',
  }))
  return steps
}

export function insertAtTail(list: Node[], value: number): LLStep[] {
  const node = newNode(list, value)
  const nextList = [...copyList(list), node]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]

  if (list.length === 0) return steps

  const tail = nextList[nextList.length - 2]
  tail.next = node.id
  steps.push(step('link', nextList, `Linked ${tail.id}.next to ${node.id}.`, {
    nodeId: tail.id,
    fromId: tail.id,
    toId: node.id,
    direction: 'next',
  }))

  node.prev = tail.id
  steps.push(step('link', nextList, `Linked ${node.id}.prev to ${tail.id}.`, {
    nodeId: node.id,
    fromId: node.id,
    toId: tail.id,
    direction: 'prev',
  }))
  return steps
}

export function insertAtIndex(list: Node[], value: number, index: number): LLStep[] {
  if (!validInsertIndex(list, index)) return invalidIndex(list, index, 'Insert')
  if (index === 0) return insertAtHead(list, value)
  if (index === list.length) return insertAtTail(list, value)

  const nextList = copyList(list)
  const node = newNode(list, value)
  nextList.splice(index, 0, node)
  const previous = nextList[index - 1]
  const successor = nextList[index + 1]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]

  previous.next = node.id
  node.next = successor.id
  steps.push(step('link', nextList, `Linked ${previous.id}.next to ${node.id}.`, {
    nodeId: previous.id,
    fromId: previous.id,
    toId: node.id,
    direction: 'next',
  }))

  successor.prev = node.id
  node.prev = previous.id
  steps.push(step('link', nextList, `Linked ${successor.id}.prev to ${node.id}.`, {
    nodeId: successor.id,
    fromId: successor.id,
    toId: node.id,
    direction: 'prev',
  }))
  return steps
}

function deleteAtPosition(list: Node[], position: number): LLStep[] {
  const nextList = copyList(list)
  const target = nextList[position]
  const previous = position > 0 ? nextList[position - 1] : undefined
  const successor = position + 1 < nextList.length ? nextList[position + 1] : undefined
  const steps: LLStep[] = []

  if (previous) {
    previous.next = successor?.id ?? null
    steps.push(step('unlink', nextList, `Unlinked ${previous.id}.next from ${target.id}.`, {
      nodeId: previous.id,
      fromId: previous.id,
      toId: target.id,
      direction: 'next',
    }))
  } else {
    target.next = null
    steps.push(step('unlink', nextList, `Unlinked head ${target.id}.next.`, {
      nodeId: target.id,
      fromId: target.id,
      toId: successor?.id ?? null,
      direction: 'next',
    }))
  }

  if (successor) {
    successor.prev = previous?.id ?? null
    steps.push(step('unlink', nextList, `Unlinked ${successor.id}.prev from ${target.id}.`, {
      nodeId: successor.id,
      fromId: successor.id,
      toId: target.id,
      direction: 'prev',
    }))
  } else {
    target.prev = null
    steps.push(step('unlink', nextList, `Unlinked tail ${target.id}.prev.`, {
      nodeId: target.id,
      fromId: target.id,
      toId: previous?.id ?? null,
      direction: 'prev',
    }))
  }

  nextList.splice(position, 1)
  steps.push(step('delete', nextList, `Deleted node ${target.id} with value ${target.value}.`, { nodeId: target.id }))
  return steps
}

export function deleteAtHead(list: Node[]): LLStep[] {
  return list.length === 0 ? [step('not-found', list, 'Cannot delete the head of an empty list.')] : deleteAtPosition(list, 0)
}

export function deleteAtTail(list: Node[]): LLStep[] {
  return list.length === 0
    ? [step('not-found', list, 'Cannot delete the tail of an empty list.')]
    : deleteAtPosition(list, list.length - 1)
}

export function deleteAtIndex(list: Node[], index: number): LLStep[] {
  return !validNodeIndex(list, index) ? invalidIndex(list, index, 'Delete') : deleteAtPosition(list, index)
}

export function deleteByValue(list: Node[], value: number): LLStep[] {
  const position = list.findIndex((node) => node.value === value)
  return position === -1
    ? [step('not-found', list, `Value ${value} was not found.`)]
    : deleteAtPosition(list, position)
}

export function search(list: Node[], value: number): LLStep[] {
  const steps: LLStep[] = []
  const position = list.findIndex((node) => node.value === value)
  const end = position === -1 ? list.length : position + 1

  for (let index = 0; index < end; index += 1) {
    const node = list[index]
    steps.push(step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
  }

  if (position === -1) return [...steps, step('not-found', list, `Value ${value} was not found.`)]
  return [...steps, step('found', list, `Found value ${value} in node ${list[position].id}.`, { nodeId: list[position].id })]
}
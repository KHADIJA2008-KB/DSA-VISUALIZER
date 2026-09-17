export type Node = {
  id: string
  value: number
  next: string | null
}

export type LLStep = {
  type: 'visit' | 'create' | 'link' | 'unlink' | 'delete' | 'found' | 'not-found'
  nodeId?: string
  fromId?: string
  toId?: string | null
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
  details: Pick<LLStep, 'nodeId' | 'fromId' | 'toId'> = {},
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
  return { id: nextNodeId(list), value, next: null }
}

function indexOfNode(list: Node[], index: number): number {
  return Number.isInteger(index) && index >= 0 && index < list.length ? index : -1
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

  if (steps.length === 0) {
    steps.push(step('not-found', list, 'The list is empty.'))
  }

  return steps
}

export function insertAtHead(list: Node[], value: number): LLStep[] {
  const node = newNode(list, value)
  const nextList = [node, ...copyList(list)]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]

  if (list.length === 0) return steps

  node.next = list[0].id
  steps.push(step('link', nextList, `Linked ${node.id} to the previous head ${node.next}.`, {
    nodeId: node.id,
    fromId: node.id,
    toId: node.next,
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
  steps.push(step('link', nextList, `Linked tail ${tail.id} to ${node.id}.`, {
    nodeId: tail.id,
    fromId: tail.id,
    toId: node.id,
  }))
  return steps
}

export function insertAtIndex(list: Node[], value: number, index: number): LLStep[] {
  if (!Number.isInteger(index) || index < 0 || index > list.length) {
    return invalidIndex(list, index, 'Insert')
  }
  if (index === 0) return insertAtHead(list, value)
  if (index === list.length) return insertAtTail(list, value)

  const node = newNode(list, value)
  const nextList = copyList(list)
  nextList.splice(index, 0, node)
  const previous = nextList[index - 1]
  const successor = nextList[index + 1]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]

  node.next = successor.id
  previous.next = node.id
  steps.push(step('link', nextList, `Linked ${previous.id} to ${node.id}, then to ${successor.id}.`, {
    nodeId: node.id,
    fromId: previous.id,
    toId: node.id,
  }))
  return steps
}

function deleteAtPosition(list: Node[], position: number): LLStep[] {
  const nextList = copyList(list)
  const target = nextList[position]
  const steps: LLStep[] = []

  if (position > 0) {
    const previous = nextList[position - 1]
    const successor = position + 1 < nextList.length ? nextList[position + 1].id : null
    previous.next = successor
    steps.push(step('unlink', nextList, `Unlinked ${previous.id} from ${target.id}.`, {
      nodeId: previous.id,
      fromId: previous.id,
      toId: target.id,
    }))
  } else {
    target.next = null
    steps.push(step('unlink', nextList, `Unlinked head node ${target.id}.`, {
      nodeId: target.id,
      fromId: target.id,
      toId: null,
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
  const position = indexOfNode(list, index)
  return position === -1 ? invalidIndex(list, index, 'Delete') : deleteAtPosition(list, position)
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

  for (let index = 0; index <= (position === -1 ? list.length - 1 : position); index += 1) {
    const node = list[index]
    steps.push(step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
  }

  if (position === -1) {
    steps.push(step('not-found', list, `Value ${value} was not found.`))
  } else {
    const node = list[position]
    steps.push(step('found', list, `Found value ${value} in node ${node.id}.`, { nodeId: node.id }))
  }
  return steps
}
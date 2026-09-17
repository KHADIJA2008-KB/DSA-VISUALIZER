export type CircularSinglyNode = {
  id: string
  value: number
  next: string | null
}

export type CircularDoublyNode = {
  id: string
  value: number
  next: string | null
  prev: string | null
}

export type LLStep<Node extends CircularSinglyNode | CircularDoublyNode = CircularSinglyNode | CircularDoublyNode> = {
  type: 'visit' | 'create' | 'link' | 'unlink' | 'delete' | 'found' | 'not-found'
  nodeId?: string
  fromId?: string
  toId?: string | null
  direction?: 'next' | 'prev'
  listAfter: Node[]
  message: string
}

function copyList<Node extends CircularSinglyNode | CircularDoublyNode>(list: Node[]): Node[] {
  return list.map((node) => ({ ...node }))
}

function step<Node extends CircularSinglyNode | CircularDoublyNode>(
  type: LLStep<Node>['type'],
  list: Node[],
  message: string,
  details: Pick<LLStep<Node>, 'nodeId' | 'fromId' | 'toId' | 'direction'> = {},
): LLStep<Node> {
  return { type, ...details, listAfter: copyList(list), message }
}

function newId(list: Array<CircularSinglyNode | CircularDoublyNode>): string {
  const ids = new Set(list.map((node) => node.id))
  let number = 1
  while (ids.has(`node-${number}`)) number += 1
  return `node-${number}`
}

function validInsertIndex(length: number, index: number) {
  return Number.isInteger(index) && index >= 0 && index <= length
}

function validIndex(length: number, index: number) {
  return Number.isInteger(index) && index >= 0 && index < length
}

function invalidIndex<Node extends CircularSinglyNode | CircularDoublyNode>(list: Node[], index: number, operation: string): LLStep<Node>[] {
  return [step('not-found', list, `${operation}: index ${index} is out of bounds.`)]
}

function singlyTraversal(list: CircularSinglyNode[]): LLStep<CircularSinglyNode>[] {
  if (list.length === 0) return [step('not-found', list, 'The circular list is empty.')]
  const byId = new Map(list.map((node) => [node.id, node]))
  const steps: LLStep<CircularSinglyNode>[] = []
  const visited = new Set<string>()
  let node: CircularSinglyNode | undefined = list[0]

  while (node && !visited.has(node.id)) {
    visited.add(node.id)
    steps.push(step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
    node = node.next === null ? undefined : byId.get(node.next)
  }
  return steps
}

function singlyNewNode(list: CircularSinglyNode[], value: number): CircularSinglyNode {
  return { id: newId(list), value, next: null }
}

export function circularSinglyTraverse(list: CircularSinglyNode[]) {
  return singlyTraversal(list)
}

export function circularSinglyInsertAtHead(list: CircularSinglyNode[], value: number): LLStep<CircularSinglyNode>[] {
  const node = singlyNewNode(list, value)
  const nextList = [node, ...copyList(list)]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]
  const head = list[0]
  const tail = list[list.length - 1]

  if (!head || !tail) {
    node.next = node.id
    return [...steps, step('link', nextList, `Linked ${node.id}.next back to itself.`, { nodeId: node.id, fromId: node.id, toId: node.id, direction: 'next' })]
  }

  node.next = head.id
  steps.push(step('link', nextList, `Linked ${node.id}.next to ${head.id}.`, { nodeId: node.id, fromId: node.id, toId: head.id, direction: 'next' }))
  nextList[nextList.length - 1].next = node.id
  steps.push(step('link', nextList, `Linked tail ${tail.id}.next back to ${node.id}.`, { nodeId: tail.id, fromId: tail.id, toId: node.id, direction: 'next' }))
  return steps
}

export function circularSinglyInsertAtTail(list: CircularSinglyNode[], value: number): LLStep<CircularSinglyNode>[] {
  const node = singlyNewNode(list, value)
  const nextList = [...copyList(list), node]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]
  const head = list[0]
  const tail = list[list.length - 1]

  if (!head || !tail) {
    node.next = node.id
    return [...steps, step('link', nextList, `Linked ${node.id}.next back to itself.`, { nodeId: node.id, fromId: node.id, toId: node.id, direction: 'next' })]
  }

  nextList[nextList.length - 2].next = node.id
  steps.push(step('link', nextList, `Linked ${tail.id}.next to ${node.id}.`, { nodeId: tail.id, fromId: tail.id, toId: node.id, direction: 'next' }))
  node.next = head.id
  steps.push(step('link', nextList, `Linked ${node.id}.next back to head ${head.id}.`, { nodeId: node.id, fromId: node.id, toId: head.id, direction: 'next' }))
  return steps
}

export function circularSinglyInsertAtIndex(list: CircularSinglyNode[], value: number, index: number): LLStep<CircularSinglyNode>[] {
  if (!validInsertIndex(list.length, index)) return invalidIndex(list, index, 'Insert')
  if (index === 0) return circularSinglyInsertAtHead(list, value)
  if (index === list.length) return circularSinglyInsertAtTail(list, value)

  const nextList = copyList(list)
  const node = singlyNewNode(list, value)
  nextList.splice(index, 0, node)
  const previous = nextList[index - 1]
  const successor = nextList[index + 1]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]
  previous.next = node.id
  node.next = successor.id
  steps.push(step('link', nextList, `Linked ${previous.id}.next to ${node.id}.`, { nodeId: previous.id, fromId: previous.id, toId: node.id, direction: 'next' }))
  return steps
}

function circularSinglyDeleteAtPosition(list: CircularSinglyNode[], position: number): LLStep<CircularSinglyNode>[] {
  const nextList = copyList(list)
  const target = nextList[position]
  const previous = position === 0 ? nextList[nextList.length - 1] : nextList[position - 1]
  const successor = nextList.length === 1 ? undefined : position === nextList.length - 1 ? nextList[0] : nextList[position + 1]
  const steps: LLStep<CircularSinglyNode>[] = []
  previous.next = successor?.id ?? null
  steps.push(step('unlink', nextList, `Unlinked ${previous.id}.next from ${target.id}.`, { nodeId: previous.id, fromId: previous.id, toId: target.id, direction: 'next' }))
  target.next = null
  nextList.splice(position, 1)
  steps.push(step('delete', nextList, `Deleted node ${target.id} with value ${target.value}.`, { nodeId: target.id }))
  return steps
}

export function circularSinglyDeleteAtHead(list: CircularSinglyNode[]) {
  return list.length === 0 ? [step('not-found', list, 'Cannot delete the head of an empty circular list.')] : circularSinglyDeleteAtPosition(list, 0)
}

export function circularSinglyDeleteAtTail(list: CircularSinglyNode[]) {
  return list.length === 0 ? [step('not-found', list, 'Cannot delete the tail of an empty circular list.')] : circularSinglyDeleteAtPosition(list, list.length - 1)
}

export function circularSinglyDeleteAtIndex(list: CircularSinglyNode[], index: number) {
  return !validIndex(list.length, index) ? invalidIndex(list, index, 'Delete') : circularSinglyDeleteAtPosition(list, index)
}

export function circularSinglyDeleteByValue(list: CircularSinglyNode[], value: number) {
  const index = list.findIndex((node) => node.value === value)
  return index === -1 ? [step('not-found', list, `Value ${value} was not found.`)] : circularSinglyDeleteAtPosition(list, index)
}

export function circularSinglySearch(list: CircularSinglyNode[], value: number): LLStep<CircularSinglyNode>[] {
  const index = list.findIndex((node) => node.value === value)
  const steps = list.slice(0, index === -1 ? list.length : index + 1).map((node) => step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
  return index === -1 ? [...steps, step('not-found', list, `Value ${value} was not found.`)] : [...steps, step('found', list, `Found value ${value} in node ${list[index].id}.`, { nodeId: list[index].id })]
}

function doublyTraversal(list: CircularDoublyNode[]): LLStep<CircularDoublyNode>[] {
  if (list.length === 0) return [step('not-found', list, 'The circular list is empty.')]
  const byId = new Map(list.map((node) => [node.id, node]))
  const steps: LLStep<CircularDoublyNode>[] = []
  const visited = new Set<string>()
  let node: CircularDoublyNode | undefined = list[0]
  while (node && !visited.has(node.id)) {
    visited.add(node.id)
    steps.push(step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
    node = node.next === null ? undefined : byId.get(node.next)
  }
  return steps
}

function doublyNewNode(list: CircularDoublyNode[], value: number): CircularDoublyNode {
  return { id: newId(list), value, next: null, prev: null }
}

export function circularDoublyTraverse(list: CircularDoublyNode[]) {
  return doublyTraversal(list)
}

function doublyLink<Node extends CircularDoublyNode>(steps: LLStep<Node>[], list: Node[], nodeId: string, fromId: string, toId: string | null, direction: 'next' | 'prev', message: string) {
  steps.push(step('link', list, message, { nodeId, fromId, toId, direction }))
}

export function circularDoublyInsertAtHead(list: CircularDoublyNode[], value: number): LLStep<CircularDoublyNode>[] {
  const node = doublyNewNode(list, value)
  const nextList = [node, ...copyList(list)]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]
  const head = list[0]
  const tail = list[list.length - 1]
  if (!head || !tail) {
    node.next = node.id
    node.prev = node.id
    doublyLink(steps, nextList, node.id, node.id, node.id, 'next', `Linked ${node.id}.next back to itself.`)
    doublyLink(steps, nextList, node.id, node.id, node.id, 'prev', `Linked ${node.id}.prev back to itself.`)
    return steps
  }
  node.next = head.id
  node.prev = tail.id
  nextList[1].prev = node.id
  nextList[nextList.length - 1].next = node.id
  doublyLink(steps, nextList, node.id, node.id, head.id, 'next', `Linked ${node.id}.next to ${head.id}.`)
  doublyLink(steps, nextList, node.id, node.id, tail.id, 'prev', `Linked ${node.id}.prev to ${tail.id}.`)
  doublyLink(steps, nextList, head.id, head.id, node.id, 'prev', `Linked ${head.id}.prev to ${node.id}.`)
  doublyLink(steps, nextList, tail.id, tail.id, node.id, 'next', `Linked tail ${tail.id}.next to ${node.id}.`)
  return steps
}

export function circularDoublyInsertAtTail(list: CircularDoublyNode[], value: number): LLStep<CircularDoublyNode>[] {
  const node = doublyNewNode(list, value)
  const nextList = [...copyList(list), node]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]
  const head = list[0]
  const tail = list[list.length - 1]
  if (!head || !tail) {
    node.next = node.id
    node.prev = node.id
    doublyLink(steps, nextList, node.id, node.id, node.id, 'next', `Linked ${node.id}.next back to itself.`)
    doublyLink(steps, nextList, node.id, node.id, node.id, 'prev', `Linked ${node.id}.prev back to itself.`)
    return steps
  }
  node.prev = tail.id
  node.next = head.id
  nextList[nextList.length - 2].next = node.id
  nextList[0].prev = node.id
  doublyLink(steps, nextList, tail.id, tail.id, node.id, 'next', `Linked ${tail.id}.next to ${node.id}.`)
  doublyLink(steps, nextList, node.id, node.id, tail.id, 'prev', `Linked ${node.id}.prev to ${tail.id}.`)
  doublyLink(steps, nextList, node.id, node.id, head.id, 'next', `Linked ${node.id}.next to head ${head.id}.`)
  doublyLink(steps, nextList, head.id, head.id, node.id, 'prev', `Linked head ${head.id}.prev to ${node.id}.`)
  return steps
}

export function circularDoublyInsertAtIndex(list: CircularDoublyNode[], value: number, index: number): LLStep<CircularDoublyNode>[] {
  if (!validInsertIndex(list.length, index)) return invalidIndex(list, index, 'Insert')
  if (index === 0) return circularDoublyInsertAtHead(list, value)
  if (index === list.length) return circularDoublyInsertAtTail(list, value)
  const nextList = copyList(list)
  const node = doublyNewNode(list, value)
  nextList.splice(index, 0, node)
  const previous = nextList[index - 1]
  const successor = nextList[index + 1]
  const steps = [step('create', nextList, `Created node ${node.id} with value ${value}.`, { nodeId: node.id })]
  node.prev = previous.id
  node.next = successor.id
  previous.next = node.id
  successor.prev = node.id
  doublyLink(steps, nextList, previous.id, previous.id, node.id, 'next', `Linked ${previous.id}.next to ${node.id}.`)
  doublyLink(steps, nextList, node.id, node.id, previous.id, 'prev', `Linked ${node.id}.prev to ${previous.id}.`)
  doublyLink(steps, nextList, node.id, node.id, successor.id, 'next', `Linked ${node.id}.next to ${successor.id}.`)
  doublyLink(steps, nextList, successor.id, successor.id, node.id, 'prev', `Linked ${successor.id}.prev to ${node.id}.`)
  return steps
}

function circularDoublyDeleteAtPosition(list: CircularDoublyNode[], position: number): LLStep<CircularDoublyNode>[] {
  const nextList = copyList(list)
  const target = nextList[position]
  const previous = nextList.length === 1 ? undefined : position === 0 ? nextList[nextList.length - 1] : nextList[position - 1]
  const successor = nextList.length === 1 ? undefined : position === nextList.length - 1 ? nextList[0] : nextList[position + 1]
  const steps: LLStep<CircularDoublyNode>[] = []
  if (previous && successor) {
    previous.next = successor.id
    successor.prev = previous.id
    doublyLink(steps, nextList, previous.id, previous.id, target.id, 'next', `Unlinked ${previous.id}.next from ${target.id}.`)
    doublyLink(steps, nextList, successor.id, successor.id, target.id, 'prev', `Unlinked ${successor.id}.prev from ${target.id}.`)
  } else {
    target.next = null
    target.prev = null
    doublyLink(steps, nextList, target.id, target.id, target.id, 'next', `Unlinked ${target.id}.next.`)
    doublyLink(steps, nextList, target.id, target.id, target.id, 'prev', `Unlinked ${target.id}.prev.`)
  }
  target.next = null
  target.prev = null
  nextList.splice(position, 1)
  steps.push(step('delete', nextList, `Deleted node ${target.id} with value ${target.value}.`, { nodeId: target.id }))
  return steps
}

export function circularDoublyDeleteAtHead(list: CircularDoublyNode[]) {
  return list.length === 0 ? [step('not-found', list, 'Cannot delete the head of an empty circular list.')] : circularDoublyDeleteAtPosition(list, 0)
}

export function circularDoublyDeleteAtTail(list: CircularDoublyNode[]) {
  return list.length === 0 ? [step('not-found', list, 'Cannot delete the tail of an empty circular list.')] : circularDoublyDeleteAtPosition(list, list.length - 1)
}

export function circularDoublyDeleteAtIndex(list: CircularDoublyNode[], index: number) {
  return !validIndex(list.length, index) ? invalidIndex(list, index, 'Delete') : circularDoublyDeleteAtPosition(list, index)
}

export function circularDoublyDeleteByValue(list: CircularDoublyNode[], value: number) {
  const index = list.findIndex((node) => node.value === value)
  return index === -1 ? [step('not-found', list, `Value ${value} was not found.`)] : circularDoublyDeleteAtPosition(list, index)
}

export function circularDoublySearch(list: CircularDoublyNode[], value: number): LLStep<CircularDoublyNode>[] {
  const index = list.findIndex((node) => node.value === value)
  const steps = list.slice(0, index === -1 ? list.length : index + 1).map((node) => step('visit', list, `Visited node ${node.id} with value ${node.value}.`, { nodeId: node.id }))
  return index === -1 ? [...steps, step('not-found', list, `Value ${value} was not found.`)] : [...steps, step('found', list, `Found value ${value} in node ${list[index].id}.`, { nodeId: list[index].id })]
}
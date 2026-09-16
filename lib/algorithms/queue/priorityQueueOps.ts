import type { Step } from '@/lib/visualizer/types'

export type PriorityQueueItem = {
  value: number
  priority: number
}

export const DEFAULT_PRIORITY_QUEUE_CAPACITY = 8

function values(queue: readonly PriorityQueueItem[]) {
  return queue.map((item) => item.value)
}

function priorities(queue: readonly PriorityQueueItem[]) {
  return queue.map((item) => item.priority)
}

function stateStep(type: string, queue: readonly PriorityQueueItem[], index = -1, value?: number, comparisonIndex?: number): Step {
  return {
    type,
    indices: index >= 0 ? [index] : [],
    index,
    value,
    array: values(queue),
    priorities: priorities(queue),
    comparisonIndex,
  }
}

export function enqueue(queue: readonly PriorityQueueItem[], value: number, priority: number, capacity = DEFAULT_PRIORITY_QUEUE_CAPACITY): Step[] {
  if (queue.length >= capacity) return [stateStep('full', queue, -1, value)]

  const steps: Step[] = []
  const item = { value, priority }
  for (let index = queue.length - 1; index >= 0; index -= 1) {
    steps.push(stateStep('compare', queue, index, value, index))
    if (queue[index].priority >= priority) break
  }

  const nextQueue = [...queue, item].sort((left, right) => right.priority - left.priority)
  steps.push(stateStep('enqueue', nextQueue, nextQueue.findIndex((entry) => entry.value === value && entry.priority === priority), value))
  return steps
}

export function dequeue(queue: readonly PriorityQueueItem[]): Step[] {
  if (queue.length === 0) return [stateStep('empty', queue)]
  return [stateStep('dequeue', queue.slice(1), 0, queue[0].value)]
}

export function peek(queue: readonly PriorityQueueItem[]): Step[] {
  if (queue.length === 0) return [stateStep('empty', queue)]
  return [stateStep('peek', queue, 0, queue[0].value)]
}

export function isEmpty(queue: readonly PriorityQueueItem[]): Step[] {
  return [stateStep(queue.length === 0 ? 'empty' : 'notEmpty', queue)]
}

export function isFull(queue: readonly PriorityQueueItem[], capacity = DEFAULT_PRIORITY_QUEUE_CAPACITY): Step[] {
  return [stateStep(queue.length >= capacity ? 'full' : 'notFull', queue)]
}

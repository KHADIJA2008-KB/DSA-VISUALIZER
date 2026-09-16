import type { Step } from '@/lib/visualizer/types'

export const DEFAULT_QUEUE_CAPACITY = 8

function stateStep(type: string, queue: readonly number[], index = -1, value?: number): Step {
  return {
    type,
    indices: index >= 0 ? [index] : [],
    index,
    value,
    array: [...queue],
  }
}

export function enqueue(queue: readonly number[], value: number, capacity = DEFAULT_QUEUE_CAPACITY): Step[] {
  if (queue.length >= capacity) {
    return [stateStep('full', queue, -1, value)]
  }

  const nextQueue = [...queue, value]
  return [stateStep('enqueue', nextQueue, nextQueue.length - 1, value)]
}

export function dequeue(queue: readonly number[]): Step[] {
  if (queue.length === 0) {
    return [stateStep('empty', queue)]
  }

  return [stateStep('dequeue', queue.slice(1), 0, queue[0])]
}

export function peek(queue: readonly number[]): Step[] {
  if (queue.length === 0) {
    return [stateStep('empty', queue)]
  }

  return [stateStep('peek', queue, 0, queue[0])]
}

export function isEmpty(queue: readonly number[]): Step[] {
  return [stateStep(queue.length === 0 ? 'empty' : 'notEmpty', queue, queue.length > 0 ? 0 : -1)]
}

export function isFull(queue: readonly number[], capacity = DEFAULT_QUEUE_CAPACITY): Step[] {
  return [stateStep(queue.length >= capacity ? 'full' : 'notFull', queue, queue.length > 0 ? queue.length - 1 : -1)]
}

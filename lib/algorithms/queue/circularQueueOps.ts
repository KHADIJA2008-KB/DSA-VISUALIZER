import type { Step } from '@/lib/visualizer/types'

export type CircularQueueState = {
  slots: Array<number | null>
  front: number
  rear: number
  size: number
}

function valuesInOrder(queue: CircularQueueState): number[] {
  const values: number[] = []
  for (let offset = 0; offset < queue.size; offset += 1) {
    values.push(queue.slots[(queue.front + offset) % queue.slots.length] as number)
  }
  return values
}

function stateStep(type: string, queue: CircularQueueState, index = -1, value?: number): Step {
  return {
    type,
    indices: index >= 0 ? [index] : [],
    index,
    value,
    array: valuesInOrder(queue),
    slots: [...queue.slots],
    frontIndex: queue.front,
    rearIndex: queue.rear,
  }
}

export function createCircularQueue(capacity = 8): CircularQueueState {
  return { slots: Array.from({ length: capacity }, () => null), front: 0, rear: -1, size: 0 }
}

export function enqueue(queue: CircularQueueState, value: number): Step[] {
  if (queue.size >= queue.slots.length) return [stateStep('full', queue, -1, value)]

  const nextRear = (queue.rear + 1) % queue.slots.length
  const nextQueue: CircularQueueState = {
    slots: queue.slots.map((slot, index) => index === nextRear ? value : slot),
    front: queue.size === 0 ? nextRear : queue.front,
    rear: nextRear,
    size: queue.size + 1,
  }
  return [stateStep('enqueue', nextQueue, nextRear, value)]
}

export function dequeue(queue: CircularQueueState): Step[] {
  if (queue.size === 0) return [stateStep('empty', queue)]

  const value = queue.slots[queue.front] as number
  const nextQueue: CircularQueueState = {
    slots: queue.slots.map((slot, index) => index === queue.front ? null : slot),
    front: queue.size === 1 ? 0 : (queue.front + 1) % queue.slots.length,
    rear: queue.size === 1 ? -1 : queue.rear,
    size: queue.size - 1,
  }
  return [stateStep('dequeue', nextQueue, queue.front, value)]
}

export function peek(queue: CircularQueueState): Step[] {
  if (queue.size === 0) return [stateStep('empty', queue)]
  return [stateStep('peek', queue, queue.front, queue.slots[queue.front] as number)]
}

export function isEmpty(queue: CircularQueueState): Step[] {
  return [stateStep(queue.size === 0 ? 'empty' : 'notEmpty', queue, queue.size === 0 ? -1 : queue.front)]
}

export function isFull(queue: CircularQueueState): Step[] {
  return [stateStep(queue.size >= queue.slots.length ? 'full' : 'notFull', queue, queue.size === 0 ? -1 : queue.rear)]
}

import type { Step } from '@/lib/visualizer/types'

export const DEFAULT_DEQUE_CAPACITY = 8

function stateStep(type: string, deque: readonly number[], index = -1, value?: number): Step {
  return {
    type,
    indices: index >= 0 ? [index] : [],
    index,
    value,
    array: [...deque],
  }
}

export function insertFront(deque: readonly number[], value: number, capacity = DEFAULT_DEQUE_CAPACITY): Step[] {
  if (deque.length >= capacity) return [stateStep('full', deque, -1, value)]
  return [stateStep('insertFront', [value, ...deque], 0, value)]
}

export function insertBack(deque: readonly number[], value: number, capacity = DEFAULT_DEQUE_CAPACITY): Step[] {
  if (deque.length >= capacity) return [stateStep('full', deque, -1, value)]
  const nextDeque = [...deque, value]
  return [stateStep('insertBack', nextDeque, nextDeque.length - 1, value)]
}

export function removeFront(deque: readonly number[]): Step[] {
  if (deque.length === 0) return [stateStep('empty', deque)]
  return [stateStep('removeFront', deque.slice(1), 0, deque[0])]
}

export function removeBack(deque: readonly number[]): Step[] {
  if (deque.length === 0) return [stateStep('empty', deque)]
  const index = deque.length - 1
  return [stateStep('removeBack', deque.slice(0, index), index, deque[index])]
}

export function peekFront(deque: readonly number[]): Step[] {
  if (deque.length === 0) return [stateStep('empty', deque)]
  return [stateStep('peekFront', deque, 0, deque[0])]
}

export function peekBack(deque: readonly number[]): Step[] {
  if (deque.length === 0) return [stateStep('empty', deque)]
  const index = deque.length - 1
  return [stateStep('peekBack', deque, index, deque[index])]
}

export function isEmpty(deque: readonly number[]): Step[] {
  return [stateStep(deque.length === 0 ? 'empty' : 'notEmpty', deque)]
}

export function isFull(deque: readonly number[], capacity = DEFAULT_DEQUE_CAPACITY): Step[] {
  return [stateStep(deque.length >= capacity ? 'full' : 'notFull', deque)]
}

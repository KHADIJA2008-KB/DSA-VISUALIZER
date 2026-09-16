import type { Step } from '@/lib/visualizer/types'

export const DEFAULT_STACK_CAPACITY = 8

function stateStep(type: string, stack: readonly number[], index = -1, value?: number): Step {
  return {
    type,
    indices: index >= 0 ? [index] : [],
    index,
    value,
    array: [...stack],
  }
}

export function push(stack: readonly number[], value: number, capacity = DEFAULT_STACK_CAPACITY): Step[] {
  if (stack.length >= capacity) {
    return [stateStep('full', stack, -1, value)]
  }

  const nextStack = [...stack, value]
  return [stateStep('push', nextStack, nextStack.length - 1, value)]
}

export function pop(stack: readonly number[]): Step[] {
  if (stack.length === 0) {
    return [stateStep('empty', stack)]
  }

  const index = stack.length - 1
  const value = stack[index]
  return [stateStep('pop', stack.slice(0, index), index, value)]
}

export function peek(stack: readonly number[]): Step[] {
  if (stack.length === 0) {
    return [stateStep('empty', stack)]
  }

  const index = stack.length - 1
  return [stateStep('peek', stack, index, stack[index])]
}

export function isEmpty(stack: readonly number[]): Step[] {
  return [stateStep(stack.length === 0 ? 'empty' : 'notEmpty', stack, stack.length - 1)]
}

export function isFull(stack: readonly number[], capacity = DEFAULT_STACK_CAPACITY): Step[] {
  return [stateStep(stack.length >= capacity ? 'full' : 'notFull', stack, stack.length - 1)]
}

import assert from 'node:assert/strict'
import test from 'node:test'
import { compareLists, mergeSortedLists, reverseList, type LLStep } from './operations'
import type { Node } from './singlyLinkedList'

const list = (values: number[], prefix: string): Node[] => values.map((value, index) => ({ id: `${prefix}-${index}`, value, next: index + 1 < values.length ? `${prefix}-${index + 1}` : null }))

test('reverseList flips each next pointer and reverses the final order', () => {
  const steps = reverseList(list([1, 2, 3], 'r'))
  assert.equal(steps.length, 3)
  assert.deepEqual(steps.map((step) => step.nodeId), ['r-0', 'r-1', 'r-2'])
  assert.deepEqual(steps.at(-1)?.listAfter.map((node) => node.value), [3, 2, 1])
  assert.equal(steps.at(-1)?.listAfter[0].next, 'r-1')
})

test('mergeSortedLists compares nodes and builds a sorted result', () => {
  const steps = mergeSortedLists(list([1, 4, 7], 'a'), list([2, 3, 8], 'b'))
  assert.deepEqual(steps.at(-1)?.resultAfter?.map((node) => node.value), [1, 2, 3, 4, 7, 8])
  assert.ok(steps.some((step) => step.comparedNodeIds?.length === 2 && step.comparison === 'less'))
  assert.ok(steps.every((step) => step.listAAfter && step.listBAfter))
})

test('compareLists highlights matching nodes and stops at the first mismatch', () => {
  const steps = compareLists(list([1, 2, 9], 'a'), list([1, 2, 8], 'b'))
  assert.deepEqual(steps.slice(0, 2).map((step) => step.comparison), ['equal', 'equal'])
  assert.equal(steps.at(-1)?.comparison, 'mismatch')
  assert.equal(steps.at(-1)?.comparisonResult, 'not-equal')
  assert.equal(steps.at(-1)?.type, 'not-found')
})

test('compareLists reports equal lists, including empty lists', () => {
  const equal = compareLists(list([3, 5], 'a'), list([3, 5], 'b'))
  assert.equal(equal.at(-1)?.comparisonResult, 'equal')
  assert.equal(equal.at(-1)?.type, 'found')
  assert.equal(compareLists([], []).at(-1)?.comparisonResult, 'equal')
})

test('operation steps keep the LLStep listAfter contract', () => {
  const steps: LLStep[] = [...reverseList([]), ...mergeSortedLists([], []), ...compareLists([], [])]
  assert.ok(steps.every((step) => Array.isArray(step.listAfter)))
})
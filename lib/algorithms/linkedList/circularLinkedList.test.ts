import assert from 'node:assert/strict'
import test from 'node:test'
import {
  circularDoublyDeleteAtHead,
  circularDoublyDeleteAtIndex,
  circularDoublyDeleteAtTail,
  circularDoublyInsertAtHead,
  circularDoublyInsertAtIndex,
  circularDoublyInsertAtTail,
  circularDoublySearch,
  circularDoublyTraverse,
  circularSinglyDeleteAtHead,
  circularSinglyDeleteAtIndex,
  circularSinglyDeleteAtTail,
  circularSinglyInsertAtHead,
  circularSinglyInsertAtIndex,
  circularSinglyInsertAtTail,
  circularSinglySearch,
  circularSinglyTraverse,
  type CircularDoublyNode,
  type CircularSinglyNode,
} from './circularLinkedList'

const singly: CircularSinglyNode[] = [
  { id: 'a', value: 10, next: 'b' },
  { id: 'b', value: 20, next: 'c' },
  { id: 'c', value: 30, next: 'a' },
]
const doubly: CircularDoublyNode[] = [
  { id: 'a', value: 10, next: 'b', prev: 'c' },
  { id: 'b', value: 20, next: 'c', prev: 'a' },
  { id: 'c', value: 30, next: 'a', prev: 'b' },
]

test('circular singly operations preserve the wrap-around link', () => {
  const head = circularSinglyInsertAtHead(singly, 5).at(-1)?.listAfter ?? []
  assert.equal(head.at(-1)?.next, head[0]?.id)
  const tail = circularSinglyInsertAtTail(singly, 40).at(-1)?.listAfter ?? []
  assert.equal(tail.at(-1)?.next, tail[0]?.id)
  const middle = circularSinglyInsertAtIndex(singly, 25, 2).at(-1)?.listAfter ?? []
  assert.deepEqual(middle.map((node) => node.value), [10, 20, 25, 30])
  assert.equal(middle.at(-1)?.next, middle[0]?.id)
  assert.deepEqual(circularSinglyTraverse(singly).map((step) => step.nodeId), ['a', 'b', 'c'])
  assert.equal(circularSinglySearch(singly, 20).at(-1)?.type, 'found')
})

test('circular singly deletes retain the wrap-around link', () => {
  for (const steps of [circularSinglyDeleteAtHead(singly), circularSinglyDeleteAtTail(singly), circularSinglyDeleteAtIndex(singly, 1)]) {
    const result = steps.at(-1)?.listAfter ?? []
    assert.equal(result.at(-1)?.next, result[0]?.id)
  }
})

test('circular doubly operations preserve both wrap-around links', () => {
  const cases = [circularDoublyInsertAtHead(doubly, 5), circularDoublyInsertAtTail(doubly, 40), circularDoublyInsertAtIndex(doubly, 25, 2)]
  for (const steps of cases) {
    const result = steps.at(-1)?.listAfter ?? []
    assert.equal(result.at(-1)?.next, result[0]?.id)
    assert.equal(result[0]?.prev, result.at(-1)?.id)
  }
  assert.deepEqual(circularDoublyTraverse(doubly).map((step) => step.nodeId), ['a', 'b', 'c'])
  assert.equal(circularDoublySearch(doubly, 30).at(-1)?.type, 'found')
})

test('circular doubly deletes retain both wrap-around links', () => {
  for (const steps of [circularDoublyDeleteAtHead(doubly), circularDoublyDeleteAtTail(doubly), circularDoublyDeleteAtIndex(doubly, 1)]) {
    const result = steps.at(-1)?.listAfter ?? []
    assert.equal(result.at(-1)?.next, result[0]?.id)
    assert.equal(result[0]?.prev, result.at(-1)?.id)
  }
})

test('circular variants handle empty lists', () => {
  assert.equal(circularSinglyDeleteAtHead([])[0].type, 'not-found')
  assert.equal(circularSinglyDeleteAtTail([])[0].type, 'not-found')
  assert.equal(circularSinglyDeleteAtIndex([], 0)[0].type, 'not-found')
  assert.equal(circularDoublyDeleteAtHead([])[0].type, 'not-found')
  assert.equal(circularDoublyDeleteAtTail([])[0].type, 'not-found')
  assert.equal(circularDoublyDeleteAtIndex([], 0)[0].type, 'not-found')
  assert.equal(circularSinglyInsertAtIndex([], 4, 1)[0].type, 'not-found')
  assert.equal(circularDoublyInsertAtIndex([], 4, 1)[0].type, 'not-found')
})
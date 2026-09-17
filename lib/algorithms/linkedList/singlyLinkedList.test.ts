import assert from 'node:assert/strict'
import test from 'node:test'
import {
  deleteAtHead,
  deleteAtIndex,
  deleteAtTail,
  deleteByValue,
  insertAtHead,
  insertAtIndex,
  insertAtTail,
  search,
  traverse,
  type Node,
} from './singlyLinkedList'

const list: Node[] = [
  { id: 'a', value: 10, next: 'b' },
  { id: 'b', value: 20, next: 'c' },
  { id: 'c', value: 30, next: null },
]

function finalList(steps: ReturnType<typeof insertAtHead>) {
  return steps.at(-1)?.listAfter ?? []
}

test('inserts at the head, tail, and middle', () => {
  assert.deepEqual(finalList(insertAtHead(list, 5)).map((node) => node.value), [5, 10, 20, 30])
  assert.deepEqual(finalList(insertAtTail(list, 40)).map((node) => node.value), [10, 20, 30, 40])
  const middle = finalList(insertAtIndex(list, 25, 2))
  assert.deepEqual(middle.map((node) => node.value), [10, 20, 25, 30])
  assert.equal(middle[1].next, middle[2].id)
  assert.equal(middle[2].next, middle[3].id)
})

test('inserts into an empty list', () => {
  assert.deepEqual(finalList(insertAtHead([], 1)).map((node) => node.value), [1])
  assert.deepEqual(finalList(insertAtTail([], 2)).map((node) => node.value), [2])
  assert.deepEqual(finalList(insertAtIndex([], 3, 0)).map((node) => node.value), [3])
})

test('deletes at the head, tail, and middle', () => {
  assert.deepEqual(deleteAtHead(list).at(-1)?.listAfter.map((node) => node.value), [20, 30])
  assert.deepEqual(deleteAtTail(list).at(-1)?.listAfter.map((node) => node.value), [10, 20])
  assert.deepEqual(deleteAtIndex(list, 1).at(-1)?.listAfter.map((node) => node.value), [10, 30])
  assert.deepEqual(deleteByValue(list, 20).at(-1)?.listAfter.map((node) => node.value), [10, 30])
})

test('handles empty-list deletes and invalid searches', () => {
  assert.equal(deleteAtHead([])[0].type, 'not-found')
  assert.equal(deleteAtTail([])[0].type, 'not-found')
  assert.equal(deleteAtIndex([], 0)[0].type, 'not-found')
  assert.equal(deleteByValue([], 10)[0].type, 'not-found')
  assert.equal(search([], 10)[0].type, 'not-found')
  assert.equal(search(list, 99).at(-1)?.type, 'not-found')
})

test('traverses from the head and reports a match', () => {
  assert.deepEqual(traverse(list).map((step) => step.nodeId), ['a', 'b', 'c'])
  assert.equal(search(list, 20).at(-1)?.type, 'found')
  assert.equal(search(list, 20).at(-1)?.nodeId, 'b')
})
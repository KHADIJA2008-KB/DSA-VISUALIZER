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
} from './doublyLinkedList'

const list: Node[] = [
  { id: 'a', value: 10, next: 'b', prev: null },
  { id: 'b', value: 20, next: 'c', prev: 'a' },
  { id: 'c', value: 30, next: null, prev: 'b' },
]

function last(steps: ReturnType<typeof insertAtHead>) {
  return steps.at(-1)?.listAfter ?? []
}

test('inserts at head, tail, and middle with both pointers', () => {
  const head = last(insertAtHead(list, 5))
  assert.deepEqual(head.map((node) => node.value), [5, 10, 20, 30])
  assert.equal(head[0].next, head[1].id)
  assert.equal(head[1].prev, head[0].id)

  const tail = last(insertAtTail(list, 40))
  assert.equal(tail[2].next, tail[3].id)
  assert.equal(tail[3].prev, tail[2].id)

  const middle = last(insertAtIndex(list, 25, 2))
  assert.deepEqual(middle.map((node) => node.value), [10, 20, 25, 30])
  assert.equal(middle[1].next, middle[2].id)
  assert.equal(middle[2].prev, middle[1].id)
  assert.deepEqual(insertAtIndex(list, 25, 2).filter((step) => step.type === 'link').map((step) => step.direction), ['next', 'prev'])
})

test('deletes at head, tail, middle, and by value', () => {
  const head = last(deleteAtHead(list))
  assert.deepEqual(head.map((node) => node.value), [20, 30])
  assert.equal(head[0].prev, null)

  const tail = last(deleteAtTail(list))
  assert.deepEqual(tail.map((node) => node.value), [10, 20])
  assert.equal(tail[1].next, null)

  const middle = last(deleteAtIndex(list, 1))
  assert.deepEqual(middle.map((node) => node.value), [10, 30])
  assert.equal(middle[0].next, middle[1].id)
  assert.equal(middle[1].prev, middle[0].id)
  assert.deepEqual(deleteByValue(list, 20).at(-1)?.listAfter.map((node) => node.value), [10, 30])
})

test('handles empty lists and reports traversal/search results', () => {
  assert.equal(deleteAtHead([])[0].type, 'not-found')
  assert.equal(deleteAtTail([])[0].type, 'not-found')
  assert.equal(deleteAtIndex([], 0)[0].type, 'not-found')
  assert.equal(insertAtIndex([], 5, 1)[0].type, 'not-found')
  assert.deepEqual(traverse(list).map((step) => step.nodeId), ['a', 'b', 'c'])
  assert.equal(search(list, 20).at(-1)?.type, 'found')
  assert.equal(search(list, 99).at(-1)?.type, 'not-found')
})
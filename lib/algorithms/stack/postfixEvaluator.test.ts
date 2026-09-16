import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluatePostfix, evaluatePrefix } from './postfixEvaluator'

function result(steps: ReturnType<typeof evaluatePostfix>) {
  return steps[steps.length - 1].stackAfter[0]
}

test('evaluates postfix expressions in concatenated and spaced formats', () => {
  assert.equal(result(evaluatePostfix('23+4*')), 20)
  assert.equal(result(evaluatePostfix('2 3 - 4 *')), -4)
  assert.equal(result(evaluatePostfix('8 2 /')), 4)
})

test('evaluates postfix negative and decimal division', () => {
  assert.equal(result(evaluatePostfix('0 3 -')), -3)
  assert.equal(result(evaluatePostfix('-7 2 /')), -3.5)
})

test('postfix steps include push, pop, compute, and done states', () => {
  const steps = evaluatePostfix('23+')
  assert.deepEqual(steps.map((step) => step.type), ['push', 'push', 'pop', 'pop', 'compute', 'done'])
  assert.equal(steps.at(-1)?.stackAfter[0], 5)
})

test('evaluates prefix expressions from right to left', () => {
  assert.equal(result(evaluatePrefix('*+234')), 20)
  assert.equal(result(evaluatePrefix('- 2 5')), -3)
  assert.equal(result(evaluatePrefix('/ -7 2')), -3.5)
})

test('prefix preserves first-popped operand order', () => {
  const steps = evaluatePrefix('-23')
  const compute = steps.find((step) => step.type === 'compute')
  assert.equal(compute?.message, 'Popped 2 and 3 → 2 - 3 = -1')
  assert.equal(result(steps), -1)
})

test('rejects division by zero and malformed expressions', () => {
  assert.throws(() => evaluatePostfix('8 0 /'), /divide by zero/)
  assert.throws(() => evaluatePrefix('+ 2'), /needs two operands/)
})

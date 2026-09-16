export type EvalStep = {
  type: 'push' | 'pop' | 'compute' | 'done'
  token?: string
  stackAfter: number[]
  message: string
  tokenIndex: number
}

type Token = {
  text: string
  index: number
}

const operators = new Set(['+', '-', '*', '/'])

function tokenize(expression: string): Token[] {
  const trimmed = expression.trim()
  if (trimmed.length === 0) throw new Error('Expression cannot be empty.')

  if (/\s/.test(trimmed)) {
    return trimmed.split(/\s+/).map((text, index) => ({ text, index }))
  }

  return trimmed.split('').map((text, index) => ({ text, index }))
}

function isNumber(token: string) {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(token)
}

function calculate(left: number, right: number, operator: string) {
  if (operator === '+') return left + right
  if (operator === '-') return left - right
  if (operator === '*') return left * right
  if (right === 0) throw new Error('Cannot divide by zero.')
  return left / right
}

function step(type: EvalStep['type'], token: Token | undefined, stack: number[], message: string): EvalStep {
  return { type, token: token?.text, stackAfter: [...stack], message, tokenIndex: token?.index ?? -1 }
}

function evaluate(expression: string, direction: 'forward' | 'backward'): EvalStep[] {
  const tokens = tokenize(expression)
  const scan = direction === 'forward' ? tokens : [...tokens].reverse()
  const stack: number[] = []
  const steps: EvalStep[] = []
  let lastToken: Token | undefined

  for (const token of scan) {
    lastToken = token

    if (isNumber(token.text)) {
      const value = Number(token.text)
      stack.push(value)
      steps.push(step('push', token, stack, `Pushed ${value}`))
      continue
    }

    if (!operators.has(token.text)) {
      throw new Error(`Unknown token "${token.text}" at index ${token.index}.`)
    }

    if (stack.length < 2) {
      throw new Error(`Operator ${token.text} at index ${token.index} needs two operands.`)
    }

    const firstPopped = stack.pop() as number
    steps.push(step('pop', token, stack, `Popped ${firstPopped}`))
    const secondPopped = stack.pop() as number
    steps.push(step('pop', token, stack, `Popped ${secondPopped}`))

    const left = direction === 'forward' ? secondPopped : firstPopped
    const right = direction === 'forward' ? firstPopped : secondPopped
    const result = calculate(left, right, token.text)
    stack.push(result)
    steps.push(step('compute', token, stack, `Popped ${firstPopped} and ${secondPopped} → ${left} ${token.text} ${right} = ${result}`))
  }

  if (stack.length !== 1) {
    throw new Error('Expression must leave exactly one value on the stack.')
  }

  steps.push(step('done', lastToken, stack, `Done: ${stack[0]}`))
  return steps
}

export function evaluatePostfix(expression: string): EvalStep[] {
  return evaluate(expression, 'forward')
}

export function evaluatePrefix(expression: string): EvalStep[] {
  return evaluate(expression, 'backward')
}

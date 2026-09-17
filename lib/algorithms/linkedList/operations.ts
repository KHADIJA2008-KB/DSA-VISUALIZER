import type { LLStep as BaseLLStep, Node } from './singlyLinkedList'

export type LLStep = BaseLLStep & {
  direction?: 'next' | 'prev'
  listAAfter?: Node[]
  listBAfter?: Node[]
  resultAfter?: Node[]
  comparedNodeIds?: string[]
  comparison?: 'less' | 'greater' | 'equal' | 'mismatch'
  comparisonResult?: 'equal' | 'not-equal'
}

function copyList(list: Node[]): Node[] {
  return list.map((node) => ({ ...node }))
}

function operationStep(
  type: LLStep['type'],
  list: Node[],
  message: string,
  details: Omit<Partial<LLStep>, 'listAfter' | 'message' | 'type'> = {},
): LLStep {
  return { type, ...details, listAfter: copyList(list), message }
}

function resultList(nodes: Node[]): Node[] {
  const result = copyList(nodes)
  for (let index = 0; index < result.length; index += 1) {
    result[index].next = index + 1 < result.length ? result[index + 1].id : null
  }
  return result
}

function withSnapshots(step: LLStep, listA: Node[], listB: Node[], result: Node[]): LLStep {
  return {
    ...step,
    listAAfter: copyList(listA),
    listBAfter: copyList(listB),
    resultAfter: copyList(result),
  }
}

export function reverseList(list: Node[]): LLStep[] {
  if (list.length === 0) return [operationStep('not-found', list, 'Cannot reverse an empty list.')]

  const nodes = copyList(list)
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const steps: LLStep[] = []
  let previous: Node | null = null
  let current: Node | undefined = nodes[0]
  let next: Node | undefined = current

  while (next) {
    current = next
    next = current.next === null ? undefined : byId.get(current.next)
    const oldNext = current.next
    current.next = previous?.id ?? null
    previous = current
    const ordered = [previous, ...nodes.filter((node) => node.id !== previous?.id && node.id !== current?.id)]
    steps.push(operationStep('link', ordered, `Reversed ${current.id}.next from ${oldNext ?? 'null'} to ${current.next ?? 'null'}.`, {
      nodeId: current.id,
      fromId: current.id,
      toId: current.next,
      direction: 'next',
    }))
  }

  const finalList = [...nodes].reverse()
  return steps.map((step, index) => index === steps.length - 1 ? { ...step, listAfter: resultList(finalList) } : step)
}

function mergeStep(
  listA: Node[],
  listB: Node[],
  result: Node[],
  message: string,
  details: Pick<LLStep, 'comparedNodeIds' | 'comparison'> = {},
): LLStep {
  return withSnapshots(operationStep('visit', result, message, details), listA, listB, result)
}

export function mergeSortedLists(listA: Node[], listB: Node[]): LLStep[] {
  const sourceA = copyList(listA)
  const sourceB = copyList(listB)
  const result: Node[] = []
  const steps: LLStep[] = []
  let indexA = 0
  let indexB = 0

  while (indexA < sourceA.length && indexB < sourceB.length) {
    const nodeA = sourceA[indexA]
    const nodeB = sourceB[indexB]
    const comparison = nodeA.value < nodeB.value ? 'less' : nodeA.value > nodeB.value ? 'greater' : 'equal'
    const selected = comparison === 'greater' ? nodeB : nodeA
    result.push({ ...selected, next: null })
    const resultSnapshot = resultList(result)
    steps.push(mergeStep(sourceA, sourceB, resultSnapshot, `Compared ${nodeA.value} and ${nodeB.value}; appended ${selected.value}.`, {
      comparedNodeIds: [nodeA.id, nodeB.id],
      comparison,
    }))
    if (comparison === 'greater') indexB += 1
    else indexA += 1
  }

  while (indexA < sourceA.length) {
    const selected = sourceA[indexA]
    result.push({ ...selected, next: null })
    steps.push(mergeStep(sourceA, sourceB, resultList(result), `Appended remaining value ${selected.value} from list A.`, { comparedNodeIds: [selected.id] }))
    indexA += 1
  }
  while (indexB < sourceB.length) {
    const selected = sourceB[indexB]
    result.push({ ...selected, next: null })
    steps.push(mergeStep(sourceA, sourceB, resultList(result), `Appended remaining value ${selected.value} from list B.`, { comparedNodeIds: [selected.id] }))
    indexB += 1
  }

  return steps.length > 0 ? steps : [mergeStep(sourceA, sourceB, [], 'Both lists are empty.')]
}

function compareStep(listA: Node[], listB: Node[], message: string, details: Pick<LLStep, 'comparedNodeIds' | 'comparison' | 'comparisonResult'>): LLStep {
  return withSnapshots(operationStep(details.comparisonResult === 'not-equal' ? 'not-found' : 'found', [], message, details), listA, listB, [])
}

export function compareLists(listA: Node[], listB: Node[]): LLStep[] {
  const sourceA = copyList(listA)
  const sourceB = copyList(listB)
  const steps: LLStep[] = []
  const length = Math.max(sourceA.length, sourceB.length)

  for (let index = 0; index < length; index += 1) {
    const nodeA = sourceA[index]
    const nodeB = sourceB[index]
    if (!nodeA || !nodeB || nodeA.value !== nodeB.value) {
      const comparedNodeIds = [nodeA?.id, nodeB?.id].filter((id): id is string => Boolean(id))
      steps.push(compareStep(sourceA, sourceB, `Mismatch at position ${index}: ${nodeA?.value ?? 'none'} does not equal ${nodeB?.value ?? 'none'}.`, {
        comparedNodeIds,
        comparison: 'mismatch',
        comparisonResult: 'not-equal',
      }))
      return steps
    }
    steps.push(compareStep(sourceA, sourceB, `Matched position ${index}: both values are ${nodeA.value}.`, {
      comparedNodeIds: [nodeA.id, nodeB.id],
      comparison: 'equal',
    }))
  }

  steps.push(compareStep(sourceA, sourceB, 'The lists are equal.', { comparison: 'equal', comparisonResult: 'equal' }))
  return steps
}
import type { Step } from '@/lib/visualizer/types'

export function selectionSort(input: number[]): Step[] {
  const values = [...input]
  const steps: Step[] = []

  const record = (type: 'compare' | 'swap', indices: number[]) => {
    steps.push({ type, indices, array: [...values] })
  }

  for (let start = 0; start < values.length - 1; start += 1) {
    let minimumIndex = start

    for (let index = start + 1; index < values.length; index += 1) {
      record('compare', [minimumIndex, index])
      if (values[index] < values[minimumIndex]) minimumIndex = index
    }

    if (minimumIndex !== start) {
      ;[values[start], values[minimumIndex]] = [values[minimumIndex], values[start]]
      record('swap', [start, minimumIndex])
    }
  }

  return steps
}

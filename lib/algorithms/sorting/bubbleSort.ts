import type { Step } from '@/lib/visualizer/types'

export function bubbleSort(input: number[]): Step[] {
  const values = [...input]
  const steps: Step[] = []

  const record = (type: 'compare' | 'swap', indices: number[]) => {
    steps.push({ type, indices, array: [...values] })
  }

  for (let end = values.length - 1; end > 0; end -= 1) {
    let swapped = false

    for (let index = 0; index < end; index += 1) {
      record('compare', [index, index + 1])
      if (values[index] > values[index + 1]) {
        ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
        record('swap', [index, index + 1])
        swapped = true
      }
    }

    if (!swapped) break
  }

  return steps
}

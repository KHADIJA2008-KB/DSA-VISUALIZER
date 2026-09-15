import type { Step } from '@/lib/visualizer/types'

export function insertionSort(input: number[]): Step[] {
  const values = [...input]
  const steps: Step[] = []

  const record = (type: 'compare' | 'swap', indices: number[]) => {
    steps.push({ type, indices, array: [...values] })
  }

  for (let index = 1; index < values.length; index += 1) {
    let current = index

    while (current > 0) {
      record('compare', [current - 1, current])
      if (values[current - 1] <= values[current]) break

      ;[values[current - 1], values[current]] = [values[current], values[current - 1]]
      record('swap', [current - 1, current])
      current -= 1
    }
  }

  return steps
}

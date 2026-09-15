import type { Step } from '@/lib/visualizer/types'

export function quickSort(input: number[]): Step[] {
  const values = [...input]
  const steps: Step[] = []

  const record = (type: 'compare' | 'swap', indices: number[]) => {
    steps.push({ type, indices, array: [...values] })
  }

  function partition(start: number, end: number) {
    const pivot = values[end]
    let smaller = start

    for (let index = start; index < end; index += 1) {
      record('compare', [index, end])
      if (values[index] < pivot) {
        if (smaller !== index) {
          ;[values[smaller], values[index]] = [values[index], values[smaller]]
          record('swap', [smaller, index])
        }
        smaller += 1
      }
    }

    if (smaller !== end) {
      ;[values[smaller], values[end]] = [values[end], values[smaller]]
      record('swap', [smaller, end])
    }

    return smaller
  }

  function sort(start: number, end: number) {
    if (start >= end) return
    const pivot = partition(start, end)
    sort(start, pivot - 1)
    sort(pivot + 1, end)
  }

  sort(0, values.length - 1)
  return steps
}

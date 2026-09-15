import type { Step } from '@/lib/visualizer/types'

export function mergeSort(input: number[]): Step[] {
  const values = [...input]
  const steps: Step[] = []

  const record = (type: 'compare' | 'swap', indices: number[]) => {
    steps.push({ type, indices, array: [...values] })
  }

  function merge(start: number, middle: number, end: number) {
    const merged: number[] = []
    let left = start
    let right = middle + 1

    while (left <= middle && right <= end) {
      record('compare', [left, right])
      if (values[left] <= values[right]) {
        merged.push(values[left])
        left += 1
      } else {
        merged.push(values[right])
        right += 1
      }
    }

    while (left <= middle) merged.push(values[left++])
    while (right <= end) merged.push(values[right++])

    for (let offset = 0; offset < merged.length; offset += 1) {
      const target = start + offset
      const source = values.indexOf(merged[offset], target)

      for (let index = source; index > target; index -= 1) {
        ;[values[index - 1], values[index]] = [values[index], values[index - 1]]
        record('swap', [index - 1, index])
      }
    }
  }

  function sort(start: number, end: number) {
    if (start >= end) return
    const middle = Math.floor((start + end) / 2)
    sort(start, middle)
    sort(middle + 1, end)
    merge(start, middle, end)
  }

  sort(0, values.length - 1)
  return steps
}

export type Step = {
  type: string
  indices: number[]
  index?: number
  value?: number
  array?: number[]
  token?: string
  tokenIndex?: number
  description?: string
  slots?: Array<number | null>
  frontIndex?: number
  rearIndex?: number
  priorities?: number[]
  comparisonIndex?: number
}

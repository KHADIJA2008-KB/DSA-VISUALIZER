'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Step } from './types'

export type StepPlayer = {
  currentStep: number
  isPlaying: boolean
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBack: () => void
  reset: () => void
  speed: number
  setSpeed: (speed: number) => void
}

const DEFAULT_SPEED = 250
const MIN_SPEED = 50
const MAX_SPEED = 1000

export function useStepPlayer(steps: Step[], initialSpeed = DEFAULT_SPEED): StepPlayer {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeedState] = useState(() => Math.min(MAX_SPEED, Math.max(MIN_SPEED, initialSpeed)))
  const stepsRef = useRef(steps)

  useEffect(() => {
    stepsRef.current = steps
    setCurrentStep(-1)
    setIsPlaying(false)
  }, [steps])

  useEffect(() => {
    if (!isPlaying) return

    if (currentStep >= stepsRef.current.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = window.setTimeout(() => {
      setCurrentStep((step) => Math.min(step + 1, stepsRef.current.length - 1))
    }, speed)

    return () => window.clearTimeout(timer)
  }, [currentStep, isPlaying, speed])

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((step) => Math.min(step + 1, stepsRef.current.length - 1))
  }, [])

  const stepBack = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((step) => Math.max(step - 1, -1))
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(-1)
  }, [])

  const setSpeed = useCallback((nextSpeed: number) => {
    setSpeedState(Math.min(MAX_SPEED, Math.max(MIN_SPEED, nextSpeed)))
  }, [])

  return { currentStep, isPlaying, play, pause, stepForward, stepBack, reset, speed, setSpeed }
}

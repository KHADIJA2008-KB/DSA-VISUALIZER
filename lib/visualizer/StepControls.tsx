'use client'

import type { StepPlayer } from './useStepPlayer'

type StepControlsProps = Pick<StepPlayer, 'isPlaying' | 'play' | 'pause' | 'stepForward' | 'stepBack' | 'reset' | 'speed' | 'setSpeed'> & {
  currentStep?: number
  totalSteps?: number
}

const buttonClass = 'grid size-9 place-items-center rounded-lg border border-slate-700 text-sm text-slate-300 transition hover:border-teal-400 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'

export function StepControls({ isPlaying, play, pause, stepForward, stepBack, reset, speed, setSpeed, currentStep = -1, totalSteps }: StepControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 text-slate-400 sm:flex-row sm:items-center sm:justify-between" aria-label="Animation controls">
      <div className="flex items-center gap-2">
        <button type="button" onClick={stepBack} disabled={currentStep < 0} className={buttonClass} aria-label="Step backward" title="Step backward">|&lt;</button>
        <button type="button" onClick={isPlaying ? pause : play} className="grid size-9 place-items-center rounded-lg bg-teal-400 text-sm font-bold text-slate-950 transition hover:bg-teal-300" aria-label={isPlaying ? 'Pause animation' : 'Play animation'} title={isPlaying ? 'Pause animation' : 'Play animation'}>{isPlaying ? '||' : '▶'}</button>
        <button type="button" onClick={stepForward} disabled={totalSteps !== undefined && currentStep >= totalSteps - 1} className={buttonClass} aria-label="Step forward" title="Step forward">&gt;|</button>
        <button type="button" onClick={reset} disabled={currentStep < 0 && !isPlaying} className={buttonClass} aria-label="Reset animation" title="Reset animation">↺</button>
        {totalSteps !== undefined && <span className="ml-2 text-xs tabular-nums">Step {Math.max(currentStep + 1, 0)} / {totalSteps}</span>}
      </div>
      <label className="flex items-center gap-3 text-xs font-medium">
        <span>Speed</span>
        <input type="range" min="50" max="1000" step="50" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="w-32 accent-teal-400" aria-label="Animation speed in milliseconds" />
        <span className="w-12 text-right tabular-nums text-slate-300">{speed}ms</span>
      </label>
    </div>
  )
}

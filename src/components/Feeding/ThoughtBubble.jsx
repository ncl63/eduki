import React from 'react'
import { CarrotIcon } from './Carrot.jsx'

/**
 * Consigne affichée dans la bulle (lapin).
 * Colorise les carottes selon la progression actuelle.
 */
export default function ThoughtBubble({ targetCount, currentCount, status }) {
  const carrots = Array.from({ length: targetCount }, (_, index) => {
    const isFilled = index < currentCount
    return (
      <CarrotIcon
        key={index}
        className="w-8 h-8"
        muted={!isFilled}
        bodyColor="#22c55e"
        leavesColor="#16a34a"
      />
    )
  })

  const bubbleTone =
    status === 'success'
      ? 'border-emerald-200 bg-emerald-50'
      : status === 'error'
        ? 'border-rose-200 bg-white'
        : 'border-gray-200 bg-white'

  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-4 max-w-sm transition-colors ${bubbleTone}`}
      aria-live="polite"
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-gray-500">Consigne</p>
        <p className="text-xl font-semibold text-gray-900">Donne : 🥕 x {targetCount}</p>
      </div>

      <div className="flex items-center gap-2">
        {carrots}
        <span className="ml-auto text-sm text-gray-500">
          {currentCount} / {targetCount}
        </span>
      </div>
    </div>
  )
}


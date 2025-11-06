import React from 'react'
import { ThoughtBubbleShape } from './Illustrations.jsx'

/**
 * Consigne affichée dans la bulle (lapin).
 * Affiche des pastilles de progression et le nombre restant.
 */
export default function ThoughtBubble({
  targetCount,
  currentCount,
  status,
  animate = false,
}) {
  const carrots = Array.from({ length: targetCount }, (_, index) => {
    const isFilled = index < currentCount
    return (
      <span
        key={index}
        className={`h-4 w-4 rounded-full border transition ${
          isFilled
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-gray-300 bg-white'
        }`}
      />
    )
  })

  const tone =
    status === 'success'
      ? { stroke: '#34d399', fill: '#ecfdf5', badge: 'text-emerald-600' }
      : status === 'error'
        ? { stroke: '#f87171', fill: '#ffe4e6', badge: 'text-rose-600' }
        : { stroke: '#d1d5db', fill: '#ffffff', badge: 'text-gray-600' }

  const remaining = Math.max(targetCount - currentCount, 0)

  return (
    <div
      className={`relative w-full max-w-sm ${animate ? 'bubble-animate' : ''}`}
      aria-live="polite"
    >
      <ThoughtBubbleShape
        className="w-full h-auto"
        fill={tone.fill}
        stroke={tone.stroke}
      />

      <div className="absolute inset-[14%] flex flex-col gap-4 text-gray-700">
        <div className="space-y-1.5">
          <p className="text-sm uppercase tracking-wide text-gray-500">Consigne</p>
          <p className="text-2xl font-semibold text-gray-900">
            Donne <span className="font-black text-emerald-600">{targetCount}</span>{' '}
            {targetCount > 1 ? 'carottes' : 'carotte'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">{carrots}</div>
          <span className={`ml-auto text-sm font-semibold ${tone.badge}`}>
            Restantes : {remaining}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          Dans la mangeoire :{' '}
          <span className="font-semibold text-gray-900">
            {currentCount} / {targetCount}
          </span>
        </div>
      </div>
    </div>
  )
}

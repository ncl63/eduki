import React from 'react'

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

  const bubbleTone =
    status === 'success'
      ? 'border-emerald-200 bg-emerald-50'
      : status === 'error'
        ? 'border-rose-300 bg-rose-50'
        : 'border-gray-200 bg-white'

  const remaining = Math.max(targetCount - currentCount, 0)

  return (
    <div
      className={`rounded-2xl border shadow-sm p-6 flex flex-col gap-4 max-w-sm transition-colors ${bubbleTone} ${
        animate ? 'bubble-animate' : ''
      }`}
      aria-live="polite"
    >
      <div className="space-y-1.5">
        <p className="text-sm uppercase tracking-wide text-gray-500">Consigne</p>
        <p className="text-2xl font-semibold text-gray-900">
          Donne <span className="font-black text-emerald-600">{targetCount}</span>{' '}
          {targetCount > 1 ? 'carottes' : 'carotte'}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">{carrots}</div>
        <span className="ml-auto text-sm font-medium text-gray-600">
          Restantes : {remaining}
        </span>
      </div>

      <div className="text-sm text-gray-500">
        Dans la mangeoire :{' '}
        <span className="font-semibold text-gray-800">
          {currentCount} / {targetCount}
        </span>
      </div>
    </div>
  )
}

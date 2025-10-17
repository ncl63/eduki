import React from 'react'

/**
 * Simple carrot icon rendered with inline SVG so we can easily tweak colors.
 */
export function CarrotIcon({
  className = 'w-10 h-10',
  bodyColor = '#f97316',
  leavesColor = '#16a34a',
  muted = false,
}) {
  const resolvedBody = muted ? '#d1d5db' : bodyColor
  const resolvedLeaves = muted ? '#a3a3a3' : leavesColor

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M38 4c2.6 0 6.2 2.8 7.4 6.4-.9-.3-2.7-.6-3.7-.4 3.5 2.3 5.3 5 5.3 8 0 .9-.2 1.8-.4 2.6-2.7-3.8-6.1-6.8-10.1-8.8l3-4.8C39.4 6.2 38 4 38 4Z"
          fill={resolvedLeaves}
        />
        <path
          d="M23.6 18.6c4-4 17.2-4.2 21.3-.1 4.1 4.1 4.3 17.3.2 21.4l-13 13c-2.7 2.7-6.1 5.1-9.5 4.1-3.2-1-5.1-4.4-5.7-7.6-.9-4.7 1.6-9.3 4.2-12.8l2.8-3.7-3.9.4c-2 .2-3.7-1.4-3.9-3.4-.2-1.7.9-3.3 2.4-3.9l3.8-1.4-1.1-1.3c-1.4-1.6-1.3-4 .2-5.6Z"
          fill={resolvedBody}
        />
      </g>
    </svg>
  )
}

/**
 * Touch-friendly carrot button that kicks off pointer-based dragging.
 */
export default function Carrot({
  id,
  onPointerDown,
  onClick,
  isDragging = false,
  variant = 'pool',
  'aria-label': ariaLabel = 'carotte',
}) {
  const sizeClass = variant === 'pool' ? 'w-16 h-16' : 'w-12 h-12'
  const paddingClass = variant === 'pool' ? 'p-2.5' : 'p-1.5'

  return (
    <button
      type="button"
      data-carrot-id={id}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 shadow-sm transition-transform touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 active:scale-95 ${sizeClass} ${paddingClass} ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <CarrotIcon className="w-full h-full" />
    </button>
  )
}


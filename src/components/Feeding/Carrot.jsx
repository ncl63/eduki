import React from 'react'

/**
 * Simple carrot icon rendered with inline SVG so we can easily tweak colors.
 */
export function CarrotIcon({
  className = 'w-10 h-10',
  bodyColor = '#fb923c',
  leavesColor = '#4ade80',
  muted = false,
}) {
  const resolvedBody = muted ? '#e5e7eb' : bodyColor
  const resolvedLeaves = muted ? '#d1d5db' : leavesColor
  const outline = muted ? '#9ca3af' : '#374151'

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke={outline}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M46.5 8c3.9 0 7.5 3.1 7.5 7.2 0 2.8-1.2 5.8-3.3 8.6-2.6-4.8-6.2-8.7-10.6-11.3.9-2.8 3.5-4.5 6.4-4.5Z"
          fill={resolvedLeaves}
        />
        <path
          d="M38.7 11.7c2.7-.6 5.7.6 7.2 3-4.2 1.2-7.6 3.5-10.2 6.8-2.7-2.3-3-6.6-.8-9.2 1-.7 2.2-1.2 3.8-.6Z"
          fill={resolvedLeaves}
        />
        <path
          d="M22.4 25.8c6.7-6.7 28.4-7 35.2-.2 6.8 6.8 7.2 28.6.3 35.4l-16.8 16.8c-3.7 3.7-8.5 6.4-13.3 5-4.5-1.3-7-5.4-7.8-9.4-1.2-6 1.7-11.8 4.9-16.1l4.1-5.1-5.8.6c-2.6.3-4.9-1.9-5.1-4.6-.2-2.3 1.1-4.4 3.2-5.3l5.4-1.9-1.6-1.9c-1.9-2.2-1.8-5.6.5-7.3Z"
          fill={resolvedBody}
        />
        <path
          d="m33.2 41.8 11.5 11.5"
          stroke={muted ? '#cbd5f5' : '#fcd34d'}
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
  onPointerUp,
  onClick,
  isDragging = false,
  isSelected = false,
  invalid = false,
  variant = 'pool',
  'aria-label': ariaLabel = 'carotte',
}) {
  const sizeClass = variant === 'pool' ? 'w-16 h-16' : 'w-12 h-12'
  const paddingClass = variant === 'pool' ? 'p-2.5' : 'p-1.5'
  const hoverScale = variant === 'pool' ? 'hover:scale-[1.05]' : 'hover:scale-[1.03]'

  return (
    <button
      type="button"
      data-carrot-id={id}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 shadow-sm transition duration-150 ease-out touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 active:scale-[0.97] ${hoverScale} ${sizeClass} ${paddingClass} ${
        isDragging ? 'opacity-0' : 'opacity-100'
      } ${isSelected ? 'ring-4 ring-emerald-300 ring-offset-2' : ''} ${invalid ? 'carrot-invalid' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <CarrotIcon className="w-full h-full" />
    </button>
  )
}


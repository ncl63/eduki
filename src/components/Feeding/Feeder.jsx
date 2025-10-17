import React from 'react'
import Carrot from './Carrot.jsx'

const highlightClasses =
  'border-emerald-400 ring-2 ring-inset ring-emerald-200 bg-emerald-50/50'

const baseClasses =
  'rounded-2xl border-2 border-gray-300 bg-white min-h-[220px] relative overflow-hidden transition-all'

const contentClasses = 'p-5 flex flex-wrap gap-3 justify-center items-center'

const emptyHintClasses =
  'absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-gray-400 text-sm pointer-events-none'

const feederTitleClasses = 'text-sm font-semibold text-gray-600 uppercase tracking-wide'

const Feeder = React.forwardRef(function Feeder(
  {
    carrots,
    onCarrotPointerDown,
    onRemoveCarrot,
    onTapFeeder,
    isHighlighted,
    draggingId,
    draggingSource,
    flashState,
    badge,
    currentCount,
  },
  ref,
) {
  const wrapperClass = `${baseClasses} ${
    isHighlighted ? highlightClasses : ''
  } ${flashState === 'success' ? 'feeder-flash-success' : ''} ${
    flashState === 'error' ? 'feeder-flash-error' : ''
  }`
  const hasCarrots = carrots.length > 0

  const handleClick = (event) => {
    if (!onTapFeeder) return
    if (event.target === event.currentTarget) {
      onTapFeeder()
    }
  }

  const handleKeyDown = (event) => {
    if (!onTapFeeder) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTapFeeder()
    }
  }

  return (
    <section
      ref={ref}
      aria-label="Mangeoire pour les carottes"
      className={wrapperClass}
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <p className={feederTitleClasses}>Mangeoire</p>
        <span className="text-sm font-medium text-gray-500">
          Dans la mangeoire :{' '}
          <span className="text-gray-900">{currentCount}</span>
        </span>
      </div>
      <div
        className={`${contentClasses} min-h-[180px]`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onTapFeeder ? 'button' : undefined}
        tabIndex={onTapFeeder ? 0 : undefined}
        aria-label="Zone de dépôt de la mangeoire"
      >
        {carrots.map((id) => (
          <Carrot
            key={id}
            id={id}
            variant="feeder"
            aria-label="carotte dans la mangeoire"
            onPointerDown={(event) => onCarrotPointerDown(id, event)}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onRemoveCarrot(id)
            }}
            isDragging={draggingSource === 'feeder' && draggingId === id}
          />
        ))}
      </div>
      {!hasCarrots && (
        <p className={emptyHintClasses}>Glisse les carottes ici !</p>
      )}
      {badge && (
        <div className="pointer-events-none absolute -top-8 right-6">
          <span className="badge-pop inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
            {badge}
          </span>
        </div>
      )}
    </section>
  )
})

export default Feeder

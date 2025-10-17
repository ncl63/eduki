import React from 'react'
import Carrot from './Carrot.jsx'

const highlightClasses =
  'border-emerald-400 ring-2 ring-inset ring-emerald-200 bg-emerald-50/50'

const baseClasses =
  'rounded-2xl border-2 border-gray-300 bg-white min-h-[220px] relative overflow-hidden transition-all'

const contentClasses = 'p-5 flex flex-wrap gap-3 justify-center items-center'

const emptyHintClasses =
  'absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-gray-400 text-sm pointer-events-none'

const feederTitleClasses = 'text-sm font-semibold text-gray-600 uppercase tracking-wide px-5 pt-5'

const Feeder = React.forwardRef(function Feeder(
  {
    carrots,
    onCarrotPointerDown,
    onRemoveCarrot,
    isHighlighted,
    draggingId,
    draggingSource,
  },
  ref,
) {
  const wrapperClass = `${baseClasses} ${isHighlighted ? highlightClasses : ''}`
  const hasCarrots = carrots.length > 0

  return (
    <section
      ref={ref}
      aria-label="Mangeoire pour les carottes"
      className={wrapperClass}
    >
      <p className={feederTitleClasses}>Mangeoire</p>
      <div className={contentClasses}>
        {carrots.map((id) => (
          <Carrot
            key={id}
            id={id}
            variant="feeder"
            aria-label="carotte dans la mangeoire"
            onPointerDown={(event) => onCarrotPointerDown(id, event)}
            onClick={() => onRemoveCarrot(id)}
            isDragging={draggingSource === 'feeder' && draggingId === id}
          />
        ))}
      </div>
      {!hasCarrots && (
        <p className={emptyHintClasses}>Glisse les carottes ici !</p>
      )}
    </section>
  )
})

export default Feeder

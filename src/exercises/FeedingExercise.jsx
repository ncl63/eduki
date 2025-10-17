import React, { useEffect, useMemo, useRef, useState } from 'react'
import ThoughtBubble from '../components/Feeding/ThoughtBubble.jsx'
import Feeder from '../components/Feeding/Feeder.jsx'
import Carrot, { CarrotIcon } from '../components/Feeding/Carrot.jsx'
import VerifyButton from '../components/Feeding/VerifyButton.jsx'

const TARGET_COUNT = 3
const POOL_EXTRA = 3
const FEEDBACK_MESSAGES = {
  success: 'Bravo ! Le lapin se régale.',
  error: 'Essaie encore.',
}
// TODO: permettre de désactiver sons et animations via des options utilisateur.

function isPointInsideRect(x, y, rect) {
  if (!rect) return false
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

export default function FeedingExercise({ meta }) {
  const targetCount = TARGET_COUNT
  const initialPool = useMemo(() => {
    const total = targetCount + POOL_EXTRA
    return Array.from({ length: total }, (_, index) => `carrot-${index}`)
  }, [targetCount])

  const [pool, setPool] = useState(initialPool)
  const [feeder, setFeeder] = useState([])
  const [status, setStatus] = useState('idle')
  const [chewing, setChewing] = useState(false)
  const [dragState, setDragState] = useState(null)
  const [isHoveringFeeder, setIsHoveringFeeder] = useState(false)
  const feederRef = useRef(null)
  const chewTimeoutRef = useRef(null)
  const dragStateRef = useRef(null)

  useEffect(() => {
    dragStateRef.current = dragState
  }, [dragState])

  useEffect(() => {
    return () => {
      if (chewTimeoutRef.current) {
        clearTimeout(chewTimeoutRef.current)
      }
    }
  }, [])

  const activePointerId = dragState?.pointerId ?? null

  useEffect(() => {
    if (activePointerId === null) {
      return undefined
    }

    const resolveDrop = (droppedInside) => {
      const current = dragStateRef.current
      if (!current) {
        return
      }

      if (current.source === 'pool') {
        if (droppedInside) {
          setPool((prev) => prev.filter((carrotId) => carrotId !== current.id))
          setFeeder((prev) => [...prev, current.id])
          setStatus('idle')
        }
      } else if (!droppedInside) {
        setFeeder((prev) => prev.filter((carrotId) => carrotId !== current.id))
        setPool((prev) => [current.id, ...prev])
        setStatus('idle')
      }

      dragStateRef.current = null
      setDragState(null)
      setIsHoveringFeeder(false)
    }

    const handlePointerMove = (event) => {
      const current = dragStateRef.current
      if (!current || event.pointerId !== current.pointerId) {
        return
      }
      event.preventDefault()

      const nextX = event.clientX - current.offsetX
      const nextY = event.clientY - current.offsetY

      setDragState((prev) =>
        prev ? { ...prev, x: nextX, y: nextY } : prev,
      )

      const rect = feederRef.current?.getBoundingClientRect()
      setIsHoveringFeeder(isPointInsideRect(event.clientX, event.clientY, rect))
    }

    const handlePointerUp = (event) => {
      const current = dragStateRef.current
      if (!current || event.pointerId !== current.pointerId) {
        return
      }
      event.preventDefault()

      const rect = feederRef.current?.getBoundingClientRect()
      const droppedInside = isPointInsideRect(
        event.clientX,
        event.clientY,
        rect,
      )

      // Simple bounding-box collision detection for drop handling.
      // We compare the pointer release position with the feeder rectangle.
      resolveDrop(droppedInside)
    }

    const handlePointerCancel = (event) => {
      const current = dragStateRef.current
      if (!current || event.pointerId !== current.pointerId) {
        return
      }
      resolveDrop(false)
    }

    window.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    })
    window.addEventListener('pointerup', handlePointerUp, { passive: false })
    window.addEventListener('pointercancel', handlePointerCancel, {
      passive: false,
    })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      setIsHoveringFeeder(false)
    }
  }, [activePointerId])

  const inFeeder = feeder.length

  const startDrag = (id, source, event) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    dragStateRef.current = {
      id,
      source,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    }
    setDragState(dragStateRef.current)
  }

  const handlePoolPointerDown = (id, event) => {
    startDrag(id, 'pool', event)
  }

  const handleFeederPointerDown = (id, event) => {
    startDrag(id, 'feeder', event)
  }

  const handleRemoveCarrot = (id) => {
    setFeeder((prev) => prev.filter((carrotId) => carrotId !== id))
    setPool((prev) => [id, ...prev])
    if (status !== 'idle') {
      setStatus('idle')
    }
  }

  const handleVerify = () => {
    if (chewTimeoutRef.current) {
      clearTimeout(chewTimeoutRef.current)
    }

    if (inFeeder === targetCount) {
      setStatus('success')
      setChewing(true)
      chewTimeoutRef.current = setTimeout(() => {
        setChewing(false)
      }, 900)
    } else {
      setStatus('error')
      setChewing(false)
    }
  }

  const feedbackMessage =
    status === 'idle' ? '' : FEEDBACK_MESSAGES[status] || ''

  return (
    <div className="min-h-screen bg-orange-50/40">
      <div className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-[1fr_1fr] md:p-10">
        <div className="flex flex-col items-center gap-6 md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">
              {meta?.titre ?? 'Mangeoire fantôme'}
            </h1>
            <p className="text-gray-600 text-center md:text-left max-w-md">
              Glisse les carottes dans la mangeoire pour donner exactement ce
              que le lapin demande.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div
              className={`relative w-48 h-48 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition ${
                chewing ? 'animate-bounce' : ''
              }`}
              aria-hidden="true"
            >
              <CarrotIcon className="absolute -top-3 -right-2 w-12 h-12 opacity-80" />
              <RabbitIllustration chewing={chewing} />
            </div>
            <ThoughtBubble
              targetCount={targetCount}
              currentCount={inFeeder}
              status={status}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Feeder
            ref={feederRef}
            carrots={feeder}
            isHighlighted={isHoveringFeeder}
            onCarrotPointerDown={handleFeederPointerDown}
            onRemoveCarrot={handleRemoveCarrot}
            draggingId={dragState?.id ?? null}
            draggingSource={dragState?.source ?? null}
          />

          <div className="rounded-2xl border border-dashed border-orange-200 bg-white/80 p-5 flex flex-col items-center gap-5">
            <div className="w-full">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-center">
                Réserve de carottes
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {pool.map((id) => (
                  <Carrot
                    key={id}
                    id={id}
                    onPointerDown={(event) => handlePoolPointerDown(id, event)}
                    aria-label="carotte à déposer"
                    isDragging={dragState?.id === id && dragState?.source === 'pool'}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <VerifyButton
                onClick={handleVerify}
                disabled={chewing}
              />
              {feedbackMessage && (
                <p
                  className={`text-base font-medium ${
                    status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                  role="status"
                >
                  {feedbackMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {dragState && (
        <div
          className="pointer-events-none fixed z-50 flex items-center justify-center"
          style={{
            left: `${dragState.x}px`,
            top: `${dragState.y}px`,
            width: `${dragState.width}px`,
            height: `${dragState.height}px`,
          }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full border border-orange-200 bg-white/90 shadow-lg">
            <CarrotIcon className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  )
}

function RabbitIllustration({ chewing }) {
  return (
    <div
      className={`relative flex h-40 w-32 flex-col items-center justify-center transition-transform duration-200 ${
        chewing ? 'scale-105' : ''
      }`}
    >
      <div className="absolute -top-6 flex w-full justify-between px-4">
        <span className="h-10 w-4 rounded-t-full bg-gray-200" />
        <span className="h-10 w-4 rounded-t-full bg-gray-200" />
      </div>
      <div className="relative flex h-32 w-full flex-col items-center justify-center rounded-[40%] bg-gray-100 shadow-inner">
        <div className="mt-6 flex gap-6">
          <span className="h-3 w-3 rounded-full bg-gray-800" />
          <span className="h-3 w-3 rounded-full bg-gray-800" />
        </div>
        <div
          className={`mt-4 h-4 w-10 rounded-full bg-gray-800 transition-transform ${
            chewing ? 'scale-y-75' : ''
          }`}
        />
        <div className="mt-4 flex items-center gap-2">
          <div className="h-6 w-4 rounded-br-full rounded-tr-full bg-white border border-gray-300" />
          <div className="h-6 w-4 rounded-bl-full rounded-tl-full bg-white border border-gray-300" />
        </div>
      </div>
      <div className="absolute -bottom-5 flex w-full items-center justify-center gap-3">
        <span className="h-8 w-6 rounded-full bg-white border border-gray-300" />
        <span className="h-8 w-6 rounded-full bg-white border border-gray-300" />
      </div>
    </div>
  )
}

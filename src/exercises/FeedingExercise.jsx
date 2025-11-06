import React, { useCallback, useEffect, useRef, useState } from 'react'
import FeedingHeader from '../components/Feeding/FeedingHeader.jsx'
import ThoughtBubble from '../components/Feeding/ThoughtBubble.jsx'
import Feeder from '../components/Feeding/Feeder.jsx'
import Carrot, { CarrotIcon } from '../components/Feeding/Carrot.jsx'
import VerifyButton from '../components/Feeding/VerifyButton.jsx'
import SettingsModal from '../components/Feeding/SettingsModal.jsx'
import { BunnyIcon } from '../components/Feeding/Illustrations.jsx'

const SETTINGS_KEY = 'feeding.settings'
const DEFAULT_SETTINGS = {
  min: 1,
  max: 3,
  autoResetOnSuccess: true,
  autoResetDelayMs: 2500,
}
const POOL_EXTRA = 3
const BASE_POOL_COUNT = 8
const MAX_FEEDER_COUNT = 20
const DRAG_THRESHOLD_PX = 6
const CHEW_DURATION_MS = 1200
const BADGE_DURATION_MS = 1500
// TODO: permettre de désactiver sons et animations via des options utilisateur.

function loadSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(stored)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    }
  } catch (error) {
    console.warn('Impossible de charger les réglages feeding:', error)
    return DEFAULT_SETTINGS
  }
}

function storeSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Impossible de sauvegarder les réglages feeding:', error)
  }
}

function randomWithinRange(min, max) {
  if (min === max) {
    return min
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeCarrotIds(count) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return Array.from({ length: count }, () => `carrot-${crypto.randomUUID()}`)
  }

  const timestamp = Date.now().toString(36)
  return Array.from({ length: count }, (_, index) => `carrot-${timestamp}-${index}`)
}

function createInitialPool(targetCount) {
  const poolCount = Math.min(
    MAX_FEEDER_COUNT,
    Math.max(BASE_POOL_COUNT, targetCount + POOL_EXTRA),
  )
  return makeCarrotIds(poolCount)
}

function isPointInsideRect(x, y, rect) {
  if (!rect) {
    return false
  }
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

function clampDelay(delay) {
  return Math.max(500, Math.min(delay, 10000))
}

export default function FeedingExercise({ meta }) {
  const initialSettingsRef = useRef(loadSettings())
  const initialTargetRef = useRef(
    randomWithinRange(initialSettingsRef.current.min, initialSettingsRef.current.max),
  )

  const [settings, setSettings] = useState(initialSettingsRef.current)
  const [targetCount, setTargetCount] = useState(initialTargetRef.current)
  const [pool, setPool] = useState(() => createInitialPool(initialTargetRef.current))
  const [feeder, setFeeder] = useState([])
  const [status, setStatus] = useState('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [badgeMessage, setBadgeMessage] = useState('')
  const [chewing, setChewing] = useState(false)
  const [dragState, setDragState] = useState(null)
  const [isHoveringFeeder, setIsHoveringFeeder] = useState(false)
  const [feederFlash, setFeederFlash] = useState(null)
  const [pendingTapId, setPendingTapId] = useState(null)
  const [invalidDropId, setInvalidDropId] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bubbleAnimate, setBubbleAnimate] = useState(false)

  const feederRef = useRef(null)
  const dragStateRef = useRef(null)
  const chewTimeoutRef = useRef(null)
  const autoResetTimeoutRef = useRef(null)
  const flashTimeoutRef = useRef(null)
  const invalidTimeoutRef = useRef(null)
  const badgeTimeoutRef = useRef(null)
  const bubbleTimeoutRef = useRef(null)

  const inFeeder = feeder.length
  const hasSelectedCarrot = Boolean(pendingTapId)

  const clearTimeoutRef = useCallback((ref) => {
    if (ref.current) {
      clearTimeout(ref.current)
      ref.current = null
    }
  }, [])

  const clearFeedback = useCallback(() => {
    setStatus('idle')
    setFeedbackMessage('')
    setBadgeMessage('')
  }, [])

  const triggerInvalid = useCallback(
    (id) => {
      if (!id) {
        return
      }
      setInvalidDropId(id)
      clearTimeoutRef(invalidTimeoutRef)
      invalidTimeoutRef.current = setTimeout(() => {
        setInvalidDropId(null)
      }, 260)
    },
    [clearTimeoutRef],
  )

  const resetExercise = useCallback(
    ({ rerollTarget = true, nextSettings } = {}) => {
      const activeSettings = nextSettings ?? settings
      const nextTarget = rerollTarget
        ? randomWithinRange(activeSettings.min, activeSettings.max)
        : targetCount
      const nextPool = createInitialPool(nextTarget)

      clearTimeoutRef(chewTimeoutRef)
      clearTimeoutRef(autoResetTimeoutRef)
      clearTimeoutRef(flashTimeoutRef)
      clearTimeoutRef(invalidTimeoutRef)
      clearTimeoutRef(badgeTimeoutRef)

      setTargetCount(nextTarget)
      setPool(nextPool)
      setFeeder([])
      setStatus('idle')
      setFeedbackMessage('')
      setBadgeMessage('')
      setChewing(false)
      setPendingTapId(null)
      setIsHoveringFeeder(false)
      setDragState(null)
      dragStateRef.current = null
    },
    [settings, targetCount, clearTimeoutRef],
  )

  const addCarrotToFeeder = useCallback(
    (id) => {
      if (!id) {
        return false
      }

      let added = false
      setFeeder((prev) => {
        if (prev.length >= MAX_FEEDER_COUNT || prev.includes(id)) {
          return prev
        }
        added = true
        return [...prev, id]
      })

      if (added) {
        setPool((prev) => prev.filter((carrotId) => carrotId !== id))
        clearFeedback()
        return true
      }

      triggerInvalid(id)
      return false
    },
    [clearFeedback, triggerInvalid],
  )

  const removeCarrotFromFeeder = useCallback(
    (id) => {
      if (!id) {
        return
      }
      setFeeder((prev) => prev.filter((carrotId) => carrotId !== id))
      setPool((prev) => [id, ...prev])
      clearFeedback()
    },
    [clearFeedback],
  )

  useEffect(() => {
    dragStateRef.current = dragState
  }, [dragState])

  useEffect(() => {
    setBubbleAnimate(true)
    clearTimeoutRef(bubbleTimeoutRef)
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleAnimate(false)
    }, 400)
    return () => clearTimeoutRef(bubbleTimeoutRef)
  }, [targetCount, clearTimeoutRef])

  useEffect(() => {
    storeSettings(settings)
  }, [settings])

  useEffect(() => {
    if (pendingTapId && !pool.includes(pendingTapId)) {
      setPendingTapId(null)
    }
  }, [pendingTapId, pool])

  useEffect(() => {
    return () => {
      clearTimeoutRef(chewTimeoutRef)
      clearTimeoutRef(autoResetTimeoutRef)
      clearTimeoutRef(flashTimeoutRef)
      clearTimeoutRef(invalidTimeoutRef)
      clearTimeoutRef(badgeTimeoutRef)
      clearTimeoutRef(bubbleTimeoutRef)
    }
  }, [clearTimeoutRef])

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

      if (!current.isDragging) {
        cleanup()
        return
      }

      if (current.source === 'pool') {
        if (droppedInside) {
          addCarrotToFeeder(current.id)
        } else {
          triggerInvalid(current.id)
        }
      } else if (!droppedInside) {
        removeCarrotFromFeeder(current.id)
      }

      cleanup()
    }

    const cleanup = () => {
      dragStateRef.current = null
      setDragState(null)
      setIsHoveringFeeder(false)
    }

    const handlePointerMove = (event) => {
      const current = dragStateRef.current
      if (!current || event.pointerId !== current.pointerId) {
        return
      }

      const deltaX = event.clientX - current.startX
      const deltaY = event.clientY - current.startY
      const distance = Math.hypot(deltaX, deltaY)
      let updated = current

      if (!current.isDragging && distance > DRAG_THRESHOLD_PX) {
        updated = {
          ...current,
          isDragging: true,
        }
      }

      if (!updated.isDragging) {
        return
      }

      const nextX = event.clientX - updated.offsetX
      const nextY = event.clientY - updated.offsetY
      updated = {
        ...updated,
        x: nextX,
        y: nextY,
      }

      dragStateRef.current = updated
      setDragState(updated)

      const rect = feederRef.current?.getBoundingClientRect()
      setIsHoveringFeeder(isPointInsideRect(event.clientX, event.clientY, rect))
      event.preventDefault()
    }

    const handlePointerUp = (event) => {
      const current = dragStateRef.current
      if (!current || event.pointerId !== current.pointerId) {
        return
      }

      const rect = feederRef.current?.getBoundingClientRect()
      const droppedInside = isPointInsideRect(
        event.clientX,
        event.clientY,
        rect,
      )

      resolveDrop(droppedInside)
      event.preventDefault()
    }

    const handlePointerCancel = (event) => {
      const current = dragStateRef.current
      if (!current || event.pointerId !== current.pointerId) {
        return
      }
      resolveDrop(false)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp, { passive: false })
    window.addEventListener('pointercancel', handlePointerCancel, { passive: false })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [
    activePointerId,
    addCarrotToFeeder,
    removeCarrotFromFeeder,
    triggerInvalid,
  ])

  const startDrag = useCallback((id, source, event) => {
    event.preventDefault()
    setPendingTapId(null)

    const rect = event.currentTarget.getBoundingClientRect()
    const nextState = {
      id,
      source,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      startX: event.clientX,
      startY: event.clientY,
      x: rect.left,
      y: rect.top,
      isDragging: false,
    }

    dragStateRef.current = nextState
    setDragState(nextState)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }, [])

  const handlePoolPointerDown = useCallback(
    (id, event) => {
      startDrag(id, 'pool', event)
    },
    [startDrag],
  )

  const handleFeederPointerDown = useCallback(
    (id, event) => {
      startDrag(id, 'feeder', event)
    },
    [startDrag],
  )

  const handlePoolClick = useCallback(
    (id) => {
      if (dragStateRef.current?.isDragging) {
        return
      }
      setPendingTapId((previous) => (previous === id ? null : id))
      clearFeedback()
    },
    [clearFeedback],
  )

  const handleFeederTap = useCallback(() => {
    if (!pendingTapId) {
      return
    }
    const added = addCarrotToFeeder(pendingTapId)
    if (added) {
      setPendingTapId(null)
    }
  }, [pendingTapId, addCarrotToFeeder])

  const handleRemoveCarrot = useCallback(
    (id) => {
      setPendingTapId(null)
      removeCarrotFromFeeder(id)
    },
    [removeCarrotFromFeeder],
  )

  const handleReset = useCallback(() => {
    resetExercise({ rerollTarget: true })
  }, [resetExercise])

  const handleVerify = useCallback(() => {
    clearTimeoutRef(autoResetTimeoutRef)
    clearTimeoutRef(badgeTimeoutRef)

    if (inFeeder === targetCount) {
      setStatus('success')
      setFeedbackMessage('Bravo !')
      setBadgeMessage('Bravo !')
      setChewing(true)
      setPendingTapId(null)

      clearTimeoutRef(chewTimeoutRef)
      chewTimeoutRef.current = setTimeout(() => {
        setChewing(false)
      }, CHEW_DURATION_MS)

      setFeederFlash('success')
      clearTimeoutRef(flashTimeoutRef)
      flashTimeoutRef.current = setTimeout(() => {
        setFeederFlash(null)
      }, 280)

      badgeTimeoutRef.current = setTimeout(() => {
        setBadgeMessage('')
      }, BADGE_DURATION_MS)

      if (settings.autoResetOnSuccess) {
        autoResetTimeoutRef.current = setTimeout(() => {
          resetExercise({ rerollTarget: true })
        }, clampDelay(settings.autoResetDelayMs))
      }
    } else {
      setStatus('error')
      setBadgeMessage('')
      setChewing(false)
      setPendingTapId(null)
      setFeedbackMessage(
        `Encore un effort ! Il faut ${targetCount}. Tu en as ${inFeeder}.`,
      )
      setFeederFlash('error')
      clearTimeoutRef(flashTimeoutRef)
      flashTimeoutRef.current = setTimeout(() => {
        setFeederFlash(null)
      }, 280)
    }
  }, [
    clearTimeoutRef,
    inFeeder,
    targetCount,
    settings.autoResetOnSuccess,
    settings.autoResetDelayMs,
    resetExercise,
  ])

  const handleSaveSettings = useCallback(
    (nextSettings) => {
      setSettings(nextSettings)
      setIsSettingsOpen(false)
      resetExercise({ rerollTarget: true, nextSettings })
    },
    [resetExercise],
  )

  const title = meta?.titre ?? 'Nourris le lapin'

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-orange-50/40 to-white">
      <FeedingHeader
        title={title}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6 md:pt-10 lg:gap-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-center gap-8 rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-6 lg:items-start">
            <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Objectif
              </p>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Nourris le lapin avec le bon nombre de carottes.
              </h2>
            </div>

            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">
              <div
                className={`relative flex h-48 w-48 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-300 ${
                  chewing ? 'ring-4 ring-emerald-200 ring-offset-2 ring-offset-white' : ''
                }`}
                aria-hidden="true"
              >
                <CarrotIcon className="absolute -top-3 -right-2 h-12 w-12 opacity-80" />
                <BunnyIcon
                  chewing={chewing}
                  className={`w-32 transition-transform duration-300 ${
                    chewing ? 'scale-[1.05]' : ''
                  }`}
                />
              </div>

              <ThoughtBubble
                targetCount={targetCount}
                currentCount={inFeeder}
                status={status}
                animate={bubbleAnimate}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-6">
            <Feeder
              ref={feederRef}
              carrots={feeder}
              currentCount={inFeeder}
              isHighlighted={isHoveringFeeder || hasSelectedCarrot}
              onCarrotPointerDown={handleFeederPointerDown}
              onRemoveCarrot={handleRemoveCarrot}
              onTapFeeder={handleFeederTap}
              draggingId={dragState?.id ?? null}
              draggingSource={dragState?.source ?? null}
              flashState={feederFlash}
              badge={badgeMessage}
            />
          </div>
        </div>

        <footer className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Réserve de carottes
              </p>
              <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-4">
                {pool.map((id) => (
                  <Carrot
                    key={id}
                    id={id}
                    onPointerDown={(event) => handlePoolPointerDown(id, event)}
                    onClick={() => handlePoolClick(id)}
                    aria-label="carotte à déposer"
                    isDragging={
                      Boolean(dragState?.isDragging) &&
                      dragState?.id === id &&
                      dragState?.source === 'pool'
                    }
                    isSelected={pendingTapId === id}
                    invalid={invalidDropId === id}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 lg:items-end">
              <div className="flex flex-col items-center gap-2 text-center lg:items-end">
                {feedbackMessage && (
                  <p
                    role="status"
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      status === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {feedbackMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[56px] rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                >
                  Réinitialiser
                </button>
                <VerifyButton onClick={handleVerify} />
              </div>
            </div>
          </div>
        </footer>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      {dragState?.isDragging && (
        <div
          className="pointer-events-none fixed z-[999] flex items-center justify-center"
          style={{
            left: `${dragState.x}px`,
            top: `${dragState.y}px`,
            width: `${dragState.width}px`,
            height: `${dragState.height}px`,
          }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full border border-orange-200 bg-white/95 shadow-2xl">
            <CarrotIcon className="h-full w-full" />
          </div>
        </div>
      )}
    </div>
  )
}

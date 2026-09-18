import { useCallback, useEffect, useRef, useState } from 'react'
import { distance, evaluateTrace, isPointInCircle } from './traceValidation.js'

const MIN_POINT_DISTANCE = 2

function pointerToSvgPoint(svg, pointerEvent) {
  const matrix = svg.getScreenCTM()
  if (!matrix) return null

  const point = svg.createSVGPoint()
  point.x = pointerEvent.clientX
  point.y = pointerEvent.clientY
  return point.matrixTransform(matrix.inverse())
}

function eventSamples(svg, event) {
  const nativeEvent = event.nativeEvent
  const coalesced = typeof nativeEvent.getCoalescedEvents === 'function'
    ? nativeEvent.getCoalescedEvents()
    : []
  const source = coalesced.length > 0 ? coalesced : [nativeEvent]
  return source.map((sample) => pointerToSvgPoint(svg, sample)).filter(Boolean)
}

/**
 * Moteur d'un geste de tracé. Il ne connaît ni la progression du pack ni son interface.
 * Tous les pointeurs (doigt, stylet, souris) suivent le même chemin d'événements.
 */
export function useTracingEngine(path) {
  const [tracePoints, setTracePoints] = useState([])
  const [phase, setPhase] = useState('ready')
  const pointsRef = useRef([])
  const activePointerRef = useRef(null)
  const phaseRef = useRef('ready')
  const animationFrameRef = useRef(null)

  const setCurrentPhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }, [])

  const cancelVisualFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const publishPoints = useCallback((immediate = false) => {
    if (immediate) {
      cancelVisualFrame()
      setTracePoints([...pointsRef.current])
      return
    }
    if (animationFrameRef.current !== null) return
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null
      setTracePoints([...pointsRef.current])
    })
  }, [cancelVisualFrame])

  const resetTrace = useCallback(() => {
    cancelVisualFrame()
    activePointerRef.current = null
    pointsRef.current = []
    setTracePoints([])
    setCurrentPhase('ready')
  }, [cancelVisualFrame, setCurrentPhase])

  useEffect(() => {
    resetTrace()
  }, [path.id, resetTrace])

  useEffect(() => () => cancelVisualFrame(), [cancelVisualFrame])

  useEffect(() => {
    function interruptActiveGesture() {
      if (activePointerRef.current === null) return
      activePointerRef.current = null
      setCurrentPhase(pointsRef.current.length > 1 ? 'restart' : 'ready')
    }

    window.addEventListener('resize', interruptActiveGesture)
    document.addEventListener('visibilitychange', interruptActiveGesture)
    return () => {
      window.removeEventListener('resize', interruptActiveGesture)
      document.removeEventListener('visibilitychange', interruptActiveGesture)
    }
  }, [setCurrentPhase])

  const appendSamples = useCallback((samples) => {
    for (const point of samples) {
      const previous = pointsRef.current.at(-1)
      if (!previous || distance(previous, point) >= MIN_POINT_DISTANCE) {
        pointsRef.current.push({ x: point.x, y: point.y })
      }
    }
  }, [])

  const finishGesture = useCallback((surface, pointerId, nextPhase) => {
    if (surface.hasPointerCapture?.(pointerId)) {
      surface.releasePointerCapture(pointerId)
    }
    activePointerRef.current = null
    publishPoints(true)
    setCurrentPhase(nextPhase)
  }, [publishPoints, setCurrentPhase])

  const validateCurrentTrace = useCallback(() => evaluateTrace({
    tracePoints: pointsRef.current,
    path,
  }), [path])

  const onPointerDown = useCallback((event) => {
    if (phaseRef.current === 'success' || activePointerRef.current !== null) return
    if (event.isPrimary === false) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const point = pointerToSvgPoint(event.currentTarget, event.nativeEvent)
    if (!point || !isPointInCircle(point, path.start)) return

    event.preventDefault()
    activePointerRef.current = event.pointerId
    pointsRef.current = [{ x: point.x, y: point.y }]
    setTracePoints([...pointsRef.current])
    setCurrentPhase('drawing')

    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Certains tests synthétiques ne créent pas de pointeur capturable.
    }
  }, [path.start, setCurrentPhase])

  const onPointerMove = useCallback((event) => {
    if (event.pointerId !== activePointerRef.current || phaseRef.current !== 'drawing') return
    event.preventDefault()
    appendSamples(eventSamples(event.currentTarget, event))
    publishPoints()

    if (validateCurrentTrace().success) {
      finishGesture(event.currentTarget, event.pointerId, 'success')
    }
  }, [appendSamples, finishGesture, publishPoints, validateCurrentTrace])

  const onPointerUp = useCallback((event) => {
    if (event.pointerId !== activePointerRef.current) return
    event.preventDefault()
    appendSamples(eventSamples(event.currentTarget, event))
    const result = validateCurrentTrace()
    finishGesture(event.currentTarget, event.pointerId, result.success ? 'success' : 'restart')
  }, [appendSamples, finishGesture, validateCurrentTrace])

  const onPointerCancel = useCallback((event) => {
    if (event.pointerId !== activePointerRef.current) return
    finishGesture(event.currentTarget, event.pointerId, pointsRef.current.length > 1 ? 'restart' : 'ready')
  }, [finishGesture])

  const onLostPointerCapture = useCallback((event) => {
    if (event.pointerId !== activePointerRef.current) return
    activePointerRef.current = null
    publishPoints(true)
    setCurrentPhase(pointsRef.current.length > 1 ? 'restart' : 'ready')
  }, [publishPoints, setCurrentPhase])

  return {
    tracePoints,
    phase,
    resetTrace,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    },
  }
}

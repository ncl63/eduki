import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TRACE_VIEW_BOX } from '../data/tracingPaths.js'
import { useTracingEngine } from '../tracing/useTracingEngine.js'
import '../styles/tracing.css'

const SUCCESS_ANIMATION_MS = 650

function pathData(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

function polylinePoints(points) {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

function instructionForPhase(phase) {
  if (phase === 'success') return 'Bravo ! Tu as suivi le chemin.'
  if (phase === 'drawing') return 'Continue jusqu’à l’arrivée.'
  if (phase === 'restart') return 'Repars du point vert quand tu es prêt.'
  return 'Pose ton doigt sur le point vert, puis suis les pointillés.'
}

export default function FollowDots({ meta, pack }) {
  const [pathIndex, setPathIndex] = useState(0)
  const [packComplete, setPackComplete] = useState(false)
  const [canAdvance, setCanAdvance] = useState(false)
  const path = pack.paths[pathIndex]
  const { tracePoints, phase, resetTrace, pointerHandlers } = useTracingEngine(path)
  const guidePath = useMemo(() => pathData(path.points), [path.points])

  useEffect(() => {
    if (phase !== 'success') {
      setCanAdvance(false)
      return undefined
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const timeout = window.setTimeout(() => setCanAdvance(true), reduceMotion ? 0 : SUCCESS_ANIMATION_MS)
    return () => window.clearTimeout(timeout)
  }, [phase])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overscrollBehavior = previousBodyOverscroll
    }
  }, [])

  function advance() {
    if (pathIndex === pack.paths.length - 1) {
      setPackComplete(true)
      return
    }
    setPathIndex((current) => current + 1)
  }

  function restartPack() {
    setPackComplete(false)
    setPathIndex(0)
    resetTrace()
  }

  return (
    <div className="activity-page tracing-page">
      <header className="tracing-header">
        <Link to="/" className="tracing-home-link">← Accueil</Link>
        <div className="tracing-title">
          <p>Graphisme</p>
          <h1>{meta?.titre ?? pack.title}</h1>
        </div>
        {!packComplete && <p className="tracing-step" aria-label={`Tracé ${pathIndex + 1} sur ${pack.paths.length}`}>
          {pathIndex + 1} sur {pack.paths.length}
        </p>}
      </header>

      {packComplete ? (
        <main className="tracing-complete" data-testid="tracing-complete">
          <span className="tracing-complete-mark" aria-hidden="true">✓</span>
          <h2>Bravo !</h2>
          <p>{pack.completionMessage}</p>
          <div className="tracing-complete-actions">
            <button type="button" className="tracing-primary-button" onClick={restartPack}>Recommencer le parcours</button>
            <Link to="/" className="tracing-secondary-link">Retour aux exercices</Link>
          </div>
        </main>
      ) : (
        <main className="tracing-main">
          <div className="tracing-instruction" aria-live="polite">
            <strong>{path.name}</strong>
            <span>{instructionForPhase(phase)}</span>
          </div>

          <div className={`tracing-board ${phase === 'success' ? 'is-success' : ''}`}>
            <svg
              className="tracing-surface"
              data-testid="tracing-surface"
              data-path-id={path.id}
              viewBox={`0 0 ${TRACE_VIEW_BOX.width} ${TRACE_VIEW_BOX.height}`}
              aria-label={`${path.name}. Commence sur le point vert et rejoins la cible.`}
              onContextMenu={(event) => event.preventDefault()}
              {...pointerHandlers}
            >
              <path
                data-testid="tracing-guide"
                className="tracing-guide"
                d={guidePath}
                strokeWidth={path.visualWidth}
                strokeDasharray={`${path.visualWidth * 0.8} ${path.visualWidth * 0.72}`}
              />
              {tracePoints.length > 0 && (
                <polyline
                  data-testid="tracing-user-line"
                  className="tracing-user-line"
                  points={polylinePoints(tracePoints)}
                  strokeWidth={path.visualWidth * 0.72}
                />
              )}
              <g className="tracing-start" data-testid="tracing-start" aria-hidden="true">
                <circle cx={path.start.x} cy={path.start.y} r={path.start.radius + 10} className="tracing-start-halo" />
                <circle cx={path.start.x} cy={path.start.y} r={path.start.radius} className="tracing-start-dot" />
              </g>
              <g className="tracing-destination" data-testid="tracing-destination" aria-hidden="true">
                <circle cx={path.destination.x} cy={path.destination.y} r={path.destination.radius + 13} className="tracing-destination-halo" />
                <circle cx={path.destination.x} cy={path.destination.y} r={path.destination.radius} className="tracing-destination-ring" />
                <circle cx={path.destination.x} cy={path.destination.y} r={path.destination.radius * 0.34} className="tracing-destination-core" />
              </g>
            </svg>
          </div>

          <div className="tracing-actions">
            <button type="button" className="tracing-reset-button" onClick={resetTrace}>Recommencer</button>
            {phase === 'success' && !canAdvance && <span className="tracing-celebrating" role="status">Bravo !</span>}
            {canAdvance && (
              <button type="button" className="tracing-primary-button" onClick={advance}>
                {pathIndex === pack.paths.length - 1 ? 'Terminer' : 'Tracé suivant'}
              </button>
            )}
          </div>
        </main>
      )}
    </div>
  )
}

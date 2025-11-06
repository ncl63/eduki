import React from 'react'
import { Link } from 'react-router-dom'
import bunnySceneImg from '../assets/feeding/bunny-plate.svg'
import carrotImg from '../assets/feeding/carrot.svg'
import carrotPoolImg from '../assets/feeding/carrot-pool.svg'

const MIN_TARGET = 1
const MAX_TARGET = 3
const SUCCESS_RESET_DELAY = 1400
const DRAG_TYPE = 'application/x-carrot-source'

const randomTarget = () =>
  Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1)) + MIN_TARGET

function ThoughtCarrot({ dimmed }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center">
      <img
        src={carrotImg}
        alt=""
        aria-hidden="true"
        className={`h-7 w-7 select-none transition duration-150 ${dimmed ? 'opacity-30 saturate-50' : 'opacity-100'}`}
      />
    </span>
  )
}

function PlateCarrot({ id, onRemove }) {
  return (
    <button
      type="button"
      onClick={() => onRemove(id)}
      className="group relative h-16 w-16 origin-bottom select-none transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
    >
      <img
        src={carrotImg}
        alt="Carotte dans l'assiette"
        className="h-full w-full max-w-[64px] object-contain drop-shadow-[0_10px_12px_rgba(15,23,42,0.18)] transition-transform duration-150 group-hover:scale-110"
      />
      <span className="sr-only">Retirer cette carotte de l'assiette</span>
    </button>
  )
}

export default function FeedingExercise({ meta }) {
  const idFactoryRef = React.useRef(0)
  const successTimeoutRef = React.useRef(null)
  const dragPreviewRef = React.useRef(null)

  const createCarrotId = React.useCallback(() => {
    idFactoryRef.current += 1
    return `carrot-${idFactoryRef.current.toString(36)}`
  }, [])

  const [target, setTarget] = React.useState(() => randomTarget())
  const [plateCarrots, setPlateCarrots] = React.useState([])
  const [status, setStatus] = React.useState('idle')
  const [feedback, setFeedback] = React.useState('')
  const [isDragOverPlate, setIsDragOverPlate] = React.useState(false)

  const clearSuccessTimeout = React.useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }, [])

  const resetExercise = React.useCallback(() => {
    setTarget(randomTarget())
    setPlateCarrots([])
    setStatus('idle')
    setFeedback('')
  }, [])

  const spawnCarrot = React.useCallback(() => {
    setPlateCarrots((prev) => [...prev, createCarrotId()])
    setStatus('idle')
    setFeedback('')
    clearSuccessTimeout()
  }, [createCarrotId, clearSuccessTimeout])

  const handlePoolClick = React.useCallback(() => {
    spawnCarrot()
  }, [spawnCarrot])

  const handlePoolKeyDown = React.useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        spawnCarrot()
      }
    },
    [spawnCarrot],
  )

  const handlePoolDragStart = React.useCallback((event) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData(DRAG_TYPE, 'pool')
    if (dragPreviewRef.current) {
      const rect = dragPreviewRef.current.getBoundingClientRect()
      event.dataTransfer.setDragImage(dragPreviewRef.current, rect.width / 2, rect.height / 2)
    }
  }, [dragPreviewRef])

  const handlePlateDragOver = React.useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragOverPlate(true)
  }, [])

  const handlePlateDragLeave = React.useCallback((event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    setIsDragOverPlate(false)
  }, [])

  const handlePlateDrop = React.useCallback(
    (event) => {
      event.preventDefault()
      setIsDragOverPlate(false)
      if (event.dataTransfer.getData(DRAG_TYPE) === 'pool') {
        spawnCarrot()
      }
    },
    [spawnCarrot],
  )

  const handleRemoveCarrot = React.useCallback(
    (id) => {
      setPlateCarrots((prev) => prev.filter((carrotId) => carrotId !== id))
      setStatus('idle')
      setFeedback('')
      clearSuccessTimeout()
    },
    [clearSuccessTimeout],
  )

  const handleVerify = React.useCallback(() => {
    clearSuccessTimeout()

    if (plateCarrots.length === target) {
      setStatus('success')
      setFeedback('Bravo ! Tu as donné le bon nombre de carottes !')
      successTimeoutRef.current = setTimeout(() => {
        resetExercise()
      }, SUCCESS_RESET_DELAY)
      return
    }

    const difference = target - plateCarrots.length
    if (difference > 0) {
      setStatus('error')
      setFeedback(
        difference === 1
          ? "Il manque encore une carotte dans l'assiette."
          : `Il manque encore ${difference} carottes dans l'assiette.`,
      )
      return
    }

    const surplus = Math.abs(difference)
    setStatus('error')
    setFeedback(
      surplus === 1
        ? 'Il y a une carotte de trop dans l\'assiette.'
        : `Il y a ${surplus} carottes de trop dans l'assiette.`,
    )
  }, [plateCarrots.length, target, resetExercise, clearSuccessTimeout])

  React.useEffect(() => () => clearSuccessTimeout(), [clearSuccessTimeout])

  const remainingToPlace = Math.max(target - plateCarrots.length, 0)

  const plateHighlightClasses =
    status === 'success'
      ? 'outline outline-[6px] outline-emerald-200/70'
      : status === 'error'
        ? 'outline outline-[6px] outline-rose-200/80'
        : isDragOverPlate
          ? 'outline outline-[4px] outline-emerald-200/60'
          : 'outline outline-[4px] outline-transparent'

  const bubbleCarrots = React.useMemo(
    () =>
      Array.from({ length: target }, (_, index) => (
        <ThoughtCarrot key={`bubble-${index}`} dimmed={index < Math.min(plateCarrots.length, target)} />
      )),
    [plateCarrots.length, target],
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-10 lg:pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 text-center lg:text-left">
            {meta?.niveau ? (
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-500">{meta.niveau}</p>
            ) : null}
            <h1 className="text-4xl font-black text-slate-800 md:text-5xl">{meta?.titre ?? 'Mangeoire fantôme'}</h1>
            {meta?.description ? (
              <p className="mx-auto max-w-2xl text-base text-slate-600 lg:mx-0">{meta.description}</p>
            ) : null}
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            <span aria-hidden="true">←</span>
            Retour à l'accueil
          </Link>
        </div>

        <section className="mt-12 flex flex-1 flex-col items-center gap-12 rounded-[32px] bg-white/95 p-8 shadow-2xl ring-1 ring-emerald-50 lg:mt-16 lg:p-12">
          <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
            <div className="flex max-w-xs flex-col items-center gap-4 text-center lg:-mt-10 lg:items-center">
              <div className="relative">
                <img
                  src={carrotPoolImg}
                  alt="Carotte à déplacer"
                  className="h-36 w-auto select-none drop-shadow-[0_12px_18px_rgba(15,23,42,0.18)]"
                />
                <img
                  ref={dragPreviewRef}
                  src={carrotImg}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-auto -translate-x-1/2 -translate-y-1/2 opacity-0"
                />
                <button
                  type="button"
                  onClick={handlePoolClick}
                  onKeyDown={handlePoolKeyDown}
                  onDragStart={handlePoolDragStart}
                  draggable={true}
                  aria-label="Prendre une carotte dans le panier"
                  className="absolute inset-0 rounded-[48px] border-2 border-transparent focus:outline-none focus-visible:border-emerald-300 focus-visible:shadow-[0_0_0_6px_rgba(110,231,183,0.6)]"
                />
              </div>
              <p className="max-w-xs text-sm font-medium text-slate-500">
                Fais glisser la carotte vers l'assiette du lapin pour la dupliquer. Tu peux aussi appuyer dessus pour en ajouter une.
              </p>
            </div>

            <div className="relative w-full max-w-2xl">
              <img
                src={bunnySceneImg}
                alt="Lapin pensif devant son assiette"
                className="w-full max-w-2xl select-none"
              />
              <div className="pointer-events-none absolute left-[16%] top-[6%] flex w-[52%] flex-col items-center gap-2 text-center text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 drop-shadow-sm">Dans sa tête</p>
                <div className="flex items-end gap-2 drop-shadow-sm">
                  <span className="text-6xl font-black text-emerald-600">{target}</span>
                  <span className="pb-1 text-sm font-semibold text-slate-600">{target > 1 ? 'carottes' : 'carotte'}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 drop-shadow-sm">{bubbleCarrots}</div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 drop-shadow-sm">
                  À placer : <span className="font-black text-slate-700">{remainingToPlace}</span>
                </p>
              </div>
              <div
                role="list"
                aria-label="Assiette du lapin"
                onDragOver={handlePlateDragOver}
                onDragLeave={handlePlateDragLeave}
                onDrop={handlePlateDrop}
                className={`absolute left-1/2 top-[62%] flex w-[50%] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-[120px] pb-4 pt-2 transition duration-150 ${plateHighlightClasses} outline-offset-[10px]`}
              >
                {plateCarrots.length > 0 ? (
                  plateCarrots.map((id) => <PlateCarrot key={id} id={id} onRemove={handleRemoveCarrot} />)
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 drop-shadow-sm">
                    Dépose ici
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-6 text-center lg:max-w-3xl">
            <p className="text-base font-medium text-slate-600">
              Lorsque tu ajoutes une carotte dans l'assiette, une carotte se grise dans la bulle du lapin. Mets-en autant qu'il en rêve !
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={handleVerify}
                className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                Vérifier la réponse
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSuccessTimeout()
                  resetExercise()
                }}
                className="rounded-full border border-emerald-200 bg-white px-8 py-3 text-lg font-semibold text-emerald-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                Recommencer
              </button>
            </div>
            {feedback ? (
              <p
                className={`text-base font-semibold ${status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}
                role="status"
              >
                {feedback}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}

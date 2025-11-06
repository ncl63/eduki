import React from 'react'
import thoughtBubbleImg from '../assets/feeding/thought-bubble.svg'
import bunnyImg from '../assets/feeding/bunny.svg'
import tableImg from '../assets/feeding/table.svg'
import carrotImg from '../assets/feeding/carrot.svg'

const MIN_TARGET = 1
const MAX_TARGET = 3
const POOL_SIZE = 6
const SUCCESS_RESET_DELAY = 1400

const randomTarget = () =>
  Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1)) + MIN_TARGET

function CarrotIndicator({ dimmed }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center">
      <img
        src={carrotImg}
        alt=""
        aria-hidden="true"
        className={`h-10 w-10 object-contain drop-shadow-sm transition ${dimmed ? 'opacity-30 saturate-50' : ''}`}
      />
    </span>
  )
}

function CarrotToken({ id, onClick, ariaLabel, variant = 'pool' }) {
  const baseClasses =
    'group relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 transition duration-150 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 focus-visible:ring-offset-2'

  const variantClasses =
    variant === 'pool'
      ? 'border-orange-200 bg-orange-50/70 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-100/80'
      : 'border-emerald-200 bg-white/90 hover:-translate-y-1 hover:border-emerald-300'

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses}`}
    >
      <img
        src={carrotImg}
        alt=""
        aria-hidden="true"
        className="h-14 w-14 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)] transition duration-150 ease-out group-hover:scale-110 group-focus-visible:scale-110"
      />
    </button>
  )
}

export default function FeedingExercise({ meta }) {
  const idFactoryRef = React.useRef(0)
  const successTimeoutRef = React.useRef(null)

  const createCarrotId = React.useCallback(() => {
    idFactoryRef.current += 1
    return `carrot-${idFactoryRef.current.toString(36)}`
  }, [])

  const buildPool = React.useCallback(
    () => Array.from({ length: POOL_SIZE }, () => createCarrotId()),
    [createCarrotId],
  )

  const [target, setTarget] = React.useState(() => randomTarget())
  const [pool, setPool] = React.useState(() => buildPool())
  const [plate, setPlate] = React.useState([])
  const [status, setStatus] = React.useState('idle')
  const [feedback, setFeedback] = React.useState('')

  const clearSuccessTimeout = React.useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }, [])

  const resetExercise = React.useCallback(() => {
    setTarget(randomTarget())
    setPool(buildPool())
    setPlate([])
    setStatus('idle')
    setFeedback('')
  }, [buildPool])

  const handleTakeCarrot = React.useCallback(
    (id) => {
      setPool((prevPool) => {
        if (!prevPool.includes(id)) {
          return prevPool
        }
        setPlate((prevPlate) => [...prevPlate, id])
        setStatus('idle')
        setFeedback('')
        clearSuccessTimeout()
        return prevPool.filter((carrotId) => carrotId !== id)
      })
    },
    [clearSuccessTimeout],
  )

  const handleReturnCarrot = React.useCallback(
    (id) => {
      setPlate((prevPlate) => {
        if (!prevPlate.includes(id)) {
          return prevPlate
        }
        const nextPlate = prevPlate.filter((carrotId) => carrotId !== id)
        setPool((prevPool) => [...prevPool, id])
        setStatus('idle')
        setFeedback('')
        clearSuccessTimeout()
        return nextPlate
      })
    },
    [clearSuccessTimeout],
  )

  const handleVerify = React.useCallback(() => {
    clearSuccessTimeout()

    if (plate.length === target) {
      setStatus('success')
      setFeedback('Bravo ! Tu as donné le bon nombre de carottes.')
      successTimeoutRef.current = setTimeout(() => {
        resetExercise()
      }, SUCCESS_RESET_DELAY)
      return
    }

    const difference = target - plate.length
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
        ? 'Il y a une carotte de trop dans la mangeoire.'
        : `Il y a ${surplus} carottes de trop dans la mangeoire.`,
    )
  }, [plate.length, target, resetExercise, clearSuccessTimeout])

  React.useEffect(() => () => clearSuccessTimeout(), [clearSuccessTimeout])

  const bubbleCarrots = React.useMemo(() => {
    return Array.from({ length: target }, (_, index) => (
      <CarrotIndicator
        key={`indicator-${index}`}
        dimmed={index < Math.min(plate.length, target)}
      />
    ))
  }, [plate.length, target])

  const remainingToPlace = Math.max(target - plate.length, 0)

  const plateHighlightClasses =
    status === 'success'
      ? 'border-emerald-400 ring-4 ring-emerald-200/70'
      : status === 'error'
        ? 'border-rose-400 ring-4 ring-rose-200/70'
        : 'border-slate-200 ring-2 ring-white/80'

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center px-4 py-10 lg:py-16">
        <header className="mb-12 text-center">
          {meta?.niveau ? (
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">
              {meta.niveau}
            </p>
          ) : null}
          <h1 className="mt-3 text-4xl font-black text-slate-800 md:text-5xl">
            {meta?.titre ?? 'Mangeoire fantôme'}
          </h1>
          {meta?.description ? (
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              {meta.description}
            </p>
          ) : null}
        </header>

        <div className="flex w-full flex-col gap-8 lg:flex-row">
          <section className="relative flex flex-1 flex-col items-center gap-10 rounded-[32px] bg-white/95 p-8 shadow-xl ring-1 ring-slate-100 lg:p-12">
            <div className="relative flex w-full justify-center">
              <img
                src={thoughtBubbleImg}
                alt=""
                aria-hidden="true"
                className="h-56 w-auto drop-shadow-lg sm:h-64"
              />
              <div className="absolute inset-x-[14%] top-[20%] flex flex-col items-center gap-4 text-center text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                  Nombre de carottes demandées
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-emerald-500 sm:text-6xl">
                    {target}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-slate-500 sm:text-base">
                    {target > 1 ? 'carottes' : 'carotte'}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">{bubbleCarrots}</div>
                <p className="text-xs font-medium text-slate-500">
                  À placer :{' '}
                  <span className="font-semibold text-slate-700">{remainingToPlace}</span>
                </p>
              </div>
            </div>

            <div className="relative flex w-full max-w-xl flex-col items-center">
              <img
                src={bunnyImg}
                alt="Lapin affamé"
                className="z-10 w-44 drop-shadow-xl sm:w-52"
              />
              <div className="relative mt-[-36px] w-full">
                <div
                  className={`absolute left-1/2 top-[30%] z-20 flex min-h-[96px] w-[68%] -translate-x-1/2 items-center justify-center gap-4 rounded-[28px] bg-white/90 px-4 py-4 backdrop-blur-sm transition-all ${plateHighlightClasses}`}
                >
                  {plate.length > 0 ? (
                    plate.map((id) => (
                      <CarrotToken
                        key={id}
                        id={id}
                        variant="plate"
                        onClick={handleReturnCarrot}
                        ariaLabel="Retirer la carotte de l'assiette"
                      />
                    ))
                  ) : (
                    <p className="text-sm font-medium text-slate-400">
                      Dépose les carottes ici
                    </p>
                  )}
                </div>
                <img
                  src={tableImg}
                  alt="Table du lapin"
                  className="relative z-10 w-full max-w-md drop-shadow-lg"
                />
              </div>
              <p className="mt-6 text-sm font-semibold text-slate-600">
                Place les carottes dans l'assiette du lapin
              </p>
            </div>
          </section>

          <section className="flex w-full max-w-sm flex-col justify-between gap-8 rounded-[32px] bg-white/95 p-8 shadow-xl ring-1 ring-slate-100 lg:p-10">
            <div className="space-y-3 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-slate-800">Pool de carottes</h2>
              <p className="text-sm text-slate-500">
                Clique sur une carotte pour la prendre, puis clique sur celles de l'assiette pour les retirer si besoin.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {pool.length > 0 ? (
                pool.map((id) => (
                  <CarrotToken
                    key={id}
                    id={id}
                    onClick={handleTakeCarrot}
                    ariaLabel="Ajouter cette carotte à l'assiette"
                  />
                ))
              ) : (
                <p className="col-span-3 text-center text-sm font-medium text-slate-400">
                  Il n'y a plus de carottes dans le panier.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleVerify}
                className="w-full rounded-full bg-emerald-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Vérifier la réponse
              </button>
              {feedback ? (
                <p
                  className={`text-center text-sm font-semibold ${status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}
                >
                  {feedback}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useExerciseTracking } from '../hooks/useExerciseTracking.js'
import { loadJSON, randomPickAvoiding, saveJSON, shuffle } from '../utils/storage.js'

export const QUANTITIES = [1, 2, 3, 4, 5, 6]
export const DISPLAY_MODES = ['dice', 'digits']
const SETTINGS_KEY = 'settings_quantity_sound_v1'

const NUMBER_WORDS = {
  1: 'un',
  2: 'deux',
  3: 'trois',
  4: 'quatre',
  5: 'cinq',
  6: 'six',
}

const DICE_DOTS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

export const DEFAULT_QUANTITY_SOUND_SETTINGS = {
  displayMode: 'dice',
}

export function sanitizeQuantitySoundSettings(settings) {
  const displayMode = DISPLAY_MODES.includes(settings?.displayMode)
    ? settings.displayMode
    : DEFAULT_QUANTITY_SOUND_SETTINGS.displayMode

  return { displayMode }
}

export function loadQuantitySoundSettings() {
  return sanitizeQuantitySoundSettings(loadJSON(SETTINGS_KEY, DEFAULT_QUANTITY_SOUND_SETTINGS))
}

export function saveQuantitySoundSettings(settings) {
  saveJSON(SETTINGS_KEY, sanitizeQuantitySoundSettings(settings))
}

function generateRoundId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildRound(avoid = null) {
  return {
    id: generateRoundId(),
    target: randomPickAvoiding(QUANTITIES, avoid ? [avoid] : []),
    options: shuffle(QUANTITIES),
  }
}

export function DiceFace({ quantity, className = '' }) {
  const visibleDots = new Set(DICE_DOTS[quantity] ?? [])

  return (
    <span
      aria-hidden="true"
      className={`grid aspect-square w-24 grid-cols-3 grid-rows-3 gap-2 rounded-3xl border-4 border-current bg-white p-3 shadow-sm sm:w-28 sm:gap-3 sm:p-4 dark:bg-gray-900 ${className}`}
    >
      {Array.from({ length: 9 }, (_, index) => {
        const position = index + 1
        return (
          <span
            key={position}
            className={`rounded-full bg-current ${visibleDots.has(position) ? 'opacity-100' : 'opacity-0'}`}
          />
        )
      })}
    </span>
  )
}

export default function QuantitySound({ meta }) {
  const [settings] = useState(() => loadQuantitySoundSettings())
  const lastTargetRef = useRef(null)
  const timeoutRef = useRef(null)
  const [round, setRound] = useState(() => {
    const nextRound = buildRound()
    lastTargetRef.current = nextRound.target
    return nextRound
  })
  const [choiceStates, setChoiceStates] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [isSpeechUnlocked, setIsSpeechUnlocked] = useState(false)
  const [speechMessage, setSpeechMessage] = useState('Clique sur le bouton écouter pour entendre le nombre.')

  const { startRound, recordError, completeRound } = useExerciseTracking('quantity-sound')

  useEffect(() => {
    startRound({ targetNumber: round.target, displayMode: settings.displayMode })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const speakNumber = useCallback((number) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setSpeechMessage("La voix n'est pas disponible sur cet appareil.")
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(NUMBER_WORDS[number])
    utterance.lang = 'fr-FR'
    utterance.rate = 0.78
    utterance.pitch = 1
    utterance.onerror = () => {
      setSpeechMessage("Impossible de lire le nombre. Vérifie le volume de l'appareil.")
    }
    window.speechSynthesis.speak(utterance)
    setSpeechMessage(null)
  }, [])

  useEffect(() => {
    if (!isSpeechUnlocked) {
      return undefined
    }

    const playbackTimeout = setTimeout(() => speakNumber(round.target), 250)
    return () => clearTimeout(playbackTimeout)
  }, [isSpeechUnlocked, round, speakNumber])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const advanceRound = useCallback(() => {
    setChoiceStates({})
    setFeedback(null)
    const nextRound = buildRound(lastTargetRef.current)
    lastTargetRef.current = nextRound.target
    setRound(nextRound)
    startRound({ targetNumber: nextRound.target, displayMode: settings.displayMode })
  }, [settings.displayMode, startRound])

  function handleChoice(quantity) {
    if (choiceStates[round.target] === 'success') {
      return
    }

    if (quantity === round.target) {
      completeRound()
      setChoiceStates((previous) => ({ ...previous, [quantity]: 'success' }))
      setFeedback('Bravo !')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(advanceRound, 1200)
    } else {
      recordError()
      setChoiceStates((previous) => ({ ...previous, [quantity]: 'error' }))
      setFeedback('Essaie encore.')
    }
  }

  function replayNumber() {
    if (isSpeechUnlocked) {
      speakNumber(round.target)
      return
    }
    setIsSpeechUnlocked(true)
  }

  const instruction = settings.displayMode === 'dice'
    ? 'Clique sur la face de dé qui correspond au nombre entendu.'
    : 'Clique sur le chiffre que tu entends.'

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6 bg-indigo-50/40 dark:bg-gray-900">
      <header className="w-full space-y-4">
        <div className="w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline dark:text-gray-300">
              Accueil
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Écoute & associe</p>
            <h1 className="text-2xl font-bold text-indigo-900 text-center dark:text-indigo-100">
              {meta?.titre ?? 'Écoute le nombre'}
            </h1>
          </div>
          <div className="flex justify-end">
            <Link to="/settings/quantity-sound" className="text-sm text-gray-600 hover:underline dark:text-gray-300">
              Réglages
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={replayNumber}
            aria-label="Écouter le nombre"
            className="w-20 h-20 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 flex items-center justify-center"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 fill-current">
              <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zm-2.5-8v2.06a6.5 6.5 0 0 1 0 11.88V20a8.5 8.5 0 0 0 0-16z" />
            </svg>
          </button>
          <div className="max-w-md text-center text-sm text-gray-600 dark:text-gray-300">
            <p>{instruction}</p>
            {speechMessage && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{speechMessage}</p>}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 items-stretch">
        <div className="flex-1 w-full rounded-3xl border border-indigo-100 bg-white/90 p-4 shadow-inner sm:p-6 dark:border-indigo-900 dark:bg-gray-800/90">
          <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {round.options.map((quantity) => (
              <button
                key={`${round.id}-${quantity}`}
                type="button"
                onClick={() => handleChoice(quantity)}
                aria-label={settings.displayMode === 'dice' ? `Face de dé ${quantity}` : `Chiffre ${quantity}`}
                className={`min-h-[150px] rounded-3xl border-4 px-3 py-5 shadow transition-all flex items-center justify-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 sm:min-h-[210px] ${getButtonClasses(choiceStates[quantity])}`}
              >
                {settings.displayMode === 'dice' ? (
                  <DiceFace quantity={quantity} />
                ) : (
                  <span className="text-7xl font-black sm:text-8xl">{quantity}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div aria-live="polite" className="min-h-[1.75rem] text-center text-lg font-semibold text-gray-700 dark:text-gray-200">
          {feedback}
        </div>
      </main>
    </div>
  )
}

function getButtonClasses(state) {
  switch (state) {
    case 'success':
      return 'bg-green-100 border-green-500 text-green-700 shadow-lg dark:bg-green-950 dark:text-green-300'
    case 'error':
      return 'bg-red-100 border-red-500 text-red-700 shadow-lg dark:bg-red-950 dark:text-red-300'
    default:
      return 'bg-white border-indigo-200 text-indigo-900 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-900 dark:border-indigo-800 dark:text-indigo-100'
  }
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { shuffle, randomPickAvoiding } from '../utils/storage.js'
import { useExerciseTracking } from '../hooks/useExerciseTracking.js'
import { DEFAULT_LETTER_STYLE, fontForStyle, formatLetterCase, sanitizeLetterStyle } from '../utils/fontStyle.js'

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SETTINGS_KEY = 'settings_letter_sound_v1'
export const MIN_CHOICES_PER_ROUND = 2
export const MAX_CHOICES_PER_ROUND = 12
export const DEFAULT_CHOICES_PER_ROUND = 6

const audioModules = import.meta.glob('../Lettersound/*.m4a', { eager: true })

let audioSources = LETTERS.reduce((acc, letter) => {
  const mod = audioModules[`../Lettersound/${letter}.m4a`]
  if (mod) {
    acc[letter] = mod.default ?? mod
  }
  return acc
}, {})

if (Object.keys(audioSources).length === 0) {
  audioSources = LETTERS.reduce((acc, letter) => {
    try {
      acc[letter] = new URL(`../Lettersound/${letter}.m4a`, import.meta.url).href
    } catch {
      // ignore missing audio files
    }
    return acc
  }, {})
}

const AVAILABLE_LETTERS = LETTERS.filter((letter) => Boolean(audioSources[letter]))
const DEFAULT_ENABLED = AVAILABLE_LETTERS.length > 0 ? AVAILABLE_LETTERS : LETTERS

export const DEFAULT_SOUND_SETTINGS = {
  enabledLetters: [...DEFAULT_ENABLED],
  choicesPerRound: DEFAULT_CHOICES_PER_ROUND,
  letterStyle: DEFAULT_LETTER_STYLE,
}

import { clamp } from '../utils/storage.js'

export function sanitizeLetterSoundSettings(settings) {
  const requestedEnabled = Array.isArray(settings?.enabledLetters)
    ? settings.enabledLetters
    : DEFAULT_ENABLED

  const normalized = requestedEnabled
    .map((letter) => (typeof letter === 'string' ? letter.toUpperCase() : ''))
    .filter((letter) => AVAILABLE_LETTERS.includes(letter))

  const unique = Array.from(new Set(normalized))
  const requestedChoices = Number.isFinite(settings?.choicesPerRound)
    ? Math.floor(settings.choicesPerRound)
    : DEFAULT_CHOICES_PER_ROUND
  const boundedChoices = clamp(requestedChoices, MIN_CHOICES_PER_ROUND, MAX_CHOICES_PER_ROUND)

  const letterStyle = sanitizeLetterStyle(settings?.letterStyle)
  return { enabledLetters: unique, choicesPerRound: boundedChoices, letterStyle }
}

export function loadLetterSoundSettings() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SOUND_SETTINGS }
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return sanitizeLetterSoundSettings({ ...DEFAULT_SOUND_SETTINGS })
    }
    return sanitizeLetterSoundSettings(JSON.parse(stored))
  } catch {
    return sanitizeLetterSoundSettings({ ...DEFAULT_SOUND_SETTINGS })
  }
}

export function saveLetterSoundSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitizeLetterSoundSettings(settings)))
  } catch {
    // ignore write errors
  }
}

function buildRound(settings, avoid = null) {
  const safeSettings = sanitizeLetterSoundSettings(settings)
  const enabled = safeSettings.enabledLetters.length > 0 ? safeSettings.enabledLetters : DEFAULT_ENABLED

  if (enabled.length === 0) {
    return buildRound(DEFAULT_SOUND_SETTINGS)
  }

  const optionsCount = Math.min(safeSettings.choicesPerRound, enabled.length)
  const shuffledEnabled = shuffle(enabled)
  const optionsPool = shuffledEnabled.slice(0, optionsCount)

  if (optionsPool.length === 0) {
    return buildRound(DEFAULT_SOUND_SETTINGS)
  }

  const target = randomPickAvoiding(optionsPool, avoid ? [avoid] : [])
  const ensuredOptions = optionsPool.includes(target)
    ? optionsPool
    : [...optionsPool.slice(0, Math.max(optionsPool.length - 1, 0)), target]
  const options = shuffle(ensuredOptions)

  return {
    id: generateRoundId(),
    target,
    options,
  }
}

function generateRoundId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}


export default function LetterSound({ meta }) {
  const [settings] = useState(() => {
    const loaded = loadLetterSoundSettings()
    const filled = !loaded.enabledLetters || loaded.enabledLetters.length === 0
      ? { ...loaded, enabledLetters: [...DEFAULT_SOUND_SETTINGS.enabledLetters] }
      : loaded
    return sanitizeLetterSoundSettings(filled)
  })

  const lastTargetRef = useRef(null)
  const [round, setRound] = useState(() => {
    const r = buildRound(settings)
    lastTargetRef.current = r.target
    return r
  })
  const [choiceStates, setChoiceStates] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [audioMessage, setAudioMessage] = useState('Clique sur 🔁 pour activer le son.')
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false)
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)
  const pendingPlayRef = useRef(null)
  const audioContextRef = useRef(null)

  const { startRound, recordError, completeRound } = useExerciseTracking('letter-sound')

  // Suivi du premier tour
  useEffect(() => {
    if (round) {
      startRound({ targetLetter: round.target, choicesCount: settings.choicesPerRound })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const disabledLetters = useMemo(() => {
    const enabled = new Set(settings.enabledLetters)
    return LETTERS.filter((letter) => !enabled.has(letter))
  }, [settings])

  useEffect(() => {
    const createAudioElement = () => {
      const element = new Audio()
      element.preload = 'auto'
      return element
    }

    audioRef.current = createAudioElement()

    // iOS PWA specific: recreate audio element when app becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Completely recreate audio element after app reactivation
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
        audioRef.current = createAudioElement()
        // Force user to interact again to unlock audio on iOS
        setIsAudioUnlocked(false)
        setAudioMessage('Clique sur 🔁 pour activer le son.')
      }
    }

    // Handle page restore from bfcache (iOS Safari)
    const handlePageShow = (event) => {
      if (event.persisted) {
        // Completely recreate audio element after restore from bfcache
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
        audioRef.current = createAudioElement()
        setIsAudioUnlocked(false)
        setAudioMessage('Clique sur 🔁 pour activer le son.')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', handlePageShow)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current.load()
      }
      audioRef.current = null
    }
  }, [])

  const playSource = useCallback(
    async (src, { initiatedByUser = false } = {}) => {
      if (!src) {
        setAudioMessage('Fichier audio manquant pour cette lettre.')
        return Promise.resolve()
      }

      const failureMessage = initiatedByUser
        ? 'Impossible de lire le son. Vérifie que ton appareil n\'est pas en mode silencieux.'
        : 'Ton navigateur a bloqué la lecture automatique. Clique sur 🔁 pour écouter.'

      try {
        // iOS PWA fix: Initialize AudioContext if needed
        if (!audioContextRef.current) {
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (AudioContext) {
              audioContextRef.current = new AudioContext()
            }
          } catch (err) {
            // AudioContext initialization failed
          }
        }

        // iOS PWA fix: Resume AudioContext if suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }

        // iOS PWA fix: Create a fresh Audio element for each playback
        // This ensures the element is never in a corrupted state after app reopening
        const freshAudio = new Audio()
        freshAudio.preload = 'auto'
        freshAudio.src = src

        // Clean up old audio element
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }

        // Store the new audio element
        audioRef.current = freshAudio

        await freshAudio.play()
        setAudioMessage(null)
      } catch (error) {
        setAudioMessage(failureMessage)
        return Promise.reject(error)
      }
    },
    [],
  )

  const requestPlayback = useCallback(
    ({ initiatedByUser = false } = {}) => {
      if (!round) {
        return
      }
      const src = audioSources[round.target]
      pendingPlayRef.current = src ? { src, initiatedByUser } : null

      if (!src) {
        setAudioMessage('Fichier audio manquant pour cette lettre.')
        return
      }

      if (!isAudioUnlocked && !initiatedByUser) {
        setAudioMessage('Clique sur 🔁 pour activer le son.')
        return
      }

      pendingPlayRef.current = null
      playSource(src, { initiatedByUser }).catch(() => {})
    },
    [isAudioUnlocked, playSource, round],
  )

  useEffect(() => {
    if (!isAudioUnlocked) {
      return undefined
    }

    if (pendingPlayRef.current) {
      const { src } = pendingPlayRef.current
      pendingPlayRef.current = null
      playSource(src, { initiatedByUser: true }).catch(() => {})
    }

    return undefined
  }, [isAudioUnlocked, playSource])

  useEffect(() => {
    function unlock() {
      setIsAudioUnlocked(true)
      // Remove listeners once unlocked — no need to keep firing
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }

    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    window.addEventListener('touchstart', unlock)

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }
  }, [])

  useEffect(() => {
    if (!round) {
      return undefined
    }

    requestPlayback()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [round, requestPlayback])

  const advanceRound = useCallback(() => {
    setChoiceStates({})
    setFeedback(null)
    const r = buildRound(settings, lastTargetRef.current)
    lastTargetRef.current = r.target
    setRound(r)
    startRound({ targetLetter: r.target, choicesCount: settings.choicesPerRound })
  }, [settings, startRound])

  function handleChoice(letter) {
    if (!round || choiceStates[round.target] === 'success') {
      return
    }

    if (letter === round.target) {
      completeRound()
      setChoiceStates((prev) => ({ ...prev, [letter]: 'success' }))
      setFeedback('Bravo !')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        advanceRound()
      }, 1200)
    } else {
      recordError()
      setChoiceStates((prev) => ({ ...prev, [letter]: 'error' }))
      setFeedback('Essaie encore.')
    }
  }

  function replaySound() {
    if (!round) {
      return
    }
    setIsAudioUnlocked(true)
    requestPlayback({ initiatedByUser: true })
  }

  if (!round) {
    return null
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6">
      <header className="w-full space-y-3">
        <div className="w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ⬅️ Accueil
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">Écoute & choisis</p>
            <h1 className="text-2xl font-bold text-indigo-900 text-center">{meta?.titre ?? 'Écoute la lettre'}</h1>
          </div>
          <div className="flex justify-end">
            <Link to="/settings/letter-sound" className="text-sm text-gray-600 hover:underline">
              Réglages ⚙️
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={replaySound}
            aria-label="Réécouter la lettre"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600 text-white text-3xl shadow hover:bg-indigo-500 flex items-center justify-center"
          >
            🔁
          </button>
          <div className="text-sm text-gray-600 text-center">
            <p>Clique sur la lettre que tu entends.</p>
            {audioMessage && <p className="text-xs text-amber-600 mt-1">{audioMessage}</p>}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 items-stretch">
        <div className="flex-1 w-full bg-white/90 rounded-3xl border border-indigo-100 shadow-inner p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 h-full">
            {round.options.map((letter, index) => (
              <button
                key={`${round.id}-${index}`}
                type="button"
                onClick={() => handleChoice(letter)}
                className={`rounded-3xl border-4 text-5xl sm:text-6xl font-black tracking-wide transition-all px-6 py-10 min-h-[140px] sm:min-h-[200px] flex items-center justify-center shadow ${getButtonClasses(
                  choiceStates[letter],
                )}`}
                style={{ fontFamily: fontForStyle(settings.letterStyle) }}
              >
                {formatLetterCase(letter, settings.letterStyle)}
              </button>
            ))}
          </div>
        </div>
        <div className="text-base md:text-lg text-gray-600 text-center min-h-[1.5rem]">{feedback}</div>
      </main>

      {disabledLetters.length > 0 && (
        <footer className="text-center text-xs text-gray-400">
          Lettres exclues : {disabledLetters.join(', ')}
        </footer>
      )}
    </div>
  )
}

function getButtonClasses(state) {
  switch (state) {
    case 'success':
      return 'bg-green-100 border-green-400 text-green-700 shadow-lg'
    case 'error':
      return 'bg-red-100 border-red-400 text-red-600 shadow-lg'
    default:
      return 'bg-white border-indigo-200 text-indigo-900 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-xl'
  }
}

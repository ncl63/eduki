import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SETTINGS_KEY = 'settings_letter_sound_v1'
export const MIN_CHOICES_PER_ROUND = 2
export const MAX_CHOICES_PER_ROUND = 12
export const DEFAULT_CHOICES_PER_ROUND = 6

const letterAudioModules = import.meta.glob('../Lettersound/*.m4a', { eager: true })

let letterAudios = LETTERS.reduce((acc, letter) => {
  const module = letterAudioModules[`../Lettersound/${letter}.m4a`]
  if (module) {
    acc[letter] = module.default ?? module
  }
  return acc
}, {})

if (Object.keys(letterAudios).length === 0) {
  letterAudios = LETTERS.reduce((acc, letter) => {
    try {
      acc[letter] = new URL(`../Lettersound/${letter}.m4a`, import.meta.url).href
    } catch {
      // ignore missing files in fallback
    }
    return acc
  }, {})
}

const AVAILABLE_LETTERS = LETTERS.filter((letter) => Boolean(letterAudios[letter]))
const DEFAULT_ENABLED = AVAILABLE_LETTERS.length > 0 ? AVAILABLE_LETTERS : LETTERS

export const DEFAULT_SOUND_SETTINGS = {
  enabledLetters: [...DEFAULT_ENABLED],
  choicesPerRound: DEFAULT_CHOICES_PER_ROUND,
}

export function sanitizeLetterSoundSettings(settings) {
  const enabled = Array.isArray(settings?.enabledLetters) ? settings.enabledLetters : DEFAULT_ENABLED
  const normalized = enabled
    .map((letter) => (typeof letter === 'string' ? letter.toUpperCase() : ''))
    .filter((letter) => AVAILABLE_LETTERS.includes(letter))
  const unique = Array.from(new Set(normalized))
  const requestedChoices = Number.isFinite(settings?.choicesPerRound)
    ? Math.floor(settings.choicesPerRound)
    : DEFAULT_CHOICES_PER_ROUND
  const boundedChoices = Math.min(
    MAX_CHOICES_PER_ROUND,
    Math.max(MIN_CHOICES_PER_ROUND, requestedChoices),
  )
  return { enabledLetters: unique, choicesPerRound: boundedChoices }
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

function makeRound(settings) {
  const safeSettings = sanitizeLetterSoundSettings(settings)
  const enabled = safeSettings.enabledLetters.length > 0 ? safeSettings.enabledLetters : DEFAULT_ENABLED
  const choicesPerRound = safeSettings.choicesPerRound
  if (enabled.length === 0) {
    return makeRound(DEFAULT_SOUND_SETTINGS)
  }
  const target = enabled[Math.floor(Math.random() * enabled.length)]
  const others = enabled.filter((letter) => letter !== target)
  const shuffled = shuffleArray(others)
  const optionsCount = Math.min(choicesPerRound, enabled.length)
  const options = shuffleArray([target, ...shuffled.slice(0, Math.max(0, optionsCount - 1))])
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

function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function LetterSound({ meta }) {
  const [settings] = useState(() => {
    const loaded = loadLetterSoundSettings()
    const withFallback = !loaded.enabledLetters || loaded.enabledLetters.length === 0
      ? { ...loaded, enabledLetters: [...DEFAULT_SOUND_SETTINGS.enabledLetters] }
      : loaded
    return sanitizeLetterSoundSettings(withFallback)
  })
  const [round, setRound] = useState(() => makeRound(settings))
  const [choiceStates, setChoiceStates] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false)
  const [audioMessage, setAudioMessage] = useState('Clique sur 🔁 pour activer le son.')
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  const disabledLetters = useMemo(() => {
    const enabled = new Set(settings.enabledLetters)
    return LETTERS.filter((letter) => !enabled.has(letter))
  }, [settings])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  useEffect(() => {
    if (isAudioUnlocked) {
      return undefined
    }
    function unlock() {
      setIsAudioUnlocked(true)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [isAudioUnlocked])

  useEffect(() => {
    if (!round) {
      return undefined
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const src = letterAudios[round.target]
    if (!src) {
      return undefined
    }
    const audio = new Audio(src)
    audioRef.current = audio
    if (!isAudioUnlocked) {
      setAudioMessage('Clique sur 🔁 pour activer le son.')
      return () => {
        audio.pause()
      }
    }
    setAudioMessage(null)
    audio.play().catch(() => {
      setAudioMessage('Ton navigateur a bloqué la lecture automatique. Clique sur 🔁 pour écouter.')
    })
    return () => {
      audio.pause()
    }
  }, [round, isAudioUnlocked])

  function handleChoice(letter) {
    if (!round || choiceStates[round.target] === 'success') {
      return
    }

    if (letter === round.target) {
      setChoiceStates((prev) => ({ ...prev, [letter]: 'success' }))
      setFeedback('Bravo !')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setChoiceStates({})
        setFeedback(null)
        setRound(makeRound(settings))
      }, 1200)
    } else {
      setChoiceStates((prev) => ({ ...prev, [letter]: 'error' }))
      setFeedback("Essaie encore.")
    }
  }

  function replaySound() {
    if (!audioRef.current) {
      return
    }
    setIsAudioUnlocked(true)
    audioRef.current.currentTime = 0
    audioRef.current
      .play()
      .then(() => {
        setAudioMessage(null)
      })
      .catch(() => {
        setAudioMessage('Impossible de lire le son. Vérifie que ton appareil n’est pas en mode silencieux.')
      })
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
              >
                {letter}
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

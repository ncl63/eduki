import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SETTINGS_KEY = 'settings_letter_sound_v1'
const DEFAULT_ENABLED = LETTERS
const CHOICES_PER_ROUND = 6

const letterAudios = Object.fromEntries(
  LETTERS.map((letter) => [letter, new URL(`../Lettersound/${letter}.m4a`, import.meta.url).href]),
)

export const DEFAULT_SOUND_SETTINGS = {
  enabledLetters: [...DEFAULT_ENABLED],
}

export function sanitizeLetterSoundSettings(settings) {
  const enabled = Array.isArray(settings?.enabledLetters) ? settings.enabledLetters : DEFAULT_ENABLED
  const normalized = enabled
    .map((letter) => (typeof letter === 'string' ? letter.toUpperCase() : ''))
    .filter((letter) => LETTERS.includes(letter))
  const unique = Array.from(new Set(normalized))
  return { enabledLetters: unique }
}

export function loadLetterSoundSettings() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SOUND_SETTINGS }
  }
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return { ...DEFAULT_SOUND_SETTINGS }
    }
    return sanitizeLetterSoundSettings(JSON.parse(stored))
  } catch {
    return { ...DEFAULT_SOUND_SETTINGS }
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
  const enabled = sanitizeLetterSoundSettings(settings).enabledLetters
  const target = enabled[Math.floor(Math.random() * enabled.length)]
  const others = enabled.filter((letter) => letter !== target)
  const shuffled = shuffleArray(others)
  const optionsCount = Math.min(CHOICES_PER_ROUND, enabled.length)
  const options = shuffleArray([target, ...shuffled.slice(0, Math.max(0, optionsCount - 1))])
  return {
    target,
    options,
  }
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
    if (!loaded.enabledLetters || loaded.enabledLetters.length === 0) {
      return { enabledLetters: [...DEFAULT_SOUND_SETTINGS.enabledLetters] }
    }
    return loaded
  })
  const [round, setRound] = useState(() => makeRound(settings))
  const [choiceStates, setChoiceStates] = useState({})
  const [feedback, setFeedback] = useState(null)
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
    if (!round) {
      return undefined
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(letterAudios[round.target])
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => {
      audio.pause()
    }
  }, [round])

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
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
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
            className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-500"
          >
            ▶️ Réécouter
          </button>
          <p className="text-sm text-gray-600">Clique sur la lettre que tu entends.</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 items-stretch">
        <div className="flex-1 w-full bg-white/90 rounded-3xl border border-indigo-100 shadow-inner p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full">
            {round.options.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleChoice(letter)}
                className={`rounded-2xl border-2 text-4xl font-bold tracking-wide transition-all px-4 py-6 shadow-sm ${getButtonClasses(
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
      return 'bg-green-100 border-green-300 text-green-700'
    case 'error':
      return 'bg-red-100 border-red-300 text-red-600'
    default:
      return 'bg-white border-indigo-200 text-indigo-900 hover:border-indigo-400 hover:-translate-y-0.5'
  }
}

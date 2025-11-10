import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const SETTINGS_KEY = 'settings_words_v1'

export const DEFAULT_WORDS = ['MATIJA', 'LAPIN', 'CAROTTE', 'ECUREUIL', 'PLUMES']

export default function WordRecompose({ meta }) {
  const [settings, setSettings] = useState(() => loadWordSettings())
  const [round, setRound] = useState(() => makeRound(settings))
  const [feedback, setFeedback] = useState(null)
  const timeoutsRef = useRef([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutsRef.current = []
    }
  }, [])

  const remainingSlots = useMemo(
    () => round.slots.filter((slot) => slot == null).length,
    [round.slots],
  )

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  function scheduleTimeout(callback, delay) {
    const id = setTimeout(() => {
      callback()
      timeoutsRef.current = timeoutsRef.current.filter((storedId) => storedId !== id)
    }, delay)
    timeoutsRef.current.push(id)
  }

  function refreshRound() {
    const nextSettings = loadWordSettings()
    setSettings(nextSettings)
    setRound(makeRound(nextSettings))
    setFeedback(null)
  }

  function handleLetterClick(letterId) {
    setRound((current) => {
      const letterIndex = current.pool.findIndex((letter) => letter.id === letterId)
      if (letterIndex === -1) {
        return current
      }
      const letter = current.pool[letterIndex]
      if (letter.state === 'used') {
        return current
      }

      const nextSlotIndex = current.slots.findIndex((slot) => slot == null)
      if (nextSlotIndex === -1) {
        return current
      }

      const expectedChar = current.targetLetters[nextSlotIndex]
      const normalizedExpected = normalizeLetter(expectedChar)
      const normalizedReceived = normalizeLetter(letter.char)

      if (normalizedExpected === normalizedReceived) {
        const nextPool = current.pool.slice()
        nextPool[letterIndex] = { ...nextPool[letterIndex], state: 'used' }

        const nextSlots = current.slots.slice()
        nextSlots[nextSlotIndex] = current.targetLetters[nextSlotIndex]

        const completed = nextSlots.every((slot) => slot != null)

        if (completed) {
          setFeedback('Bravo !')
          scheduleTimeout(() => {
            refreshRound()
          }, 900)
        } else {
          setFeedback(null)
        }

        return {
          ...current,
          pool: nextPool,
          slots: nextSlots,
        }
      }

      const nextPool = current.pool.slice()
      nextPool[letterIndex] = { ...nextPool[letterIndex], state: 'error' }
      setFeedback("Essaie encore.")

      scheduleTimeout(() => {
        setRound((latest) => {
          const latestIndex = latest.pool.findIndex((item) => item.id === letterId)
          if (latestIndex === -1) {
            return latest
          }
          if (latest.pool[latestIndex].state !== 'error') {
            return latest
          }
          const revertedPool = latest.pool.slice()
          revertedPool[latestIndex] = { ...revertedPool[latestIndex], state: 'idle' }
          return { ...latest, pool: revertedPool }
        })
      }, 500)

      return {
        ...current,
        pool: nextPool,
      }
    })
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-10 md:py-10 flex flex-col gap-8">
      <header className="w-full space-y-3">
        <div className="w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ⬅️ Accueil
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-3">
              {round.targetLetters.map((char, index) => {
                const filled = round.slots[index] != null
                return (
                  <span
                    key={`${char}-${index}`}
                    className={`font-bold leading-none text-center transition-colors ${
                      filled ? 'text-green-500' : 'text-indigo-900'
                    }`}
                    style={{ fontSize: 'clamp(32px, 8vw, 112px)' }}
                  >
                    {char}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end">
            <Link to="/settings/words" className="text-sm text-gray-600 hover:underline">
              Réglages ⚙️
            </Link>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{meta?.titre ?? 'Recompose le mot'}</span>
          <span>
            {round.targetLetters.length - remainingSlots} / {round.targetLetters.length}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-10">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="w-full flex-1 bg-white/90 rounded-3xl border border-indigo-100 shadow-inner p-6 flex items-center justify-center">
            <div className="w-full flex flex-wrap justify-center gap-4">
              {round.targetLetters.map((char, index) => (
                <LetterSlot key={`${char}-${index}`} value={round.slots[index]} />
              ))}
            </div>
          </div>

          <div className="text-base md:text-lg text-gray-600 text-center min-h-[1.5rem]">
            {feedback
              ? feedback
              : remainingSlots === round.targetLetters.length
              ? 'Clique sur la première lettre du mot.'
              : remainingSlots === 0
              ? 'Bravo !'
              : `Encore ${remainingSlots} lettre${remainingSlots > 1 ? 's' : ''} à placer.`}
          </div>
        </div>

        <div className="w-full flex flex-wrap justify-center gap-4 pb-4">
          {round.pool.map((letter) => (
            <LetterChoice
              key={letter.id}
              letter={letter}
              onClick={() => handleLetterClick(letter.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

function LetterSlot({ value }) {
  const filled = value != null
  return (
    <div
      className={`w-16 h-20 md:w-20 md:h-24 rounded-2xl border-2 flex items-center justify-center text-3xl md:text-4xl font-semibold transition ${
        filled ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-white border-indigo-200 text-indigo-300'
      }`}
    >
      {filled ? value : ''}
    </div>
  )
}

function LetterChoice({ letter, onClick }) {
  const { char, state } = letter
  let bg = 'bg-white'
  let border = 'border-indigo-200'
  let text = 'text-indigo-900'
  let ring = 'focus:ring-indigo-200'

  if (state === 'used') {
    bg = 'bg-green-100'
    border = 'border-green-300'
    text = 'text-green-800'
    ring = 'focus:ring-green-200'
  } else if (state === 'error') {
    bg = 'bg-red-100'
    border = 'border-red-300'
    text = 'text-red-700'
    ring = 'focus:ring-red-200'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'used'}
      className={`px-6 py-4 md:px-8 md:py-5 rounded-[2rem] border ${border} ${bg} ${text} shadow-md font-semibold text-3xl md:text-4xl leading-none transition select-none focus:outline-none focus:ring-4 ${ring} ${
        state === 'used' ? 'cursor-not-allowed' : 'hover:scale-105'
      }`}
      style={{ minWidth: '4.5rem' }}
    >
      {char}
    </button>
  )
}

export function loadWordSettings() {
  const stored = loadJSON(SETTINGS_KEY)
  if (!stored) {
    return { words: DEFAULT_WORDS }
  }
  return sanitizeWordSettings(stored)
}

export function saveWordSettings(nextSettings) {
  const sanitized = sanitizeWordSettings(nextSettings)
  saveJSON(SETTINGS_KEY, sanitized)
}

export function sanitizeWordSettings(raw) {
  const source = raw?.words
  let entries = []

  if (Array.isArray(source)) {
    entries = source
  } else if (typeof source === 'string') {
    entries = source.split(/[\n,;]+/)
  } else if (source == null && typeof raw === 'string') {
    entries = raw.split(/[\n,;]+/)
  }

  const cleaned = entries
    .map((entry) => (entry == null ? '' : String(entry)))
    .map((entry) => entry.trim())
    .map((entry) => entry.replace(/\s+/g, ''))
    .filter((entry) => entry.length > 0)
    .map((entry) => entry.toLocaleUpperCase('fr-FR'))

  const unique = Array.from(new Set(cleaned))

  if (unique.length === 0) {
    return { words: DEFAULT_WORDS }
  }

  return { words: unique }
}

function makeRound(settings) {
  const sanitized = sanitizeWordSettings(settings)
  const word = pickRandomWord(sanitized.words)
  const targetLetters = Array.from(word)
  const slots = targetLetters.map(() => null)
  const pool = shuffle(
    targetLetters.map((char, index) => ({
      id: `${char}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      char,
      state: 'idle',
    })),
  )

  return {
    targetWord: word,
    targetLetters,
    slots,
    pool,
  }
}

function pickRandomWord(words) {
  if (!Array.isArray(words) || words.length === 0) {
    return DEFAULT_WORDS[0]
  }
  const index = Math.floor(Math.random() * words.length)
  return words[index]
}

function shuffle(array) {
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function normalizeLetter(letter) {
  return letter?.toLocaleUpperCase('fr-FR') ?? ''
}

function loadJSON(key, fallback = null) {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.error('loadJSON error', error)
    return fallback
  }
}

function saveJSON(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}


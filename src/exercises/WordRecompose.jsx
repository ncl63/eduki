import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadJSON, saveJSON, shuffle, randomPick } from '../utils/storage.js'

const SETTINGS_KEY = 'settings_words_v1'

export const DEFAULT_WORDS = ['MATIJA', 'LAPIN', 'CAROTTE', 'ECUREUIL', 'PLUMES']

// Calcule des tailles adaptées à la longueur du mot pour éviter le retour à la ligne
function computeSizes(letterCount) {
  // Facteur de réduction progressif pour les mots longs
  const base = Math.min(1, 5 / Math.max(letterCount, 1))
  const factor = Math.max(0.45, base)

  return {
    // Tailles des emplacements (slots)
    slotMin: `clamp(${(4.5 * factor).toFixed(1)}rem, ${(12 * factor).toFixed(0)}vw, 9rem)`,
    slotHeight: `clamp(${(5 * factor).toFixed(1)}rem, ${(14 * factor).toFixed(0)}vw, 10rem)`,
    slotFont: `clamp(${(2.5 * factor).toFixed(1)}rem, ${(10 * factor).toFixed(0)}vw, 5rem)`,
    slotPadX: `clamp(${(0.5 * factor).toFixed(1)}rem, ${(2 * factor).toFixed(0)}vw, 1.5rem)`,
    slotPadY: `clamp(${(0.5 * factor).toFixed(1)}rem, ${(2 * factor).toFixed(0)}vw, 1.5rem)`,
    slotGap: `clamp(${(0.75 * factor).toFixed(2)}rem, ${(1.5 * factor).toFixed(1)}vw, 1.5rem)`,
    // Tailles des boutons de choix
    choiceMin: `clamp(${(5 * factor).toFixed(1)}rem, ${(15 * factor).toFixed(0)}vw, 11rem)`,
    choiceFont: `clamp(${(3 * factor).toFixed(1)}rem, ${(8 * factor).toFixed(0)}vw, 5.5rem)`,
    choicePadX: `clamp(${(1.75 * factor).toFixed(2)}rem, ${(6 * factor).toFixed(0)}vw, 3.75rem)`,
    choicePadY: `clamp(${(1.25 * factor).toFixed(2)}rem, ${(5 * factor).toFixed(0)}vw, 3.25rem)`,
    choiceGap: `clamp(${(0.75 * factor).toFixed(2)}rem, ${(1.5 * factor).toFixed(1)}vw, 1.5rem)`,
    // Taille du mot en en-tête
    headerFont: `clamp(32px, ${(8 * factor).toFixed(0)}vw, 112px)`,
    headerGap: `clamp(${(0.25 * factor).toFixed(2)}rem, ${(0.75 * factor).toFixed(1)}vw, 0.75rem)`,
  }
}

export default function WordRecompose({ meta }) {
  const [settings, setSettings] = useState(() => loadWordSettings())
  const [round, setRound] = useState(() => makeRound(settings))
  const [feedback, setFeedback] = useState(null)
  const timeoutsRef = useRef([])
  const sizes = useMemo(() => computeSizes(round.targetLetters.length), [round.targetLetters.length])

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
        <div className="w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ⬅️ Accueil
            </Link>
          </div>
          <div className="flex justify-center min-w-0">
            <div className="flex flex-nowrap justify-center overflow-x-auto min-w-0" style={{ gap: sizes.headerGap }}>
              {round.targetLetters.map((char, index) => {
                const filled = round.slots[index] != null
                return (
                  <span
                    key={`${char}-${index}`}
                    className={`font-bold leading-none text-center transition-colors ${
                      filled ? 'text-green-500' : 'text-indigo-900'
                    }`}
                    style={{ fontSize: sizes.headerFont }}
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

      <main className="flex-1 flex flex-col gap-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full flex-1 bg-white/90 rounded-3xl border border-indigo-100 shadow-inner p-6 flex flex-col items-center justify-center gap-6">
            <div className="w-full flex flex-nowrap justify-center" style={{ gap: sizes.slotGap }}>
              {round.targetLetters.map((char, index) => (
                <LetterSlot key={`${char}-${index}`} value={round.slots[index]} sizes={sizes} />
              ))}
            </div>

            {(() => {
              const initialRound = remainingSlots === round.targetLetters.length
              const message =
                feedback ??
                (remainingSlots === 0
                  ? 'Bravo !'
                  : initialRound
                  ? ''
                  : `Encore ${remainingSlots} lettre${remainingSlots > 1 ? 's' : ''} à placer.`)

              if (!message) {
                return null
              }

              return (
                <div className="text-base md:text-lg text-gray-600 text-center min-h-[1.5rem]">
                  {message}
                </div>
              )
            })()}
          </div>
        </div>

        <div className="w-full flex flex-wrap justify-center pb-6" style={{ gap: sizes.choiceGap }}>
          {round.pool.map((letter) => (
            <LetterChoice
              key={letter.id}
              letter={letter}
              sizes={sizes}
              onClick={() => handleLetterClick(letter.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

function LetterSlot({ value, sizes }) {
  const filled = value != null
  return (
    <div
      className={`rounded-2xl border-2 flex items-center justify-center font-semibold transition ${
        filled ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-white border-indigo-200 text-indigo-300'
      }`}
      style={{
        flex: `1 1 ${sizes.slotMin}`,
        minWidth: sizes.slotMin,
        minHeight: sizes.slotHeight,
        fontSize: sizes.slotFont,
        paddingInline: sizes.slotPadX,
        paddingBlock: sizes.slotPadY,
      }}
    >
      {filled ? value : ''}
    </div>
  )
}

function LetterChoice({ letter, sizes, onClick }) {
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
      className={`inline-flex items-center justify-center rounded-[3.75rem] border ${border} ${bg} ${text} shadow-lg font-bold leading-none transition select-none focus:outline-none focus:ring-4 ${ring} ${
        state === 'used' ? 'cursor-not-allowed' : 'hover:scale-[1.03]'
      }`}
      style={{
        minWidth: sizes.choiceMin,
        minHeight: sizes.choiceMin,
        paddingInline: sizes.choicePadX,
        paddingBlock: sizes.choicePadY,
        fontSize: sizes.choiceFont,
      }}
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
  return randomPick(words) ?? DEFAULT_WORDS[0]
}

function normalizeLetter(letter) {
  return letter?.toLocaleUpperCase('fr-FR') ?? ''
}


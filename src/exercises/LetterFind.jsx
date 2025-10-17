import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const SETTINGS_KEY = 'settings_letters_v1'
const STARS_KEY = 'cp_mvp_stars'
export const STAR_GOAL = 10
export const LETTER_STYLE_OPTIONS = ['baton', 'cursif', 'script', 'serif']
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const DEFAULT_SETTINGS = {
  targetLetter: 'A',
  distractorLetters: 'BCDGH',
  itemsCount: 12,
  targetRatio: 0.35,
  letterStyle: 'baton',
}

export default function LetterFind({ meta }) {
  const [settings, setSettings] = useState(() => loadLetterSettings())
  const [cards, setCards] = useState(() => makeScatterRound(settings))
  const [feedback, setFeedback] = useState(null)
  const [stars, setStars] = useState(() => loadStars())
  const timeoutRef = useRef(null)

  const remainingTargets = useMemo(
    () => cards.filter((card) => card.isTarget && card.state !== 'locked').length,
    [cards],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    saveLetterSettings(settings)
    setCards(makeScatterRound(settings))
    setFeedback(null)
  }, [settings])

  function refreshRound() {
    setCards(makeScatterRound(settings))
    setFeedback(null)
  }

  function handleCardClick(cardId) {
    setCards((previous) => {
      let changed = false
      const next = previous.map((card) => {
        if (card.id !== cardId) {
          return card
        }
        if (card.state === 'locked') {
          return card
        }
        changed = true
        if (card.isTarget) {
          return { ...card, state: 'locked', result: 'good' }
        }
        return { ...card, result: 'bad' }
      })

      if (!changed) {
        return previous
      }

      const clicked = next.find((card) => card.id === cardId)
      if (!clicked) {
        return next
      }

      if (clicked.isTarget) {
        const allFound = next.every((card) => !card.isTarget || card.state === 'locked')
        if (allFound) {
          const newStars = Math.min(STAR_GOAL, stars + 1)
          setStars(newStars)
          saveStars(newStars)
          setFeedback('Bravo ! ⭐')
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          timeoutRef.current = setTimeout(() => {
            refreshRound()
          }, 900)
        } else {
          setFeedback(null)
        }
        return next
      }

      setFeedback('Essaie encore.')
      setTimeout(() => {
        setCards((current) =>
          current.map((card) =>
            card.id === cardId && card.state !== 'locked' ? { ...card, result: null } : card,
          ),
        )
      }, 600)

      return next
    })
  }

  const progress = Math.min(1, stars / STAR_GOAL)
  const fontFamily = fontForStyle(settings.letterStyle)
  const targetLetter = settings.targetLetter

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6">
      <header className="w-full space-y-3">
        <div className="w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ⬅️ Accueil
            </Link>
          </div>
          <div className="flex justify-center">
            <span
              className="font-bold text-indigo-900 leading-none"
              style={{
                fontSize: 'clamp(48px, 12vw, 140px)',
                fontFamily,
              }}
            >
              {targetLetter}
            </span>
          </div>
          <div className="flex justify-end">
            <Link to="/settings/letters" className="text-sm text-gray-600 hover:underline">
              Réglages ⚙️
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all" 
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{meta?.titre ?? 'Trouve la lettre'}</span>
            <span>
              {stars} / {STAR_GOAL} ⭐
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 items-stretch overflow-hidden">
        <div
          className="relative flex-1 w-full bg-white/90 rounded-3xl border border-indigo-100 shadow-inner"
          style={{ minHeight: 'calc(100vh - 220px)' }}
        >
          {cards.map((card) => (
            <LetterCard
              key={card.id}
              card={card}
              letterStyle={fontFamily}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
        <div className="text-base md:text-lg text-gray-600 text-center">
          {feedback ? feedback : remainingTargets === 1 ? 'Encore 1 lettre à trouver.' : `Encore ${remainingTargets} lettres à trouver.`}
        </div>
      </main>
    </div>
  )
}

function LetterCard({ card, letterStyle, onClick }) {
  const { state, result, char } = card
  const locked = state === 'locked'
  let bg = 'bg-white'
  let border = 'border-indigo-200'
  let text = 'text-indigo-900'

  if (result === 'bad') {
    bg = 'bg-red-100'
    border = 'border-red-300'
    text = 'text-red-700'
  }

  if (result === 'good' || locked) {
    bg = 'bg-green-100'
    border = 'border-green-300'
    text = 'text-green-800'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`absolute px-8 py-6 rounded-[2.5rem] border ${border} ${bg} ${text} shadow-lg font-semibold text-5xl md:text-6xl leading-none -translate-x-1/2 -translate-y-1/2 transition select-none focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
        locked ? 'cursor-not-allowed' : 'hover:scale-110'
      }`}
      style={{
        left: `${card.x}%`,
        top: `${card.y}%`,
        fontFamily: letterStyle,
        minWidth: '6.5rem',
        minHeight: '6.5rem',
      }}
    >
      {char}
    </button>
  )
}

export function loadLetterSettings() {
  const stored = loadJSON(SETTINGS_KEY)
  if (!stored) {
    return DEFAULT_SETTINGS
  }
  return sanitizeSettings({ ...DEFAULT_SETTINGS, ...stored })
}

export function saveLetterSettings(nextSettings) {
  const sanitized = sanitizeSettings(nextSettings)
  saveJSON(SETTINGS_KEY, sanitized)
}

function loadStars() {
  const value = loadInt(STARS_KEY, 0)
  return clampInt(value, 0, STAR_GOAL)
}

function saveStars(value) {
  saveInt(STARS_KEY, clampInt(value, 0, STAR_GOAL))
}

export function sanitizeSettings(raw) {
  const initial = { ...DEFAULT_SETTINGS, ...(raw || {}) }
  const targetLetter = pickLetter(initial.targetLetter) ?? DEFAULT_SETTINGS.targetLetter
  const letterStyle = LETTER_STYLE_OPTIONS.includes(initial.letterStyle)
    ? initial.letterStyle
    : DEFAULT_SETTINGS.letterStyle

  const itemsCount = clampInt(Number(initial.itemsCount) || DEFAULT_SETTINGS.itemsCount, 8, 30)
  const targetRatio = clampRatio(Number(initial.targetRatio) || DEFAULT_SETTINGS.targetRatio, 0.1, 0.9)

  const sanitizedDistractors = buildDistractors(initial.distractorLetters, targetLetter)

  return {
    targetLetter,
    distractorLetters: sanitizedDistractors,
    itemsCount,
    targetRatio,
    letterStyle,
  }
}

function buildDistractors(value, targetLetter) {
  const cleaned = (value ?? '')
    .toString()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .filter((letter) => letter !== targetLetter)

  const unique = Array.from(new Set(cleaned))
  if (unique.length > 0) {
    return unique.join('')
  }
  return ALPHABET.replace(targetLetter, '')
}

function pickLetter(value) {
  if (!value) {
    return null
  }
  const upper = value.toString().toUpperCase().replace(/[^A-Z]/g, '')
  return upper ? upper[0] : null
}

function makeScatterRound(inputSettings) {
  const settings = sanitizeSettings(inputSettings)
  const count = settings.itemsCount
  const targetCount = clampInt(Math.round(count * settings.targetRatio), 1, count - 1)
  const points = placePointsNoOverlap(count, {
    minDistPercent: computeMinDistPercent(count),
    maxAttempts: 2500,
  })

  const distractorPool = settings.distractorLetters.split('')
  const fallbackPool = ALPHABET.split('').filter((letter) => letter !== settings.targetLetter)

  const letters = []
  for (let i = 0; i < targetCount; i += 1) {
    letters.push({ char: settings.targetLetter, isTarget: true })
  }

  for (let i = targetCount; i < count; i += 1) {
    const source = distractorPool.length > 0 ? distractorPool : fallbackPool
    const selected = randomPick(source) ?? fallbackPool[0]
    letters.push({ char: selected, isTarget: false })
  }

  shuffle(letters)

  return letters.map((entry, index) => ({
    id: `${entry.char}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    char: entry.char,
    isTarget: entry.isTarget,
    state: 'idle',
    result: null,
    x: points[index]?.x ?? randFloat(10, 90),
    y: points[index]?.y ?? randFloat(10, 90),
  }))
}

export function computeMinDistPercent(count) {
  if (count <= 10) return 22
  if (count <= 14) return 18
  if (count <= 18) return 15
  if (count <= 22) return 13
  if (count <= 26) return 11
  return 9
}

function placePointsNoOverlap(count, { minDistPercent, maxAttempts = 2000 }) {
  const result = []
  let attempts = 0
  let currentMin = minDistPercent
  const margin = 8

  while (result.length < count && attempts < maxAttempts) {
    const x = randFloat(margin, 100 - margin)
    const y = randFloat(margin, 100 - margin)
    const fits = result.every((point) => dist(point, { x, y }) >= currentMin)
    if (fits) {
      result.push({ x, y })
    }
    attempts += 1
    if (attempts % 200 === 0) {
      currentMin = Math.max(6, currentMin * 0.92)
    }
  }

  while (result.length < count) {
    result.push({ x: randFloat(10, 90), y: randFloat(10, 90) })
  }

  return result
}

export function fontForStyle(style) {
  switch (style) {
    case 'cursif':
      return '"Comic Sans MS", "Comic Neue", cursive'
    case 'script':
      return '"Pacifico", "Brush Script MT", cursive'
    case 'serif':
      return '"Georgia", "Times New Roman", serif'
    case 'baton':
    default:
      return '"Segoe UI", "Inter", sans-serif'
  }
}

function clampInt(value, min, max) {
  const n = Number.isFinite(value) ? Math.round(value) : Number(value) || 0
  return Math.min(max, Math.max(min, n))
}

function clampRatio(value, min, max) {
  const n = Number.isFinite(value) ? value : Number(value)
  const normalized = Number.isFinite(n) ? n : min
  return Math.min(max, Math.max(min, normalized))
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min
}

function randomPick(array) {
  if (!array || array.length === 0) {
    return undefined
  }
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
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

function loadInt(key, fallback = 0) {
  if (typeof window === 'undefined') {
    return fallback
  }
  const raw = window.localStorage.getItem(key)
  const value = raw == null ? NaN : Number.parseInt(raw, 10)
  return Number.isNaN(value) ? fallback : value
}

function saveInt(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(key, String(value))
}

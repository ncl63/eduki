import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadJSON, saveJSON, loadInt, saveInt, clampInt, clampRatio, randomPick, shuffleInPlace, shuffle } from '../utils/storage.js'
import { useExerciseTracking } from '../hooks/useExerciseTracking.js'
import { LETTER_STYLE_OPTIONS, DEFAULT_LETTER_STYLE, fontForStyle, formatLetterCase, sanitizeLetterStyle } from '../utils/fontStyle.js'

export { LETTER_STYLE_OPTIONS, fontForStyle }

const SETTINGS_KEY = 'settings_letters_v1'
const STARS_KEY = 'cp_mvp_stars'
export const STAR_GOAL = 10
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const DEFAULT_SETTINGS = {
  targetLetter: 'A',
  distractorLetters: 'BCDGH',
  itemsCount: 12,
  targetRatio: 0.35,
  letterStyle: DEFAULT_LETTER_STYLE,
}

export default function LetterFind({ meta }) {
  const [settings, setSettings] = useState(() => loadLetterSettings())
  const [cards, setCards] = useState(() => makeScatterRound(settings))
  const [feedback, setFeedback] = useState(null)
  const [stars, setStars] = useState(() => loadStars())
  const timeoutRef = useRef(null)
  const { startRound, recordError, completeRound } = useExerciseTracking('letter-find')

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

  useEffect(() => {
    saveLetterSettings(settings)
    setCards(makeScatterRound(settings))
    setFeedback(null)
  }, [settings])

  // Démarrer le suivi pour le premier tour
  useEffect(() => {
    startRound({ targetLetter: settings.targetLetter, totalCards: settings.itemsCount })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function refreshRound() {
    setCards(makeScatterRound(settings))
    setFeedback(null)
    startRound({ targetLetter: settings.targetLetter, totalCards: settings.itemsCount })
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
        recordError()
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
          completeRound()
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
    <div className="h-screen px-4 py-3 md:px-8 md:py-4 flex flex-col gap-3 overflow-hidden">
      <header className="w-full space-y-2 shrink-0">
        <div className="w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ⬅️ Accueil
            </Link>
          </div>
          <div className="flex justify-center items-baseline gap-3">
            {settings.letterStyle === 'mixte' ? (
              <>
                <span
                  className="font-bold text-indigo-900 leading-none"
                  style={{
                    fontSize: 'clamp(36px, 8vw, 90px)',
                    fontFamily: fontForStyle('baton'),
                  }}
                >
                  {formatLetterCase(targetLetter, 'baton')}
                </span>
                <span
                  className="text-gray-300 leading-none"
                  style={{ fontSize: 'clamp(14px, 3vw, 28px)' }}
                >
                  /
                </span>
                <span
                  className="font-bold text-indigo-900 leading-none"
                  style={{
                    fontSize: 'clamp(22px, 5vw, 56px)',
                    fontFamily: fontForStyle('script'),
                  }}
                >
                  {formatLetterCase(targetLetter, 'script')}
                </span>
              </>
            ) : (
              <span
                className="font-bold text-indigo-900 leading-none"
                style={{
                  fontSize: 'clamp(48px, 12vw, 140px)',
                  fontFamily,
                }}
              >
                {formatLetterCase(targetLetter, settings.letterStyle)}
              </span>
            )}
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

      <main className="flex-1 flex flex-col gap-2 items-stretch overflow-hidden min-h-0">
        <div
          className="relative flex-1 w-full bg-white/90 rounded-3xl border border-indigo-100 shadow-inner min-h-0"
        >
          {cards.map((card) => (
            <LetterCard
              key={card.id}
              card={card}
              fontFamily={fontFamily}
              letterStyle={settings.letterStyle}
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

function LetterCard({ card, fontFamily, letterStyle, onClick }) {
  const { state, result, char } = card
  const locked = state === 'locked'
  // En mode mixte, chaque carte a son propre style
  const effectiveStyle = card.cardStyle || letterStyle
  const effectiveFont = card.cardStyle ? fontForStyle(card.cardStyle) : fontFamily
  const isScript = effectiveStyle === 'script'
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
      className={`absolute rounded-[2.5rem] border ${border} ${bg} ${text} shadow-lg font-semibold -translate-x-1/2 -translate-y-1/2 transition select-none focus:outline-none focus:ring-4 focus:ring-indigo-200 flex items-center justify-center overflow-hidden ${
        locked ? 'cursor-not-allowed' : 'hover:scale-110'
      } ${isScript ? 'text-3xl md:text-4xl' : 'text-5xl md:text-6xl leading-none'}`}
      style={{
        left: `${card.x}%`,
        top: `${card.y}%`,
        fontFamily: effectiveFont,
        width: '6.5rem',
        height: '6.5rem',
        lineHeight: isScript ? 1.6 : undefined,
      }}
    >
      {formatLetterCase(char, effectiveStyle)}
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
  const letterStyle = sanitizeLetterStyle(initial.letterStyle)

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
    const selected = randomPick(source) ?? fallbackPool[0] ?? 'B'
    letters.push({ char: selected, isTarget: false })
  }

  shuffleInPlace(letters)

  // En mode mixte, alterner baton/script puis mélanger pour garantir les deux styles
  let cardStyles = null
  if (settings.letterStyle === 'mixte') {
    cardStyles = letters.map((_, i) => (i % 2 === 0 ? 'baton' : 'script'))
    cardStyles = shuffle(cardStyles)
  }

  return letters.map((entry, index) => ({
    id: `${entry.char}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    char: entry.char,
    isTarget: entry.isTarget,
    state: 'idle',
    result: null,
    x: points[index]?.x ?? randFloat(10, 90),
    y: points[index]?.y ?? randFloat(10, 90),
    cardStyle: cardStyles ? cardStyles[index] : null,
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

function placePointsNoOverlap(count, { minDistPercent, maxAttempts = 2500 }) {
  const result = []
  let attempts = 0
  let currentMin = minDistPercent
  let reductions = 0
  const maxReductions = 20
  const margin = 8

  while (result.length < count && attempts < maxAttempts) {
    const x = randFloat(margin, 100 - margin)
    const y = randFloat(margin, 100 - margin)
    const fits = result.every((point) => dist(point, { x, y }) >= currentMin)
    if (fits) {
      result.push({ x, y })
    }
    attempts += 1
    if (attempts % 200 === 0 && reductions < maxReductions) {
      currentMin = Math.max(4, currentMin * 0.85)
      reductions += 1
    }
  }

  while (result.length < count) {
    result.push({ x: randFloat(10, 90), y: randFloat(10, 90) })
  }

  return result
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

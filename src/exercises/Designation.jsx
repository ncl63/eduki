import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clampInt, loadJSON, randomPickAvoiding, saveJSON, shuffle } from '../utils/storage.js'

const SETTINGS_PREFIX = 'settings_designation_v1_'

export function getDefaultDesignationSettings(set) {
  return {
    activeItemIds: set.items.map((item) => item.id),
    choicesPerRound: Math.min(2, set.items.length),
  }
}

export function sanitizeDesignationSettings(raw, set) {
  const itemIds = new Set(set.items.map((item) => item.id))
  const requestedIds = Array.isArray(raw?.activeItemIds) ? raw.activeItemIds : []
  let activeItemIds = [...new Set(requestedIds)].filter((id) => itemIds.has(id))

  if (activeItemIds.length < 2) {
    activeItemIds = set.items.map((item) => item.id)
  }

  return {
    activeItemIds,
    choicesPerRound: clampInt(raw?.choicesPerRound, 2, Math.min(4, activeItemIds.length)),
  }
}

export function loadDesignationSettings(set) {
  const defaults = getDefaultDesignationSettings(set)
  return sanitizeDesignationSettings(loadJSON(`${SETTINGS_PREFIX}${set.id}`, defaults), set)
}

export function saveDesignationSettings(set, settings) {
  saveJSON(`${SETTINGS_PREFIX}${set.id}`, sanitizeDesignationSettings(settings, set))
}

function buildRound(set, settings, previousTargetId = null) {
  const activeItems = set.items.filter((item) => settings.activeItemIds.includes(item.id))
  const target = randomPickAvoiding(activeItems, previousTargetId
    ? activeItems.filter((item) => item.id === previousTargetId)
    : [])
  const distractors = shuffle(activeItems.filter((item) => item.id !== target.id))
    .slice(0, settings.choicesPerRound - 1)

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    target,
    options: shuffle([target, ...distractors]),
  }
}

export default function Designation({ meta, set }) {
  const [settings] = useState(() => loadDesignationSettings(set))
  const timeoutRef = useRef(null)
  const previousTargetRef = useRef(null)
  const audioRef = useRef(null)
  const [round, setRound] = useState(() => {
    const nextRound = buildRound(set, settings)
    previousTargetRef.current = nextRound.target.id
    return nextRound
  })
  const [choiceStates, setChoiceStates] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false)
  const [audioMessage, setAudioMessage] = useState('Touche le bouton pour entendre la consigne.')

  const playPrompt = useCallback((item) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (item.prompt.audioSrc) {
      const audio = new Audio(item.prompt.audioSrc)
      audioRef.current = audio
      audio.play()
        .then(() => setAudioMessage(null))
        .catch(() => setAudioMessage("Impossible de lire la consigne. Vérifie le volume de l'appareil."))
      return
    }

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setAudioMessage("La voix n'est pas disponible sur cet appareil.")
      return
    }

    const utterance = new SpeechSynthesisUtterance(item.prompt.speech ?? item.prompt.text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.78
    utterance.pitch = 1
    utterance.onerror = () => setAudioMessage("Impossible de lire la consigne. Vérifie le volume de l'appareil.")
    window.speechSynthesis.speak(utterance)
    setAudioMessage(null)
  }, [])

  useEffect(() => {
    if (!isAudioUnlocked) return undefined
    const playbackTimeout = setTimeout(() => playPrompt(round.target), 250)
    return () => clearTimeout(playbackTimeout)
  }, [isAudioUnlocked, playPrompt, round])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (audioRef.current) audioRef.current.pause()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const advanceRound = useCallback(() => {
    setChoiceStates({})
    setFeedback(null)
    const nextRound = buildRound(set, settings, previousTargetRef.current)
    previousTargetRef.current = nextRound.target.id
    setRound(nextRound)
  }, [set, settings])

  function handleChoice(item) {
    if (choiceStates[round.target.id] === 'success') return

    if (item.id === round.target.id) {
      setChoiceStates((previous) => ({ ...previous, [item.id]: 'success' }))
      setFeedback('Bravo !')
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(advanceRound, 1400)
      return
    }

    setChoiceStates((previous) => ({ ...previous, [item.id]: 'error' }))
    setFeedback('Essaie encore.')
  }

  function replayPrompt() {
    if (isAudioUnlocked) {
      playPrompt(round.target)
      return
    }
    setIsAudioUnlocked(true)
  }

  return (
    <div className="activity-page min-h-screen px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6">
      <header className="w-full space-y-4">
        <div className="grid w-full grid-cols-3 items-center">
          <Link to="/" className="text-sm ui-muted hover:underline">Accueil</Link>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs uppercase tracking-wide ui-muted">Écoute & désigne</p>
            <h1 className="text-2xl font-bold ui-ink">{meta?.titre ?? set.title}</h1>
          </div>
          <Link to={meta.settingsPath} className="justify-self-end text-sm ui-muted hover:underline">Réglages</Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={replayPrompt}
            aria-label="Écouter la consigne"
            className="w-20 h-20 rounded-full ui-primary text-white ui-shadow flex items-center justify-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 fill-current">
              <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zm-2.5-8v2.06a6.5 6.5 0 0 1 0 11.88V20a8.5 8.5 0 0 0 0-16z" />
            </svg>
          </button>
          <div className="max-w-md text-center text-sm ui-muted">
            <p>{set.instruction}</p>
            {audioMessage && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{audioMessage}</p>}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 items-stretch">
        <div className="flex-1 w-full rounded-3xl border ui-border ui-panel p-4 ui-shadow sm:p-6">
          <div className="grid h-full grid-cols-2 gap-4 sm:gap-6">
            {round.options.map((item) => (
              <button
                key={`${round.id}-${item.id}`}
                type="button"
                onClick={() => handleChoice(item)}
                aria-label={item.label}
                className={`min-h-[170px] rounded-3xl border-4 p-3 ui-shadow transition-all flex items-center justify-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 sm:min-h-[260px] sm:p-5 ${getButtonClasses(choiceStates[item.id])}`}
              >
                <img src={item.image.src} alt="" aria-hidden="true" className="h-24 w-24 object-contain sm:h-48 sm:w-48" />
              </button>
            ))}
          </div>
        </div>
        <div aria-live="polite" className="min-h-[1.75rem] text-center text-lg font-semibold ui-muted">{feedback}</div>
      </main>
    </div>
  )
}

function getButtonClasses(state) {
  switch (state) {
    case 'success': return 'ui-success-surface ui-success-border ui-success-ink'
    case 'error': return 'ui-error-surface ui-error-border ui-error-ink'
    default: return 'ui-surface ui-border-strong ui-ink hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-xl'
  }
}

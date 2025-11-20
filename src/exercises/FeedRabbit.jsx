import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ============================================================================
// CONSTANTES ET CONFIGURATION
// ============================================================================

const SETTINGS_KEY = 'settings_feed_rabbit_v1'

export const DEFAULT_RABBIT_SETTINGS = {
  enabledNumbers: [1, 2, 3], // Nombres de 1 à 3
  displayMode: 'both', // 'vocal', 'graphic', 'both'
  showDigit: false, // Afficher le chiffre ou non
  trialsPerSession: 10, // Nombre d'essais par session
  animationSpeed: 'normal', // 'normal' ou 'fast'
}

// ============================================================================
// GESTION DES SETTINGS (localStorage)
// ============================================================================

export function sanitizeRabbitSettings(settings) {
  const enabledNumbers = Array.isArray(settings?.enabledNumbers)
    ? settings.enabledNumbers.filter((n) => n >= 1 && n <= 3)
    : [1, 2, 3]

  const displayMode = ['vocal', 'graphic', 'both'].includes(settings?.displayMode)
    ? settings.displayMode
    : 'both'

  const showDigit = typeof settings?.showDigit === 'boolean' ? settings.showDigit : false

  const trialsPerSession = typeof settings?.trialsPerSession === 'number'
    ? Math.max(5, Math.min(20, Math.floor(settings.trialsPerSession)))
    : 10

  const animationSpeed = ['normal', 'fast'].includes(settings?.animationSpeed)
    ? settings.animationSpeed
    : 'normal'

  return {
    enabledNumbers: enabledNumbers.length > 0 ? enabledNumbers : [1, 2, 3],
    displayMode,
    showDigit,
    trialsPerSession,
    animationSpeed,
  }
}

export function loadRabbitSettings() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_RABBIT_SETTINGS }
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return sanitizeRabbitSettings({ ...DEFAULT_RABBIT_SETTINGS })
    }
    return sanitizeRabbitSettings(JSON.parse(stored))
  } catch {
    return sanitizeRabbitSettings({ ...DEFAULT_RABBIT_SETTINGS })
  }
}

export function saveRabbitSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitizeRabbitSettings(settings)))
  } catch {
    // ignore write errors
  }
}

// ============================================================================
// SYNTHÈSE VOCALE
// ============================================================================

function speak(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API non disponible')
    return
  }

  // Annuler toute synthèse en cours
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.9
  utterance.pitch = 1.1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}

// ============================================================================
// SONS
// ============================================================================

// Fonction pour jouer un son simple (bip)
function playSound(frequency, duration, type = 'sine') {
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) {
    return
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type
    gainNode.gain.value = 0.3

    oscillator.start()
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    console.warn('Erreur lors de la lecture du son:', error)
  }
}

function playCrunchSound() {
  // Son de croquage (fréquences rapides)
  playSound(200, 0.1, 'square')
  setTimeout(() => playSound(150, 0.1, 'square'), 100)
}

function playSuccessSound() {
  // Mélodie de succès
  playSound(523, 0.2, 'sine') // Do
  setTimeout(() => playSound(659, 0.2, 'sine'), 200) // Mi
  setTimeout(() => playSound(784, 0.3, 'sine'), 400) // Sol
}

function playErrorSound() {
  // Son d'erreur (descendant)
  playSound(300, 0.2, 'triangle')
  setTimeout(() => playSound(200, 0.3, 'triangle'), 200)
}

// ============================================================================
// GÉNÉRATION D'UN ROUND
// ============================================================================

function buildRound(settings) {
  const safeSettings = sanitizeRabbitSettings(settings)
  const enabledNumbers = safeSettings.enabledNumbers.length > 0
    ? safeSettings.enabledNumbers
    : [1, 2, 3]

  const targetNumber = enabledNumbers[Math.floor(Math.random() * enabledNumbers.length)]

  return {
    id: `round-${Date.now()}-${Math.random()}`,
    targetNumber,
  }
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FeedRabbit({ meta }) {
  const [settings] = useState(() => loadRabbitSettings())
  const [round, setRound] = useState(() => buildRound(settings))
  const [givenCarrots, setGivenCarrots] = useState(0)
  const [targetCarrotsStatus, setTargetCarrotsStatus] = useState([]) // Pour barrer les carottes de consigne
  const [rabbitState, setRabbitState] = useState('neutral') // 'neutral', 'eating', 'happy', 'full'
  const [feedback, setFeedback] = useState(null)
  const [trialCount, setTrialCount] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [availableCarrots, setAvailableCarrots] = useState([]) // Carottes draggables

  const dropZoneRef = useRef(null)
  const draggedCarrotRef = useRef(null)
  const timeoutRef = useRef(null)

  const animationDuration = settings.animationSpeed === 'fast' ? 1000 : 2000

  // Initialiser les carottes disponibles (6 carottes draggables)
  useEffect(() => {
    setAvailableCarrots([
      { id: 'c1', x: 0, y: 0 },
      { id: 'c2', x: 0, y: 0 },
      { id: 'c3', x: 0, y: 0 },
      { id: 'c4', x: 0, y: 0 },
      { id: 'c5', x: 0, y: 0 },
      { id: 'c6', x: 0, y: 0 },
    ])
  }, [])

  // Annoncer la consigne vocale au début du round
  useEffect(() => {
    if (settings.displayMode === 'vocal' || settings.displayMode === 'both') {
      const text = `Donne ${round.targetNumber} carotte${round.targetNumber > 1 ? 's' : ''} au lapin`
      setTimeout(() => speak(text), 500)
    }

    // Initialiser le statut des carottes de consigne
    setTargetCarrotsStatus(Array(round.targetNumber).fill(false))
  }, [round, settings.displayMode])

  // Fonction pour avancer au prochain round
  const advanceRound = useCallback(() => {
    setTrialCount((prev) => prev + 1)

    if (trialCount + 1 >= settings.trialsPerSession) {
      setSessionComplete(true)
      speak('Bravo ! La session est terminée !')
      return
    }

    setGivenCarrots(0)
    setTargetCarrotsStatus([])
    setRabbitState('neutral')
    setFeedback(null)
    setRound(buildRound(settings))
    setAvailableCarrots((prev) => prev.map((c) => ({ ...c, x: 0, y: 0 })))
  }, [settings, trialCount])

  // Fonction pour reset le round en cas d'erreur
  const resetRound = useCallback(() => {
    setGivenCarrots(0)
    setTargetCarrotsStatus(Array(round.targetNumber).fill(false))
    setRabbitState('neutral')
    setFeedback(null)
    setAvailableCarrots((prev) => prev.map((c) => ({ ...c, x: 0, y: 0 })))
  }, [round.targetNumber])

  // Fonction appelée quand une carotte est déposée dans la bouche du lapin
  const handleCarrotDropped = useCallback(() => {
    const newCount = givenCarrots + 1

    // Jouer le son de croquage
    playCrunchSound()

    // Animation "eating"
    setRabbitState('eating')
    setTimeout(() => setRabbitState('neutral'), 300)

    // Barrer une carotte de consigne
    setTargetCarrotsStatus((prev) => {
      const next = [...prev]
      const firstUnchecked = next.findIndex((status) => !status)
      if (firstUnchecked !== -1) {
        next[firstUnchecked] = true
      }
      return next
    })

    setGivenCarrots(newCount)

    // Vérifier si c'est le bon nombre
    if (newCount === round.targetNumber) {
      // Succès !
      setRabbitState('happy')
      setFeedback('Bravo !')
      playSuccessSound()

      const successText = `Bravo ! C'était bien ${round.targetNumber} carotte${round.targetNumber > 1 ? 's' : ''} !`
      setTimeout(() => speak(successText), 200)

      // Avancer après un délai
      timeoutRef.current = setTimeout(() => {
        advanceRound()
      }, animationDuration)
    } else if (newCount > round.targetNumber) {
      // Trop de carottes !
      setRabbitState('full')
      setFeedback(`Oh non, c'est trop !`)
      playErrorSound()

      const errorText = `Oh non, c'est trop ! On voulait ${round.targetNumber} carotte${round.targetNumber > 1 ? 's' : ''}. Recommence !`
      setTimeout(() => speak(errorText), 200)

      // Reset après un délai
      timeoutRef.current = setTimeout(() => {
        resetRound()
      }, animationDuration)
    }
  }, [givenCarrots, round.targetNumber, animationDuration, advanceRound, resetRound])

  // Gestion du drag & drop tactile
  const handleTouchStart = useCallback((e, carrotId) => {
    e.preventDefault()
    draggedCarrotRef.current = carrotId
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!draggedCarrotRef.current) return
    // Optionnel : visualiser le déplacement de la carotte
    e.preventDefault()
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      if (!draggedCarrotRef.current || !dropZoneRef.current) {
        draggedCarrotRef.current = null
        return
      }

      const touch = e.changedTouches[0]
      const dropZone = dropZoneRef.current.getBoundingClientRect()

      // Vérifier si le doigt est dans la zone de dépôt
      if (
        touch.clientX >= dropZone.left &&
        touch.clientX <= dropZone.right &&
        touch.clientY >= dropZone.top &&
        touch.clientY <= dropZone.bottom
      ) {
        handleCarrotDropped()
      }

      draggedCarrotRef.current = null
    },
    [handleCarrotDropped]
  )

  // Gestion du drag & drop souris (desktop)
  const handleMouseDown = useCallback((e, carrotId) => {
    draggedCarrotRef.current = carrotId
  }, [])

  const handleMouseUp = useCallback(
    (e) => {
      if (!draggedCarrotRef.current || !dropZoneRef.current) {
        draggedCarrotRef.current = null
        return
      }

      const dropZone = dropZoneRef.current.getBoundingClientRect()

      if (
        e.clientX >= dropZone.left &&
        e.clientX <= dropZone.right &&
        e.clientY >= dropZone.top &&
        e.clientY <= dropZone.bottom
      ) {
        handleCarrotDropped()
      }

      draggedCarrotRef.current = null
    },
    [handleCarrotDropped]
  )

  // Nettoyer les timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Si la session est terminée
  if (sessionComplete) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold text-green-600">Session terminée !</h1>
          <p className="text-xl text-gray-700">
            Matija a terminé {settings.trialsPerSession} exercices !
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-lg font-semibold hover:bg-indigo-500"
            >
              🏠 Accueil
            </Link>
            <button
              type="button"
              onClick={() => {
                setSessionComplete(false)
                setTrialCount(0)
                setRound(buildRound(settings))
                setGivenCarrots(0)
                setRabbitState('neutral')
                setFeedback(null)
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-2xl text-lg font-semibold hover:bg-green-500"
            >
              🔄 Recommencer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 flex flex-col gap-4">
      {/* HEADER */}
      <header className="w-full">
        <div className="w-full grid grid-cols-3 items-center">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ⬅️ Accueil
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">Numération 1-3</p>
            <h1 className="text-2xl font-bold text-indigo-900 text-center">
              {meta?.titre ?? 'Nourrir le lapin'}
            </h1>
          </div>
          <div className="flex justify-end">
            <Link to="/settings/feed-rabbit" className="text-sm text-gray-600 hover:underline">
              Réglages ⚙️
            </Link>
          </div>
        </div>
      </header>

      {/* COMPTEUR DE PROGRÈS */}
      <div className="text-center text-sm text-gray-600">
        Exercice {trialCount + 1} / {settings.trialsPerSession}
      </div>

      {/* ZONE DE CONSIGNE GRAPHIQUE */}
      {(settings.displayMode === 'graphic' || settings.displayMode === 'both') && (
        <div className="flex flex-col items-center gap-3 bg-amber-50/50 rounded-3xl p-4 border-2 border-amber-200">
          <p className="text-sm text-gray-700 font-semibold">
            {settings.showDigit && (
              <span className="text-3xl font-black text-amber-600 mr-2">{round.targetNumber}</span>
            )}
            Carottes à donner :
          </p>
          <div className="flex gap-4 items-center justify-center">
            {Array.from({ length: round.targetNumber }).map((_, index) => (
              <div
                key={index}
                className={`text-5xl transition-all duration-300 ${
                  targetCarrotsStatus[index] ? 'opacity-30 line-through' : ''
                }`}
              >
                🥕
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZONE CENTRALE : LAPIN */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* LAPIN */}
        <div className="relative">
          <div
            className={`text-9xl transition-all duration-300 ${
              rabbitState === 'happy' ? 'animate-bounce scale-110' : ''
            } ${rabbitState === 'eating' ? 'scale-95' : ''} ${rabbitState === 'full' ? 'scale-105' : ''}`}
          >
            {rabbitState === 'happy' && '😊🐰'}
            {rabbitState === 'full' && '😵🐰'}
            {(rabbitState === 'neutral' || rabbitState === 'eating') && '🐰'}
          </div>

          {/* ZONE DE DÉPÔT (bouche du lapin) */}
          <div
            ref={dropZoneRef}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-dashed border-amber-400 bg-amber-100/30 flex items-center justify-center"
          >
            <span className="text-3xl">👄</span>
          </div>
        </div>

        {/* FEEDBACK */}
        {feedback && (
          <div
            className={`text-2xl font-bold px-6 py-3 rounded-2xl ${
              rabbitState === 'happy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {feedback}
          </div>
        )}
      </main>

      {/* ZONE DES CAROTTES DRAGGABLES */}
      <footer className="bg-green-50/50 rounded-3xl p-6 border-2 border-green-200">
        <div className="flex gap-4 items-center justify-center flex-wrap">
          {availableCarrots.map((carrot) => (
            <div
              key={carrot.id}
              className="text-5xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform select-none"
              onTouchStart={(e) => handleTouchStart(e, carrot.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={(e) => handleMouseDown(e, carrot.id)}
              onMouseUp={handleMouseUp}
            >
              🥕
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 mt-3">
          Glisse les carottes dans la bouche du lapin 👆
        </p>
      </footer>
    </div>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_QUANTITY_SOUND_SETTINGS,
  DiceFace,
  loadQuantitySoundSettings,
  sanitizeQuantitySoundSettings,
  saveQuantitySoundSettings,
} from '../exercises/QuantitySound.jsx'

const MODE_OPTIONS = [
  {
    value: 'dice',
    title: 'Faces de dés',
    description: 'Associer le nombre entendu à une quantité de points.',
  },
  {
    value: 'digits',
    title: 'Chiffres numériques',
    description: 'Associer le nombre entendu au chiffre écrit.',
  },
]

export default function QuantitySoundSettings() {
  const [settings, setSettings] = useState(() => loadQuantitySoundSettings())

  function updateDisplayMode(displayMode) {
    const nextSettings = sanitizeQuantitySoundSettings({ ...settings, displayMode })
    setSettings(nextSettings)
    saveQuantitySoundSettings(nextSettings)
  }

  function resetDefaults() {
    const nextSettings = sanitizeQuantitySoundSettings(DEFAULT_QUANTITY_SOUND_SETTINGS)
    setSettings(nextSettings)
    saveQuantitySoundSettings(nextSettings)
  }

  return (
    <div className="settings-page min-h-screen p-6 md:p-10 space-y-6 ui-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 sm:grid sm:grid-cols-3">
        <Link to="/" className="text-sm ui-muted hover:underline">
          Accueil
        </Link>
        <h1 className="order-first w-full text-2xl font-bold text-center ui-ink sm:order-none sm:w-auto">
          Réglages – Écoute le nombre
        </h1>
        <Link to="/ex/quantity-sound" className="text-sm text-right ui-muted hover:underline">
          Retour au jeu
        </Link>
      </header>

      <section className="space-y-6">
        <div className="p-4 rounded-2xl border ui-border ui-note text-sm ui-ink">
          La voix prononce toujours un nombre de 1 à 6. Choisis la manière dont les réponses seront affichées.
        </div>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-lg font-semibold ui-ink">
            Affichage des réponses
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => {
              const selected = settings.displayMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => updateDisplayMode(option.value)}
                  className={`rounded-3xl border-4 p-5 text-left transition focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 ${
                    selected
                      ? 'ui-primary-border ui-selected-soft ui-shadow'
                      : 'ui-border ui-surface hover:border-indigo-300'
                  }`}
                >
                  <span className="flex min-h-32 items-center justify-center ui-ink">
                    {option.value === 'dice' ? (
                      <DiceFace quantity={5} className="w-24" />
                    ) : (
                      <span className="text-8xl font-black">5</span>
                    )}
                  </span>
                  <span className="mt-4 block text-lg font-semibold ui-ink">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm ui-muted">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2 rounded-xl border ui-border-strong ui-surface text-sm hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </section>
    </div>
  )
}

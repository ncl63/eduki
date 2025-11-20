import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_RABBIT_SETTINGS,
  loadRabbitSettings,
  sanitizeRabbitSettings,
  saveRabbitSettings,
} from '../exercises/FeedRabbit.jsx'

export default function FeedRabbitSettings() {
  const [settings, setSettings] = useState(() => loadRabbitSettings())

  function toggleNumber(number) {
    setSettings((previous) => {
      const enabled = new Set(previous.enabledNumbers)
      if (enabled.has(number)) {
        enabled.delete(number)
      } else {
        enabled.add(number)
      }
      const next = sanitizeRabbitSettings({
        ...previous,
        enabledNumbers: Array.from(enabled).sort(),
      })
      saveRabbitSettings(next)
      return next
    })
  }

  function updateDisplayMode(mode) {
    setSettings((previous) => {
      const next = sanitizeRabbitSettings({ ...previous, displayMode: mode })
      saveRabbitSettings(next)
      return next
    })
  }

  function toggleShowDigit() {
    setSettings((previous) => {
      const next = sanitizeRabbitSettings({ ...previous, showDigit: !previous.showDigit })
      saveRabbitSettings(next)
      return next
    })
  }

  function updateTrialsPerSession(count) {
    setSettings((previous) => {
      const next = sanitizeRabbitSettings({ ...previous, trialsPerSession: count })
      saveRabbitSettings(next)
      return next
    })
  }

  function updateAnimationSpeed(speed) {
    setSettings((previous) => {
      const next = sanitizeRabbitSettings({ ...previous, animationSpeed: speed })
      saveRabbitSettings(next)
      return next
    })
  }

  function resetDefaults() {
    const next = sanitizeRabbitSettings({ ...DEFAULT_RABBIT_SETTINGS })
    setSettings(next)
    saveRabbitSettings(next)
  }

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Nourrir le lapin</h1>
        <Link to="/ex/feed-rabbit" className="text-sm text-gray-600 hover:underline">
          Retour au jeu →
        </Link>
      </header>

      {/* INFO */}
      <section className="space-y-6">
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 text-sm text-indigo-900">
          Configure l'exercice "Nourrir le lapin" pour adapter la difficulté et le mode de présentation aux besoins de Matija. Les réglages sont sauvegardés automatiquement.
        </div>

        {/* PLAGE DE NOMBRES */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">📊 Plage de nombres à travailler</h2>
          <p className="text-sm text-gray-600">
            Sélectionne les nombres qui apparaîtront dans l'exercice.
          </p>
          <div className="flex gap-4">
            {[1, 2, 3].map((number) => {
              const enabled = settings.enabledNumbers.includes(number)
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => toggleNumber(number)}
                  className={`flex-1 rounded-2xl border-2 py-4 text-2xl font-bold transition ${
                    enabled
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                      : 'bg-white text-indigo-700 border-indigo-200'
                  }`}
                >
                  {number}
                </button>
              )
            })}
          </div>
          {settings.enabledNumbers.length === 0 && (
            <p className="text-xs text-red-600">⚠️ Sélectionne au moins un nombre.</p>
          )}
        </div>

        {/* MODE DE CONSIGNE */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">🔊 Mode de consigne</h2>
          <p className="text-sm text-gray-600">
            Choisis comment présenter la quantité à donner au lapin.
          </p>
          <div className="space-y-2">
            {[
              { value: 'vocal', label: 'Vocal seulement', description: 'Consigne uniquement vocale' },
              {
                value: 'graphic',
                label: 'Représentation graphique seulement',
                description: 'Affiche les carottes à donner visuellement',
              },
              {
                value: 'both',
                label: 'Vocal + Représentation graphique',
                description: 'Consigne vocale ET visuelle (recommandé)',
              },
            ].map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => updateDisplayMode(mode.value)}
                className={`w-full text-left rounded-xl border-2 p-3 transition ${
                  settings.displayMode === mode.value
                    ? 'bg-indigo-100 border-indigo-500'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      settings.displayMode === mode.value
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {settings.displayMode === mode.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{mode.label}</p>
                    <p className="text-xs text-gray-600">{mode.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AFFICHER LE CHIFFRE */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">🔢 Afficher le chiffre</h2>
          <p className="text-sm text-gray-600">
            Active cette option pour afficher le chiffre à côté de la représentation graphique.
          </p>
          <button
            type="button"
            onClick={toggleShowDigit}
            className={`w-full rounded-xl border-2 p-4 transition flex items-center justify-between ${
              settings.showDigit
                ? 'bg-indigo-100 border-indigo-500'
                : 'bg-white border-gray-200 hover:border-indigo-300'
            }`}
          >
            <span className="font-semibold text-gray-900">
              {settings.showDigit ? 'Chiffre affiché' : 'Chiffre masqué'}
            </span>
            <div
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showDigit ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.showDigit ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </div>
          </button>
        </div>

        {/* NOMBRE D'ESSAIS PAR SESSION */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">🎯 Nombre d'essais par session</h2>
          <p className="text-sm text-gray-600">
            Nombre d'exercices que Matija fera avant de voir l'écran de fin de session.
          </p>
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <span className="text-3xl font-bold text-indigo-600">{settings.trialsPerSession}</span>
              <span className="text-sm text-gray-600 ml-2">essais</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">5</span>
              <input
                type="range"
                min={5}
                max={20}
                value={settings.trialsPerSession}
                onChange={(e) => updateTrialsPerSession(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-xs text-gray-500">20</span>
            </div>
          </div>
        </div>

        {/* VITESSE DES ANIMATIONS */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">⚡ Vitesse des animations</h2>
          <p className="text-sm text-gray-600">
            Ajuste la vitesse des animations pour éviter la frustration si elles sont trop lentes.
          </p>
          <div className="flex gap-3">
            {[
              { value: 'normal', label: 'Normal', description: '2 secondes' },
              { value: 'fast', label: 'Rapide', description: '1 seconde' },
            ].map((speed) => (
              <button
                key={speed.value}
                type="button"
                onClick={() => updateAnimationSpeed(speed.value)}
                className={`flex-1 rounded-xl border-2 p-3 transition ${
                  settings.animationSpeed === speed.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                    : 'bg-white text-gray-900 border-indigo-200 hover:border-indigo-400'
                }`}
              >
                <p className="font-semibold">{speed.label}</p>
                <p className="text-xs opacity-80">{speed.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </section>
    </div>
  )
}

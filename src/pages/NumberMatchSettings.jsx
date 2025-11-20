import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_SETTINGS,
  loadNumberMatchSettings,
  sanitizeNumberMatchSettings,
  saveNumberMatchSettings,
} from '../exercises/NumberMatch.jsx';

export default function NumberMatchSettings() {
  const [settings, setSettings] = useState(() => loadNumberMatchSettings());

  function toggleNumber(number) {
    setSettings((previous) => {
      const enabled = new Set(previous.enabledNumbers);
      if (enabled.has(number)) {
        enabled.delete(number);
      } else {
        enabled.add(number);
      }
      const next = sanitizeNumberMatchSettings({
        ...previous,
        enabledNumbers: Array.from(enabled).sort(),
      });
      saveNumberMatchSettings(next);
      return next;
    });
  }

  function updateVisualStyle(style) {
    setSettings((previous) => {
      const next = sanitizeNumberMatchSettings({ ...previous, visualStyle: style });
      saveNumberMatchSettings(next);
      return next;
    });
  }

  function updateTrialsPerSession(count) {
    setSettings((previous) => {
      const next = sanitizeNumberMatchSettings({ ...previous, trialsPerSession: count });
      saveNumberMatchSettings(next);
      return next;
    });
  }

  function toggleVoice() {
    setSettings((previous) => {
      const next = sanitizeNumberMatchSettings({ ...previous, enableVoice: !previous.enableVoice });
      saveNumberMatchSettings(next);
      return next;
    });
  }

  function updateAnimationSpeed(speed) {
    setSettings((previous) => {
      const next = sanitizeNumberMatchSettings({ ...previous, animationSpeed: speed });
      saveNumberMatchSettings(next);
      return next;
    });
  }

  function resetDefaults() {
    const next = sanitizeNumberMatchSettings({ ...DEFAULT_SETTINGS });
    setSettings(next);
    saveNumberMatchSettings(next);
  }

  const visualStyles = [
    { value: 'apples', label: 'Pommes', emoji: '🍎' },
    { value: 'balls', label: 'Ballons', emoji: '⚽' },
    { value: 'stars', label: 'Étoiles', emoji: '⭐' },
    { value: 'hearts', label: 'Cœurs', emoji: '❤️' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ⬅️ Accueil
        </Link>
        <h1 className="text-2xl font-bold">Réglages – Correspondance de quantités</h1>
        <Link to="/ex/number-match" className="text-sm text-gray-600 hover:underline">
          Retour au jeu →
        </Link>
      </header>

      {/* INFO */}
      <section className="space-y-6">
        <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/60 text-sm text-purple-900">
          Configure l'exercice "Correspondance de quantités" pour adapter la difficulté et le style visuel. Les réglages sont sauvegardés automatiquement.
        </div>

        {/* PLAGE DE NOMBRES */}
        <div className="p-4 rounded-2xl border border-purple-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-purple-900">📊 Plage de nombres à travailler</h2>
          <p className="text-sm text-gray-600">
            Sélectionne les nombres qui apparaîtront dans l'exercice.
          </p>
          <div className="flex gap-4">
            {[1, 2, 3].map((number) => {
              const enabled = settings.enabledNumbers.includes(number);
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => toggleNumber(number)}
                  className={`flex-1 rounded-2xl border-2 py-4 text-2xl font-bold transition ${
                    enabled
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                      : 'bg-white text-purple-700 border-purple-200'
                  }`}
                >
                  {number}
                </button>
              );
            })}
          </div>
          {settings.enabledNumbers.length === 0 && (
            <p className="text-xs text-red-600">⚠️ Sélectionne au moins un nombre.</p>
          )}
        </div>

        {/* STYLE VISUEL */}
        <div className="p-4 rounded-2xl border border-purple-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-purple-900">🎨 Style visuel</h2>
          <p className="text-sm text-gray-600">
            Choisis les objets à utiliser pour représenter les quantités.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visualStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => updateVisualStyle(style.value)}
                className={`rounded-xl border-2 p-4 transition ${
                  settings.visualStyle === style.value
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                    : 'bg-white text-gray-900 border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="text-4xl mb-2">{style.emoji}</div>
                <p className="font-semibold text-sm">{style.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* CONSIGNE VOCALE */}
        <div className="p-4 rounded-2xl border border-purple-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-purple-900">🔊 Consigne vocale</h2>
          <p className="text-sm text-gray-600">
            Active cette option pour que l'exercice énonce la consigne à voix haute.
          </p>
          <button
            type="button"
            onClick={toggleVoice}
            className={`w-full rounded-xl border-2 p-4 transition flex items-center justify-between ${
              settings.enableVoice
                ? 'bg-purple-100 border-purple-500'
                : 'bg-white border-gray-200 hover:border-purple-300'
            }`}
          >
            <span className="font-semibold text-gray-900">
              {settings.enableVoice ? 'Consigne vocale activée' : 'Consigne vocale désactivée'}
            </span>
            <div
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.enableVoice ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.enableVoice ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </div>
          </button>
        </div>

        {/* NOMBRE D'ESSAIS PAR SESSION */}
        <div className="p-4 rounded-2xl border border-purple-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-purple-900">🎯 Nombre d'essais par session</h2>
          <p className="text-sm text-gray-600">
            Nombre d'exercices à faire avant de voir l'écran de fin de session.
          </p>
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">{settings.trialsPerSession}</span>
              <span className="text-sm text-gray-600 ml-2">essais</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">5</span>
              <input
                type="range"
                min={5}
                max={30}
                value={settings.trialsPerSession}
                onChange={(e) => updateTrialsPerSession(Number(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <span className="text-xs text-gray-500">30</span>
            </div>
          </div>
        </div>

        {/* VITESSE DES ANIMATIONS */}
        <div className="p-4 rounded-2xl border border-purple-100 bg-white space-y-3">
          <h2 className="text-lg font-semibold text-purple-900">⚡ Vitesse de transition</h2>
          <p className="text-sm text-gray-600">
            Ajuste la vitesse de passage entre les essais après une réponse.
          </p>
          <div className="flex gap-3">
            {[
              { value: 'slow', label: 'Lent', description: '2 secondes' },
              { value: 'normal', label: 'Normal', description: '1.6 secondes' },
              { value: 'fast', label: 'Rapide', description: '1.3 secondes' },
            ].map((speed) => (
              <button
                key={speed.value}
                type="button"
                onClick={() => updateAnimationSpeed(speed.value)}
                className={`flex-1 rounded-xl border-2 p-3 transition ${
                  settings.animationSpeed === speed.value
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                    : 'bg-white text-gray-900 border-purple-200 hover:border-purple-400'
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
  );
}

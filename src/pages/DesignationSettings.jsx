import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDesignationSet } from '../data/designationSets.js'
import {
  getDefaultDesignationSettings,
  loadDesignationSettings,
  sanitizeDesignationSettings,
  saveDesignationSettings,
} from '../exercises/Designation.jsx'

export default function DesignationSettings() {
  const { setId } = useParams()
  const set = getDesignationSet(setId)

  if (!set) {
    return <main className="shell-state"><h1>Lot de désignation introuvable</h1><Link to="/">Retour aux exercices</Link></main>
  }

  return <SettingsContent set={set} />
}

function SettingsContent({ set }) {
  const [settings, setSettings] = useState(() => loadDesignationSettings(set))

  function save(next) {
    const sanitized = sanitizeDesignationSettings(next, set)
    setSettings(sanitized)
    saveDesignationSettings(set, sanitized)
  }

  function toggleItem(id) {
    const isActive = settings.activeItemIds.includes(id)
    if (isActive && settings.activeItemIds.length <= 2) return
    save({
      ...settings,
      activeItemIds: isActive
        ? settings.activeItemIds.filter((itemId) => itemId !== id)
        : [...settings.activeItemIds, id],
    })
  }

  function resetDefaults() {
    save(getDefaultDesignationSettings(set))
  }

  return (
    <div className="settings-page min-h-screen p-6 md:p-10 space-y-6 ui-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 sm:grid sm:grid-cols-3">
        <Link to="/" className="text-sm ui-muted hover:underline">Accueil</Link>
        <h1 className="order-first w-full text-2xl font-bold text-center ui-ink sm:order-none sm:w-auto">Réglages – {set.title}</h1>
        <Link to="/ex/designation-shapes" className="text-sm text-right ui-muted hover:underline">Retour au jeu</Link>
      </header>

      <section className="space-y-7">
        <div className="p-4 rounded-2xl border ui-border ui-note text-sm ui-ink">
          Choisis les formes proposées et le nombre d’images affichées. Deux formes au minimum restent actives.
        </div>

        <div className="space-y-3">
          <label htmlFor="designation-choice-count" className="block text-lg font-semibold ui-ink">
            Nombre de choix ({settings.choicesPerRound})
          </label>
          <input
            id="designation-choice-count"
            type="range"
            min="2"
            max={Math.min(4, settings.activeItemIds.length)}
            value={settings.choicesPerRound}
            onChange={(event) => save({ ...settings, choicesPerRound: Number(event.target.value) })}
            className="w-full"
          />
          <p className="text-sm ui-muted">Commence par 2 choix, puis augmente progressivement la difficulté.</p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold ui-ink">Formes actives</legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {set.items.map((item) => {
              const selected = settings.activeItemIds.includes(item.id)
              const cannotRemove = selected && settings.activeItemIds.length <= 2
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  aria-disabled={cannotRemove}
                  onClick={() => toggleItem(item.id)}
                  className={`rounded-2xl border-4 p-4 text-center ${selected ? 'ui-primary-border ui-selected-soft' : 'ui-border ui-surface'}`}
                >
                  <img src={item.image.src} alt="" aria-hidden="true" className="mx-auto h-24 w-24 object-contain" />
                  <span className="mt-2 block font-semibold ui-ink">{item.label}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex justify-end">
          <button type="button" onClick={resetDefaults} className="px-4 py-2 rounded-xl border ui-border-strong ui-surface text-sm">Réinitialiser</button>
        </div>
      </section>
    </div>
  )
}

import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import EnTete from '../components/EnTete.jsx'
import { useProfile } from '../contexts/ProfileContext.jsx'
import { getResults, getResultsByExercise } from '../utils/tracking.js'
import { EXERCISES } from '../data/exercises.js'

// Icônes par exercice
const EXERCISE_ICONS = {
  'letter-find': '🔍',
  'letter-sound': '🔊',
  'word-recompose': '🧩',
  'number-match': '🔢',
}

export default function Suivi() {
  const { activeProfile, profiles } = useProfile()

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 bg-white dark:bg-gray-900 transition-colors">
      <EnTete />

      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
          Suivi des progrès
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Consulte les résultats et la progression pour chaque élève.
        </p>
      </section>

      {!activeProfile ? (
        <div className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-8 text-center space-y-3">
          <p className="text-lg text-amber-800 dark:text-amber-200">
            {profiles.length === 0
              ? 'Crée un profil pour commencer à suivre les progrès.'
              : 'Sélectionne un profil dans le menu en haut pour voir ses résultats.'}
          </p>
        </div>
      ) : (
        <SuiviContent profileId={activeProfile.id} profileName={activeProfile.name} profileEmoji={activeProfile.emoji} />
      )}
    </div>
  )
}

function SuiviContent({ profileId, profileName, profileEmoji }) {
  const allResults = useMemo(() => getResults(profileId), [profileId])

  const stats = useMemo(() => {
    if (allResults.length === 0) return null

    const totalRounds = allResults.length
    const totalSuccess = allResults.filter((r) => r.success).length
    const totalErrors = allResults.reduce((sum, r) => sum + r.errors, 0)
    const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0)
    const accuracy = totalRounds > 0 ? Math.round((totalSuccess / totalRounds) * 100) : 0
    const lastActivity = allResults[0]?.timestamp ?? null

    return { totalRounds, totalSuccess, totalErrors, totalDuration, accuracy, lastActivity }
  }, [allResults])

  if (!stats) {
    return (
      <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-8 text-center space-y-3">
        <p className="text-5xl">{profileEmoji}</p>
        <p className="text-lg text-indigo-800 dark:text-indigo-200">
          Aucune donnée pour <strong>{profileName}</strong>.
        </p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Les résultats apparaîtront ici après avoir fait des exercices.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Résumé global */}
      <section className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{profileEmoji}</span>
          <div>
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{profileName}</h2>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              Dernière activité : {formatDate(stats.lastActivity)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Tours joués" value={stats.totalRounds} />
          <StatCard label="Réussis" value={stats.totalSuccess} />
          <StatCard label="Précision" value={`${stats.accuracy}%`} accent />
          <StatCard label="Temps total" value={formatDuration(stats.totalDuration)} />
        </div>
      </section>

      {/* Stats par exercice */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Par exercice</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {EXERCISES.map((ex) => (
            <ExerciseCard key={ex.id} exerciseId={ex.id} titre={ex.titre} profileId={profileId} />
          ))}
        </div>
      </section>

      {/* Activité récente */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activité récente</h2>
        <RecentActivity results={allResults.slice(0, 20)} />
      </section>
    </div>
  )
}

function StatCard({ label, value, accent = false }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 p-4 text-center">
      <p className={`text-2xl font-bold ${accent ? 'text-green-600 dark:text-green-400' : 'text-indigo-900 dark:text-indigo-100'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function ExerciseCard({ exerciseId, titre, profileId }) {
  const results = useMemo(() => getResultsByExercise(profileId, exerciseId), [profileId, exerciseId])

  if (results.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5 flex items-center gap-4">
        <span className="text-3xl">{EXERCISE_ICONS[exerciseId] ?? '📝'}</span>
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">{titre}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">Pas encore joué</p>
        </div>
      </div>
    )
  }

  const totalRounds = results.length
  const successCount = results.filter((r) => r.success).length
  const accuracy = Math.round((successCount / totalRounds) * 100)
  const avgErrors = totalRounds > 0 ? (results.reduce((s, r) => s + r.errors, 0) / totalRounds).toFixed(1) : '0'
  const lastPlayed = results[0]?.timestamp

  // Barres de progression pour les 10 derniers tours
  const recentResults = results.slice(0, 10).reverse()

  return (
    <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{EXERCISE_ICONS[exerciseId] ?? '📝'}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">{titre}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalRounds} tour{totalRounds > 1 ? 's' : ''} — Dernier : {formatDate(lastPlayed)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{accuracy}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Précision</p>
        </div>
        <div>
          <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{successCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Réussis</p>
        </div>
        <div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{avgErrors}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Erreurs/tour</p>
        </div>
      </div>

      {/* Mini barres des 10 derniers tours */}
      <div className="flex items-end gap-1 h-8">
        {recentResults.map((r, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t transition-all ${
              r.success && r.errors === 0
                ? 'bg-green-400 dark:bg-green-500'
                : r.success
                  ? 'bg-amber-400 dark:bg-amber-500'
                  : 'bg-red-400 dark:bg-red-500'
            }`}
            style={{ height: `${Math.max(20, 100 - r.errors * 20)}%` }}
            title={`${r.success ? 'Réussi' : 'Échoué'} — ${r.errors} erreur${r.errors > 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">10 derniers tours</p>
    </div>
  )
}

function RecentActivity({ results }) {
  if (results.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente.</p>
  }

  return (
    <ul className="space-y-2">
      {results.map((r) => {
        const exercise = EXERCISES.find((ex) => ex.id === r.exerciseId)
        const icon = EXERCISE_ICONS[r.exerciseId] ?? '📝'
        return (
          <li
            key={r.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
          >
            <span className="text-xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {exercise?.titre ?? r.exerciseId}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(r.timestamp)} — {r.duration}s
                {r.details?.targetLetter && ` — Lettre : ${r.details.targetLetter}`}
                {r.details?.targetWord && ` — Mot : ${r.details.targetWord}`}
                {r.details?.targetNumber != null && ` — Nombre : ${r.details.targetNumber}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {r.errors > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                  {r.errors} err.
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                r.success
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}>
                {r.success ? 'Réussi' : 'Échoué'}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// Utilitaires de formatage
function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

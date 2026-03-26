import React from 'react'
import { Link } from 'react-router-dom'
import EnTete from '../components/EnTete.jsx'
import CarteExercice from '../components/CarteExercice.jsx'
import { EXERCISES } from '../data/exercises.js'
import { useProfile } from '../contexts/ProfileContext.jsx'

export default function Home() {
  const { activeProfile } = useProfile()

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 bg-white dark:bg-gray-900 transition-colors">
      <EnTete />

      {/* Bannière si aucun profil actif */}
      {!activeProfile && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
          Sélectionne ou crée un profil dans le menu en haut pour enregistrer les progrès.
        </div>
      )}

      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">Bibliothèque d'exercices</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Choisis un exercice pour t'entraîner et ajuste ses réglages.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Carte suivi des progrès */}
        <Link
          to="/suivi"
          className="group rounded-3xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100">Suivi des progrès</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                📊
              </span>
            </div>
            <p className="text-sm text-purple-800/80 dark:text-purple-300/80">
              Consulte les résultats, la précision et l'activité récente de chaque élève.
            </p>
          </div>
          <div className="mt-4 text-sm font-medium text-purple-700 dark:text-purple-400">
            <span className="underline-offset-2 group-hover:underline">Voir le tableau de bord →</span>
          </div>
        </Link>

        {EXERCISES.map((exercise) => (
          <CarteExercice key={exercise.id} {...exercise} />
        ))}
      </section>
    </div>
  )
}

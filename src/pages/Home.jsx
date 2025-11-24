import React from 'react'
import EnTete from '../components/EnTete.jsx'
import CarteExercice from '../components/CarteExercice.jsx'
import { EXERCISES } from '../data/exercises.js'

export default function Home() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 bg-white dark:bg-gray-900 transition-colors">
      <EnTete />
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">Bibliothèque d'exercices</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Choisis un exercice pour t'entraîner et ajuste ses réglages.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.map((exercise) => (
          <CarteExercice key={exercise.id} {...exercise} />
        ))}
      </section>
    </div>
  )
}

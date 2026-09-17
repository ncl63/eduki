import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { EXERCISES } from '../data/exercises.js'

// Chaque écran commence en haut, même après le choix d'une carte en bas de page.
export default function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const exercise = EXERCISES.find(item => pathname === `/ex/${item.id}` || pathname === item.settingsPath)
    const title = exercise
      ? `${pathname.startsWith('/settings/') ? 'Réglages — ' : ''}${exercise.titre}`
      : pathname === '/' ? 'Apprendre, simplement' : 'Page introuvable'
    document.title = `Grafokwest — ${title}`
  }, [pathname])
  return null
}

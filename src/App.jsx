import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './pages/Home.jsx'
import RouteEffects from './components/RouteEffects.jsx'
const ExerciseRunner = lazy(() => import('./pages/ExerciseRunner.jsx'))
const LettersSettings = lazy(() => import('./pages/LettersSettings.jsx'))
const LetterSoundSettings = lazy(() => import('./pages/LetterSoundSettings.jsx'))
const QuantitySoundSettings = lazy(() => import('./pages/QuantitySoundSettings.jsx'))
const WordRecomposeSettings = lazy(() => import('./pages/WordRecomposeSettings.jsx'))
export default function App() {
  return <ThemeProvider><HashRouter><RouteEffects /><ErrorBoundary><Suspense fallback={<main className="shell-state" role="status">Chargement de l’exercice…</main>}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/ex/:exerciseId" element={<ExerciseRunner />} />
    <Route path="/settings/letters" element={<LettersSettings />} />
    <Route path="/settings/letter-sound" element={<LetterSoundSettings />} />
    <Route path="/settings/quantity-sound" element={<QuantitySoundSettings />} />
    <Route path="/settings/words" element={<WordRecomposeSettings />} />
    <Route path="*" element={<main className="shell-state"><h1>Cette page n’existe pas.</h1><Link to="/">Retour aux exercices</Link></main>} />
  </Routes></Suspense></ErrorBoundary></HashRouter></ThemeProvider>
}

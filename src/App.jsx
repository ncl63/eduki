import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ExerciseRunner from './pages/ExerciseRunner.jsx'
import LettersSettings from './pages/LettersSettings.jsx'
import LetterSoundSettings from './pages/LetterSoundSettings.jsx'
import WordRecomposeSettings from './pages/WordRecomposeSettings.jsx'
import FeedRabbitSettings from './pages/FeedRabbitSettings.jsx'
import NumberMatchSettings from './pages/NumberMatchSettings.jsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ex/:exerciseId" element={<ExerciseRunner />} />
        <Route path="/settings/letters" element={<LettersSettings />} />
        <Route path="/settings/letter-sound" element={<LetterSoundSettings />} />
        <Route path="/settings/words" element={<WordRecomposeSettings />} />
        <Route path="/settings/feed-rabbit" element={<FeedRabbitSettings />} />
        <Route path="/settings/number-match" element={<NumberMatchSettings />} />
      </Routes>
    </BrowserRouter>
  )
}

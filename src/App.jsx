import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ExerciseRunner from './pages/ExerciseRunner.jsx'
import LettersSettings from './pages/LettersSettings.jsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ex/:exerciseId" element={<ExerciseRunner />} />
        <Route path="/settings/letters" element={<LettersSettings />} />
      </Routes>
    </BrowserRouter>
  )
}

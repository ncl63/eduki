import React from "react";
import LettersGame from "../games/letters/LettersGame.jsx";

// App wrapper (v2 scaffolding)
// For maintenant: on affiche uniquement le jeu des lettres.
// Plus tard: on ajoutera un router et un menu pour choisir d'autres exercices.
export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="px-4 py-3 border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-semibold">App CP – Exercices</h1>
        <p className="text-sm text-slate-500">Module actif : Trouve la lettre</p>
      </header>
      <main className="p-0">
        <LettersGame />
      </main>
    </div>
  );
}

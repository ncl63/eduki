import React, { useEffect, useState } from "react";

/**
 * APP CP – Jeu « Trouve la lettre » (V1 STABLE JS)
 * - Lettres dispersées (pas de superposition)
 * - Clic vert/rouge, victoire quand toutes les cibles sont trouvées
 * - Mode enseignant : lettre cible, style, nombre d’éléments
 */

const DEFAULT_SETTINGS = {
  dyslexicFont: false,
  highContrast: true,
  letterPool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  targetLetter: "U",
  letterStyle: "baton", // baton | cursif | script | serif
  itemsCount: 14,
  targetRatio: 0.4,
};

const STAR_GOAL = 10;

export default function App() {
  const [screen, setScreen] = useState("home"); // "home" | "letters" | "teacher"
  const [stars, setStars] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        stars={stars}
        onHome={() => setScreen("home")}
        onOpenTeacher={() => setScreen("teacher")}
      />

      <main className="flex-1 p-4">
        {screen === "home" && <Home onChoose={setScreen} />}
        {screen === "letters" && (
          <LettersGame
            settings={settings}
            onWin={() => setStars((s) => Math.min(STAR_GOAL, s + 1))}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "teacher" && (
          <Teacher
            settings={settings}
            onChange={setSettings}
            onBack={() => setScreen("home")}
          />
        )}
      </main>
    </div>
  );
}

function Header({ stars, onHome, onOpenTeacher }) {
  return (
    <div className="w-full border-b p-3 flex items-center gap-3">
      <button
        onClick={onHome}
        className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200"
      >
        🏠 Accueil
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">⭐ {stars}/{STAR_GOAL}</div>
      <button
        onClick={onOpenTeacher}
        className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200"
      >
        🔧
      </button>
    </div>
  );
}

function Home({ onChoose }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BigCard
        icon="🔎"
        title="Trouve la lettre"
        subtitle="Clique sur tous les exemplaires"
        onClick={() => onChoose("letters")}
      />
      <BigCard
        icon="🔧"
        title="Mode enseignant"
        subtitle="Régler le jeu"
        onClick={() => onChoose("teacher")}
      />
    </div>
  );
}

function BigCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl p-6 bg-gray-50 hover:bg-gray-100 shadow-sm text-left"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-2xl font-semibold mb-1">{title}</div>
      <div className="text-base text-gray-600">{subtitle}</div>
    </button>
  );
}

// ---------- Letters Game ----------
function LettersGame({ settings, onWin, onBack }) {
  const [cards, setCards] = useState(() => makeScatterRound(settings));
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setCards(makeScatterRound(settings));
  }, [settings]);

  function onCardClick(id) {
    setCards((cs) => {
      const copy = cs.map((c) => ({ ...c }));
      const idx = copy.findIndex((c) => c.id === id);
      if (idx === -1 || copy[idx].state === "locked") return copy;
      const ok = copy[idx].isTarget;
      copy[idx].state = "locked";
      copy[idx].result = ok ? "good" : "bad";

      const remaining = copy.filter((c) => c.isTarget && c.state !== "locked").length;
      if (ok && remaining === 0) {
        setFeedback("Bravo ! ⭐");
        onWin();
        setTimeout(() => {
          setFeedback(null);
          setCards(makeScatterRound(settings));
        }, 900);
      } else if (!ok) {
        setFeedback("Essaie encore");
        setTimeout(() => setFeedback(null), 600);
      }
      return copy;
    });
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <button
        onClick={onBack}
        className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 self-start"
      >
        ⬅️ Accueil
      </button>
      <div className="text-xl">
        Clique sur tous les{" "}
        <span className="text-blue-600">
          {settings.targetLetter.toUpperCase()} / {settings.targetLetter.toLowerCase()}
        </span>
      </div>
      <div className="relative w-full max-w-4xl h-[480px] bg-gray-50 rounded-3xl overflow-hidden border">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={
              "absolute select-none rounded-2xl border-2 p-4 text-3xl font-bold transition-colors " +
              (card.state === "locked" && card.result === "good"
                ? "bg-green-200 border-green-400"
                : card.state === "locked" && card.result === "bad"
                ? "bg-red-200 border-red-400"
                : "bg-white border-gray-200 hover:border-blue-300")
            }
            style={{
              left: card.x + "%",
              top: card.y + "%",
              transform: "translate(-50%, -50%)",
              fontFamily: fontForStyle(settings.letterStyle),
            }}
          >
            {card.char}
          </button>
        ))}
      </div>
      {feedback && <div className="text-xl font-semibold">{feedback}</div>}
    </div>
  );
}

function makeScatterRound(settings) {
  const total = clampInt(settings.itemsCount, 8, 20);
  const targetCount = Math.max(1, Math.round(total * settings.targetRatio));
  const distractorCount = total - targetCount;

  const target = settings.targetLetter;
  const targets = [target.toUpperCase(), target.toLowerCase()];

  const pool = settings.letterPool.filter(
    (l) => !targets.includes(l.toUpperCase()) && !targets.includes(l.toLowerCase())
  );

  const distractors = [];
  for (let i = 0; i < distractorCount; i++) distractors.push(randomPick(pool));

  const chars = [
    ...Array.from({ length: targetCount }, () => randomPick(targets)),
    ...distractors,
  ];

  const placed = [];
  let id = 1;
  for (const ch of chars) {
    let x = 0, y = 0, tries = 0;
    do {
      x = randFloat(10, 90);
      y = randFloat(10, 90);
      tries++;
    } while (tries < 40 && placed.some((p) => dist(p.x, p.y, x, y) < 12));
    placed.push({ id: id++, char: ch, x, y, isTarget: targets.includes(ch), state: "idle" });
  }
  return placed;
}

// ---------- Teacher Mode ----------
function Teacher({ settings, onChange, onBack }) {
  const [targetLetter, setTargetLetter] = useState(settings.targetLetter);
  const [letterStyle, setLetterStyle] = useState(settings.letterStyle);
  const [itemsCount, setItemsCount] = useState(settings.itemsCount);

  function save() {
    onChange({ ...settings, targetLetter, letterStyle, itemsCount });
    onBack();
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-3xl p-5 shadow-sm">
      <button
        onClick={onBack}
        className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 mb-4"
      >
        ⬅️
      </button>
      <h2 className="text-2xl font-semibold mb-4">Réglages enseignant</h2>

      <label className="grid gap-2 mb-4">
        <span className="text-sm font-medium">Lettre cible</span>
        <input
          value={targetLetter}
          onChange={(e) => setTargetLetter(e.target.value)}
          maxLength={1}
          className="rounded-2xl border p-3 w-24 text-center text-xl"
        />
      </label>

      <label className="grid gap-2 mb-4">
        <span className="text-sm font-medium">Style d’écriture</span>
        <select
          value={letterStyle}
          onChange={(e) => setLetterStyle(e.target.value)}
          className="rounded-2xl border p-3 w-56"
        >
          <option value="baton">bâton</option>
          <option value="cursif">cursif</option>
          <option value="script">script</option>
          <option value="serif">serif</option>
        </select>
      </label>

      <label className="grid gap-2 mb-4">
        <span className="text-sm font-medium">Nombre de lettres</span>
        <input
          type="number"
          min={8}
          max={20}
          value={itemsCount}
          onChange={(e) => setItemsCount(parseInt(e.target.value || "14", 10))}
          className="rounded-2xl border p-3 w-24"
        />
      </label>

      <button onClick={save} className="px-4 py-3 rounded-2xl bg-blue-600 text-white">
        Enregistrer
      </button>
    </div>
  );
}

// ---------- Helpers ----------
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clampInt(n, a, b) { return Math.max(a, Math.min(b, Math.round(n || 0))); }
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function dist(x1, y1, x2, y2) { const dx = x1 - x2, dy = y1 - y2; return Math.sqrt(dx*dx + dy*dy); }
function fontForStyle(style) {
  switch (style) {
    case "baton": return "system-ui, sans-serif";
    case "cursif": return "cursive";
    case "script": return '"Comic Sans MS", cursive';
    case "serif": return "Georgia, serif";
    default: return "system-ui, sans-serif";
  }
}
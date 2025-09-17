import React, { useEffect, useState } from "react";

/**
 * Version validée : Accueil → Jeu (dispersé, sans superposition) → Mode enseignant
 * - Lettres en MAJUSCULE uniquement
 * - Pas de scroll (zone fixe adaptée iPad)
 * - Réglages : lettre cible + lettres distractrices + items + ratio + style
 */

const DEFAULT_SETTINGS = {
  dyslexicFont: false,
  highContrast: true,
  targetLetter: "U",
  letterStyle: "baton", // baton | cursif | script | serif
  itemsCount: 14,
  targetRatio: 0.4,
  distractorLetters: "ABCDE",
};

const STAR_GOAL = 10;

export default function App() {
  const [screen, setScreen] = useState("home"); // "home" | "letters" | "teacher"
  const [stars, setStars] = useState(() => loadInt("cp_mvp_stars", 0));
  const [settings, setSettings] = useState(() => {
    const saved = loadJSON("cp_mvp_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  });

  useEffect(() => saveJSON("cp_mvp_settings", settings), [settings]);
  useEffect(() => saveStr("cp_mvp_stars", String(stars)), [stars]);

  return (
    <div
      className={
        "min-h-screen w-full flex flex-col items-center bg-white overflow-hidden " +
        (settings.highContrast ? "text-gray-900" : "text-gray-800")
      }
      style={{ fontFamily: settings.dyslexicFont ? "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" : undefined }}
    >
      <Header
        stars={stars}
        onHome={() => setScreen("home")}
        onOpenTeacher={() => setScreen("teacher")}
      />

      <main className="w-full max-w-5xl flex-1 p-4 md:p-6 overflow-hidden">
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

      <Footer
        highContrast={settings.highContrast}
        onToggleContrast={() =>
          setSettings((s) => ({ ...s, highContrast: !s.highContrast }))
        }
        onToggleDys={() =>
          setSettings((s) => ({ ...s, dyslexicFont: !s.dyslexicFont }))
        }
      />
    </div>
  );
}

function Header({ stars, onHome, onOpenTeacher }) {
  const pct = Math.min(100, Math.round((stars / STAR_GOAL) * 100));
  return (
    <div className="w-full border-b sticky top-0 bg-white/80 backdrop-blur z-10">
      <div className="max-w-5xl mx-auto flex items-center gap-3 p-3">
        <button onClick={onHome} className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-lg">
          🏠 Accueil
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 w-48" aria-label="Jauge d’étoiles">
          <span className="text-xl">⭐</span>
          <div
            className="h-3 flex-1 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={STAR_GOAL}
            aria-valuenow={stars}
          >
            <div className="h-full bg-yellow-400" style={{ width: pct + "%" }} />
          </div>
          <span className="text-sm w-10 text-right">{stars}/{STAR_GOAL}</span>
        </div>
        <button
          onClick={onOpenTeacher}
          className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-lg"
          aria-label="Mode enseignant"
        >
          🔧
        </button>
      </div>
    </div>
  );
}

function Home({ onChoose }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BigCard
        icon="🔎"
        title="Trouve la lettre"
        subtitle="Clique sur tous les exemplaires"
        onClick={() => onChoose("letters")}
      />
      <BigCard
        icon="🔧"
        title="Mode enseignant"
        subtitle="Régler l’app (lettres, style, etc.)"
        onClick={() => onChoose("teacher")}
      />
      <BigCard
        icon="✨"
        title="À venir"
        subtitle="Autres jeux"
        onClick={() => {}}
      />
    </div>
  );
}

function BigCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl p-6 md:p-8 bg-gray-50 hover:bg-gray-100 shadow-sm text-left focus:outline-none focus:ring-4 ring-blue-300"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-2xl font-semibold mb-1">{title}</div>
      <div className="text-base text-gray-600">{subtitle}</div>
    </button>
  );
}

// ---------- Jeu "Trouve la lettre" ----------
function LettersGame({ settings, onWin, onBack }) {
  const [cards, setCards] = useState(() => makeScatterRound(settings));
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setCards(makeScatterRound(settings));
  }, [settings.targetLetter, settings.letterStyle, settings.itemsCount, settings.targetRatio, settings.distractorLetters]);

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
    <div className="flex flex-col gap-4 items-center overflow-hidden">
      <div className="w-full flex items-center gap-2">
        <button onClick={onBack} className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200">
          ⬅️ Accueil
        </button>
        <div className="ml-auto text-sm text-gray-600">
          Cible : <strong>{settings.targetLetter}</strong>
        </div>
      </div>

      <div className="text-2xl md:text-3xl font-semibold">
        Clique sur tous les <span className="text-blue-600">{settings.targetLetter}</span>
      </div>

      <div className="relative w-full max-w-5xl h-[520px] md:h-[560px] bg-gray-50 rounded-3xl overflow-hidden border">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={
              "absolute select-none rounded-2xl border-2 p-4 md:p-6 text-4xl md:text-5xl font-bold shadow-sm transition-colors " +
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
            aria-label={card.char}
          >
            {card.char}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="text-xl font-semibold" aria-live="polite">
          {feedback}
        </div>
      )}
    </div>
  );
}

// placement sans superposition (adapté au nombre d'items)
function makeScatterRound(settings) {
  const total = clampInt(settings.itemsCount, 8, 24);
  const targetCount = Math.max(1, Math.round(total * clampRatio(settings.targetRatio)));
  let distractorCount = total - targetCount;

  const target = (settings.targetLetter || "U").toUpperCase();
  const targets = [target];

  let pool = (settings.distractorLetters || "ABCDE")
    .toUpperCase()
    .split("")
    .filter((l) => !targets.includes(l));
  if (pool.length === 0) distractorCount = 0;

  const distractors = [];
  for (let i = 0; i < distractorCount; i++) distractors.push(randomPick(pool));

  const chars = [...Array.from({ length: targetCount }, () => target), ...distractors];

  const minDist = computeMinDistPercent(chars.length);
  const points = placePointsNoOverlap(chars.length, { minDistPercent: minDist });

  const placed = [];
  let id = 1;
  for (let i = 0; i < chars.length; i++) {
    const { x, y } = points[i];
    const ch = chars[i];
    placed.push({ id: id++, char: ch.toUpperCase(), x, y, isTarget: ch === target, state: "idle" });
  }
  return placed;
}

function computeMinDistPercent(count) {
  const base = 22;
  const k = 0.35 * (count - 8);
  return Math.max(14, Math.min(22, Math.round(base - k)));
}
function placePointsNoOverlap(n, { minDistPercent = 18, maxAttempts = 8000 } = {}) {
  const accepted = [];
  let attempts = 0;
  let minD = minDistPercent;
  while (accepted.length < n && attempts < maxAttempts) {
    attempts++;
    const x = randFloat(10, 90);
    const y = randFloat(12, 88);
    const ok = accepted.every((p) => dist(p.x, p.y, x, y) >= minD);
    if (ok) accepted.push({ x, y });
    if (attempts % 1000 === 0 && accepted.length < n && minD > 12) minD -= 1;
  }
  while (accepted.length < n) {
    accepted.push({ x: randFloat(15, 85), y: randFloat(18, 82) });
  }
  return accepted;
}

// ---------- Mode enseignant ----------
function Teacher({ settings, onChange, onBack }) {
  const [targetLetter, setTargetLetter] = useState(settings.targetLetter || "U");
  const [distractorLetters, setDistractorLetters] = useState(settings.distractorLetters || "ABCDE");
  const [letterStyle, setLetterStyle] = useState(settings.letterStyle || "baton");
  const [itemsCount, setItemsCount] = useState(settings.itemsCount || 14);
  const [targetRatio, setTargetRatio] = useState(settings.targetRatio || 0.4);

  function save() {
    onChange({
      ...settings,
      targetLetter: (targetLetter || "U").slice(0, 1).toUpperCase(),
      distractorLetters: (distractorLetters || "").toUpperCase().replace(/[^A-Z]/g, ""),
      letterStyle,
      itemsCount: Math.max(8, Math.min(24, itemsCount || 14)),
      targetRatio: Math.max(0.1, Math.min(0.9, Number(targetRatio) || 0.4)),
    });
    onBack();
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-lg">
          ⬅️
        </button>
        <h2 className="text-2xl font-bold">Réglages enseignant</h2>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Lettres</h3>
        <label className="grid gap-1">
          <span className="text-sm">Lettre cible</span>
          <input
            value={targetLetter}
            onChange={(e) => setTargetLetter(e.target.value)}
            className="rounded-2xl border p-3 w-24 text-center text-xl"
            maxLength={1}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Lettres distractrices</span>
          <input
            value={distractorLetters}
            onChange={(e) => setDistractorLetters(e.target.value)}
            className="rounded-2xl border p-3 w-full text-xl"
          />
          <span className="text-xs text-gray-500">Exemples : ABCD ou BPRT (lettres autorisées en plus de la cible).</span>
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Paramètres visuels</h3>
        <label className="grid gap-1">
          <span className="text-sm">Style d’écriture</span>
          <select
            value={letterStyle}
            onChange={(e) => setLetterStyle(e.target.value)}
            className="rounded-2xl border p-3 w-56"
          >
            <option value="baton">bâton (sans-serif)</option>
            <option value="cursif">cursif (main)</option>
            <option value="script">script (arrondi)</option>
            <option value="serif">serif (Times/Georgia)</option>
          </select>
        </label>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <label className="grid gap-1">
          <span className="text-sm">Nombre de cartes</span>
          <input
            type="number"
            min={8}
            max={24}
            value={itemsCount}
            onChange={(e) => setItemsCount(parseInt(e.target.value || "14", 10))}
            className="rounded-2xl border p-3"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Proportion bonnes lettres</span>
          <input
            type="number"
            step={0.1}
            min={0.1}
            max={0.9}
            value={targetRatio}
            onChange={(e) => setTargetRatio(parseFloat(e.target.value || "0.4"))}
            className="rounded-2xl border p-3"
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button onClick={save} className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg shadow">
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function Footer({ highContrast, onToggleContrast, onToggleDys }) {
  return (
    <footer className="w-full border-t bg-white/70">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-3 text-sm text-gray-600">
        <span>Astuce : sur iPad, ajoute à l’écran d’accueil pour le plein écran.</span>
        <div className="flex-1" />
        <button onClick={onToggleContrast} className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200">
          {highContrast ? "Contraste ++" : "Contraste +"}
        </button>
        <button onClick={onToggleDys} className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200">
          Police
        </button>
      </div>
    </footer>
  );
}

// ---------- Helpers ----------
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clampInt(n, a, b) { return Math.max(a, Math.min(b, Math.round(n || 0))); }
function clampRatio(r) { const n = Number(r); const val = Number.isFinite(n) ? n : 0.4; return Math.max(0.1, Math.min(0.9, val)); }
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function dist(x1, y1, x2, y2) { const dx = x1 - x2, dy = y1 - y2; return Math.sqrt(dx*dx + dy*dy); }
function fontForStyle(style) {
  switch (style) {
    case "baton": return 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    case "cursif": return 'cursive, system-ui';
    case "script": return '"Comic Sans MS", "Comic Sans", cursive, system-ui';
    case "serif": return 'Georgia, "Times New Roman", serif';
    default: return 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  }
}
function loadJSON(key){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }catch{ return null; } }
function loadInt(key, d){ try{ const v = localStorage.getItem(key); return v ? parseInt(v,10)||d : d; }catch{ return d; } }
function saveJSON(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
function saveStr(key, val){ try{ localStorage.setItem(key, String(val)); }catch{} }

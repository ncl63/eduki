export default function BarreRecherche({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Rechercher un exercice…"
      className="w-full rounded-xl border px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
      aria-label="Recherche d'exercices"
    />
  );
}

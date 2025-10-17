const NIVEAUX = ["Tous", "MS", "GS", "CP", "CE1", "CE2", "Cycle 2"];

export default function FiltreNiveau({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border px-3 py-2 bg-white shadow-sm"
      aria-label="Filtrer par niveau"
    >
      {NIVEAUX.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

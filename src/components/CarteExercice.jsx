import { Link } from "react-router-dom";

export default function CarteExercice({ id, titre, niveau, description }) {
  return (
    <div className="group rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">{titre}</h2>
          {niveau && (
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">
              {niveau}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-indigo-800/80 dark:text-indigo-300/80">{description}</p>
        )}
      </div>
      <div className="mt-4 text-sm font-medium text-indigo-700 dark:text-indigo-400">
        <Link to={`/ex/${id}`} className="underline-offset-2 hover:underline">
          Ouvrir →
        </Link>
      </div>
    </div>
  );
}

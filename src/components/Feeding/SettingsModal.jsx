import React, { useEffect, useState } from 'react'

const DEFAULT_FORM = {
  min: 1,
  max: 3,
  autoResetOnSuccess: true,
  autoResetDelayMs: 2500,
}

export default function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(settings ?? DEFAULT_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(settings ?? DEFAULT_FORM)
      setError('')
    }
  }, [isOpen, settings])

  if (!isOpen) {
    return null
  }

  const parseNumber = (value, fallback) =>
    Number.isNaN(value) ? fallback : value

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (Number(form.max) < Number(form.min)) {
      setError('Le maximum doit être ≥ au minimum.')
      return
    }

    onSave({
      min: Number(form.min),
      max: Number(form.max),
      autoResetOnSuccess: Boolean(form.autoResetOnSuccess),
      autoResetDelayMs: Number(form.autoResetDelayMs),
    })
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-xl font-semibold text-gray-900">
            Réglages
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
            aria-label="Fermer les réglages"
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Plage de carottes demandées
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Minimum
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={form.min}
                  onChange={(event) =>
                    handleChange(
                      'min',
                      parseNumber(event.target.valueAsNumber, 0),
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Maximum
                <input
                  type="number"
                  min={form.min}
                  max={20}
                  value={form.max}
                  onChange={(event) =>
                    handleChange(
                      'max',
                      parseNumber(event.target.valueAsNumber, form.min),
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(form.autoResetOnSuccess)}
                onChange={(event) =>
                  handleChange('autoResetOnSuccess', event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Auto-réinitialisation après succès
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Délai avant reset (ms)
              <input
                type="number"
                min={500}
                max={10000}
                step={100}
                value={form.autoResetDelayMs}
                onChange={(event) =>
                  handleChange(
                    'autoResetDelayMs',
                    parseNumber(event.target.valueAsNumber, 2500),
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          </div>

          {error && (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

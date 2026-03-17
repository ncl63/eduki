import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6 text-center">
          <h1 className="text-3xl font-bold text-red-600">Oups, quelque chose s'est mal passé.</h1>
          <p className="text-gray-600">Recharge la page ou retourne à l'accueil.</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500"
            >
              Recharger
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300"
            >
              Accueil
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

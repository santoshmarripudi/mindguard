import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)
    
    if (signInError) {
      setError(signInError.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 bg-white">
            <Shield className="h-8 w-8 text-teal-600" />
            <span className="ml-3 text-xl font-semibold text-gray-900">MindGuard</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="flex items-center px-2 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-md">
              <Shield className="mr-3 h-5 w-5 text-teal-500" />
              Home
            </div>
            <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md">
              <div className="mr-3 h-5 w-5 bg-gray-300 rounded"></div>
              Dashboard
            </div>
            <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md">
              <div className="mr-3 h-5 w-5 bg-gray-300 rounded"></div>
              Discussions
            </div>
            <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md">
              <div className="mr-3 h-5 w-5 bg-gray-300 rounded"></div>
              Notifications
            </div>
            <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md">
              <div className="mr-3 h-5 w-5 bg-gray-300 rounded"></div>
              Direct Messages
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white px-8 py-12 shadow-sm rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Login to MindGuard</h2>
              <p className="text-gray-500">Access your personalized wellness journey.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-3 bg-gray-50 border-0 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-3 bg-gray-50 border-0 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
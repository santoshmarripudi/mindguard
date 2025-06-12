import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signUpError } = await signUp(email, password, fullName)
    
    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white px-8 py-12 shadow-sm rounded-lg text-center">
            <Shield className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500 mb-6">
              Please check your email to verify your account before logging in.
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white px-8 py-12 shadow-sm rounded-lg">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Join MindGuard</h2>
            <p className="text-gray-500">Start your wellness journey today.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-3 py-3 bg-gray-50 border-0 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-200"
              />
            </div>

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
                minLength={6}
                className="w-full px-3 py-3 bg-gray-50 border-0 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
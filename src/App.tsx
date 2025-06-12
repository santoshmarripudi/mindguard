import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginForm } from './components/Auth/LoginForm'
import { SignupForm } from './components/Auth/SignupForm'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Discussions } from './pages/Discussions'
import { Notifications } from './pages/Notifications'
import { Messages } from './pages/Messages'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/home" replace />} />
      <Route path="/signup" element={!user ? <SignupForm /> : <Navigate to="/home" replace />} />
      
      <Route path="/home" element={
        <ProtectedRoute>
          <AppLayout>
            <Home />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/discussions" element={
        <ProtectedRoute>
          <AppLayout>
            <Discussions />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout>
            <Notifications />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <AppLayout>
            <Messages />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
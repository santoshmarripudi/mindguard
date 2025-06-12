import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu,
  X,
  Home, 
  LayoutDashboard, 
  MessageCircle, 
  Bell, 
  MessageSquare,
  Shield,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Discussions', href: '/discussions', icon: MessageCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Direct Messages', href: '/messages', icon: MessageSquare },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-teal-600" />
          <span className="ml-3 text-xl font-semibold text-gray-900">MindGuard</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white border-b border-gray-200">
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
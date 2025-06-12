import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
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

export function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <Shield className="h-8 w-8 text-teal-600" />
          <span className="ml-3 text-xl font-semibold text-gray-900">MindGuard</span>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
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
          </nav>
          <div className="px-2 pb-4">
            <button
              onClick={handleSignOut}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
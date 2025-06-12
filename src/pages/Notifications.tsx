import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, AlertCircle, MessageSquare, Heart, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchNotifications()
    
    // Create some sample notifications if none exist
    createSampleNotifications()
  }, [])

  const fetchNotifications = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
    } else {
      setNotifications(data || [])
    }
    setLoading(false)
  }

  const createSampleNotifications = async () => {
    if (!user) return

    // Check if user already has notifications
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existing && existing.length > 0) return

    // Create sample notifications
    const sampleNotifications = [
      {
        user_id: user.id,
        title: 'Welcome to MindGuard!',
        message: 'Thank you for joining our wellness community. Start by logging your first mood entry.',
        type: 'welcome',
        read: false,
      },
      {
        user_id: user.id,
        title: 'Daily Mood Reminder',
        message: 'Don\'t forget to log your mood today. Tracking consistently helps identify patterns.',
        type: 'reminder',
        read: false,
      },
      {
        user_id: user.id,
        title: 'New Discussion Activity',
        message: 'Someone replied to a discussion you\'re following about managing anxiety.',
        type: 'discussion',
        read: true,
      },
      {
        user_id: user.id,
        title: 'Weekly Progress Update',
        message: 'Your mood has improved by 15% this week compared to last week. Great progress!',
        type: 'progress',
        read: false,
      },
    ]

    await supabase
      .from('notifications')
      .insert(sampleNotifications)

    fetchNotifications()
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
    } else {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ))
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)

    if (error) {
      console.error('Error marking all notifications as read:', error)
    } else {
      setNotifications(notifications.map(notif => ({ ...notif, read: true })))
    }
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notification:', error)
    } else {
      setNotifications(notifications.filter(notif => notif.id !== id))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'discussion':
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 'progress':
        return <AlertCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            Stay updated with your wellness journey
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors duration-200"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'unread', 'read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as 'all' | 'unread' | 'read')}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                filter === tab
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-teal-100 text-teal-600 py-0.5 px-2 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-teal-600 transition-colors duration-200"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'No unread notifications'
                : filter === 'read' 
                ? 'No read notifications'
                : 'No notifications yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { Heart, Brain, Users, TrendingUp, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface MoodLog {
  id: string
  mood: number
  notes: string | null
  created_at: string
}

export function Home() {
  const { user } = useAuth()
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoodForm, setShowMoodForm] = useState(false)
  const [newMood, setNewMood] = useState(5)
  const [newNotes, setNewNotes] = useState('')

  useEffect(() => {
    fetchRecentMoods()
  }, [])

  const fetchRecentMoods = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching moods:', error)
    } else {
      setRecentMoods(data || [])
    }
    setLoading(false)
  }

  const handleAddMood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('mood_logs')
      .insert([
        {
          user_id: user.id,
          mood: newMood,
          notes: newNotes || null,
        },
      ])

    if (error) {
      console.error('Error adding mood:', error)
    } else {
      setNewMood(5)
      setNewNotes('')
      setShowMoodForm(false)
      fetchRecentMoods()
    }
  }

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢'
    if (mood <= 4) return '😟'
    if (mood <= 6) return '😐'
    if (mood <= 8) return '🙂'
    return '😊'
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return 'bg-red-100 text-red-800'
    if (mood <= 4) return 'bg-orange-100 text-orange-800'
    if (mood <= 6) return 'bg-yellow-100 text-yellow-800'
    if (mood <= 8) return 'bg-green-100 text-green-800'
    return 'bg-emerald-100 text-emerald-800'
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back to MindGuard!</h1>
        <p className="text-teal-100 text-lg">
          Your personal space for mental wellness and growth. How are you feeling today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Mood Logs</p>
              <p className="text-2xl font-semibold text-gray-900">{recentMoods.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Mindful Days</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Discussions</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <p className="text-2xl font-semibold text-gray-900">+15%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Mood Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Mood Logs</h2>
          <button
            onClick={() => setShowMoodForm(true)}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Mood
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentMoods.length > 0 ? (
            <div className="space-y-4">
              {recentMoods.map((mood) => (
                <div key={mood.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getMoodEmoji(mood.mood)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(mood.mood)}`}>
                        {mood.mood}/10
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(mood.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {mood.notes && (
                      <p className="text-sm text-gray-600 mt-1">{mood.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No mood logs yet. Start tracking your wellness journey!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mood Form Modal */}
      {showMoodForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Your Mood</h3>
            <form onSubmit={handleAddMood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling? ({newMood}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newMood}
                  onChange={(e) => setNewMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Sad</span>
                  <span>Neutral</span>
                  <span>Very Happy</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="How was your day? What affected your mood?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMoodForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200"
                >
                  Save Mood
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
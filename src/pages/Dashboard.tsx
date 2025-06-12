import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, Smile, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, subDays, parseISO } from 'date-fns'

interface MoodData {
  date: string
  mood: number
  notes?: string
}

interface WeeklyStats {
  week: string
  avgMood: number
  entries: number
}

export function Dashboard() {
  const { user } = useAuth()
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    if (!user) return

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const fromDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', fromDate)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching dashboard data:', error)
    } else {
      const formattedData = data.map(item => ({
        date: format(parseISO(item.created_at), 'MMM dd'),
        mood: item.mood,
        notes: item.notes
      }))
      setMoodData(formattedData)

      // Calculate weekly stats for the past 4 weeks
      const weeklyData = []
      for (let i = 3; i >= 0; i--) {
        const weekStart = subDays(new Date(), (i + 1) * 7)
        const weekEnd = subDays(new Date(), i * 7)
        const weekData = data.filter(item => {
          const itemDate = parseISO(item.created_at)
          return itemDate >= weekStart && itemDate < weekEnd
        })
        
        if (weekData.length > 0) {
          const avgMood = weekData.reduce((sum, item) => sum + item.mood, 0) / weekData.length
          weeklyData.push({
            week: `Week ${4 - i}`,
            avgMood: Math.round(avgMood * 10) / 10,
            entries: weekData.length
          })
        }
      }
      setWeeklyStats(weeklyData)
    }
    setLoading(false)
  }

  const getCurrentMoodStats = () => {
    if (moodData.length === 0) return { avg: 0, trend: 0, total: 0 }
    
    const avg = moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length
    const recent = moodData.slice(-7)
    const older = moodData.slice(-14, -7)
    
    let trend = 0
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((sum, item) => sum + item.mood, 0) / recent.length
      const olderAvg = older.reduce((sum, item) => sum + item.mood, 0) / older.length
      trend = ((recentAvg - olderAvg) / olderAvg) * 100
    }

    return {
      avg: Math.round(avg * 10) / 10,
      trend: Math.round(trend * 10) / 10,
      total: moodData.length
    }
  }

  const stats = getCurrentMoodStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your mental wellness journey</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Smile className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Average Mood</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avg}/10</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Trend</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.trend > 0 ? '+' : ''}{stats.trend}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Entries</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Streak</p>
              <p className="text-2xl font-semibold text-gray-900">5 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Timeline</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip 
                  formatter={(value, name) => [`${value}/10`, 'Mood']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No mood data available for the selected period
            </div>
          )}
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Comparison</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : weeklyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[1, 10]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'avgMood' ? `${value}/10` : value,
                    name === 'avgMood' ? 'Average Mood' : 'Entries'
                  ]}
                />
                <Bar dataKey="avgMood" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Not enough data for weekly comparison
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Insights & Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Consistency Matters</h4>
              <p className="text-blue-700 text-sm">
                Regular mood tracking helps identify patterns. Try to log your mood daily for better insights.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Positive Trend</h4>
              <p className="text-green-700 text-sm">
                {stats.trend > 0 
                  ? "Your mood has been improving recently. Keep up the great work!"
                  : "Consider what activities make you feel better and try to incorporate more of them."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
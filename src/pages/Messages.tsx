import React, { useState, useEffect } from 'react'
import { Send, Search, User, Circle, Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: {
    full_name: string | null
    email: string
  }
  receiver?: {
    full_name: string | null
    email: string
  }
}

interface Conversation {
  user_id: string
  user_name: string
  user_email: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_online: boolean
}

interface Profile {
  id: string
  email: string
  full_name: string | null
}

export function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  useEffect(() => {
    fetchConversations()
    createSampleData()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    if (userSearchTerm.length > 2) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [userSearchTerm])

  const createSampleData = async () => {
    if (!user) return

    // Check if user already has conversations
    const { data: existing } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', user.id)
      .limit(1)

    if (existing && existing.length > 0) return

    // Generate proper UUIDs for sample users
    const sampleUserIds = [
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID()
    ]

    // Create sample users and messages
    const sampleUsers = [
      { id: sampleUserIds[0], email: 'sarah.wellness@example.com', full_name: 'Sarah Chen' },
      { id: sampleUserIds[1], email: 'mike.mindful@example.com', full_name: 'Mike Johnson' },
      { id: sampleUserIds[2], email: 'emma.support@example.com', full_name: 'Emma Wilson' },
    ]

    // Insert sample profiles if they don't exist
    for (const sampleUser of sampleUsers) {
      await supabase
        .from('profiles')
        .upsert([sampleUser], { onConflict: 'id' })
    }

    // Create sample messages with proper UUIDs
    const sampleMessages = [
      {
        sender_id: sampleUserIds[0],
        receiver_id: user.id,
        content: 'Hi! I saw your discussion about managing stress. I found meditation really helpful. Would love to share some techniques that worked for me.',
        read: false,
      },
      {
        sender_id: user.id,
        receiver_id: sampleUserIds[0],
        content: 'That sounds great! I\'d love to learn more about your meditation practice.',
        read: true,
      },
      {
        sender_id: sampleUserIds[1],
        receiver_id: user.id,
        content: 'Hope you\'re doing well! How has your mood tracking been going lately?',
        read: false,
      },
      {
        sender_id: sampleUserIds[2],
        receiver_id: user.id,
        content: 'Welcome to MindGuard! I\'m here if you have any questions about the platform or need someone to talk to.',
        read: true,
      },
    ]

    await supabase
      .from('messages')
      .insert(sampleMessages)

    fetchConversations()
  }

  const fetchConversations = async () => {
    if (!user) return

    // Get unique conversations with latest message
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, email),
        receiver:profiles!messages_receiver_id_fkey(full_name, email)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
    } else {
      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>()
      
      data?.forEach((message) => {
        const isUserSender = message.sender_id === user.id
        const partnerId = isUserSender ? message.receiver_id : message.sender_id
        const partnerData = isUserSender ? message.receiver : message.sender
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user_id: partnerId,
            user_name: partnerData?.full_name || partnerData?.email || 'Unknown User',
            user_email: partnerData?.email || '',
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0,
            is_online: Math.random() > 0.5, // Simulate online status
          })
        }
        
        // Count unread messages (messages sent to current user that are unread)
        if (!isUserSender && !message.read) {
          const conv = conversationMap.get(partnerId)!
          conv.unread_count++
        }
      })

      setConversations(Array.from(conversationMap.values()))
    }
    setLoading(false)
  }

  const fetchMessages = async (partnerId: string) => {
    if (!user) return

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, email),
        receiver:profiles!messages_receiver_id_fkey(full_name, email)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('read', false)

      // Refresh conversations to update unread counts
      fetchConversations()
    }
  }

  const searchUsers = async () => {
    if (!user) return
    
    setSearchingUsers(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .neq('id', user.id)
      .or(`full_name.ilike.%${userSearchTerm}%,email.ilike.%${userSearchTerm}%`)
      .limit(10)

    if (error) {
      console.error('Error searching users:', error)
    } else {
      setSearchResults(data || [])
    }
    setSearchingUsers(false)
  }

  const startNewConversation = async (profile: Profile) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.user_id === profile.id)
    if (existingConv) {
      setSelectedConversation(profile.id)
      setShowNewChat(false)
      setUserSearchTerm('')
      return
    }

    // Create a new conversation by sending a welcome message
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user!.id,
          receiver_id: profile.id,
          content: 'Hi! I\'d like to connect with you.',
        },
      ])

    if (error) {
      console.error('Error starting conversation:', error)
    } else {
      setShowNewChat(false)
      setUserSearchTerm('')
      fetchConversations()
      setSelectedConversation(profile.id)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedConversation || !newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
        },
      ])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
      fetchMessages(selectedConversation)
      fetchConversations()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedConversationData = conversations.find(conv => conv.user_id === selectedConversation)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 text-teal-600 hover:bg-teal-50 rounded-md transition-colors duration-200"
              title="Start new conversation"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div>
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.user_id}
                  onClick={() => setSelectedConversation(conversation.user_id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 ${
                    selectedConversation === conversation.user_id ? 'bg-teal-50 border-r-2 border-teal-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      {conversation.is_online && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-400 fill-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.user_name}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-teal-600 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedConversationData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {selectedConversationData.is_online && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-400 fill-current" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversationData.user_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversationData.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-teal-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start New Conversation</h3>
              <button
                onClick={() => {
                  setShowNewChat(false)
                  setUserSearchTerm('')
                  setSearchResults([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Enter name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {searchingUsers && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => startNewConversation(profile)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {profile.full_name || profile.email}
                          </p>
                          {profile.full_name && (
                            <p className="text-xs text-gray-500">{profile.email}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {userSearchTerm.length > 2 && !searchingUsers && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No users found matching your search
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
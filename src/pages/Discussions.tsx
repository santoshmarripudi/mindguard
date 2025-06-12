import React, { useState, useEffect } from 'react'
import { MessageCircle, Heart, Plus, Search, User, ArrowLeft, ThumbsUp, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

interface Discussion {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
  replies_count: number
  upvotes_count: number
  user_upvoted: boolean
  profiles?: {
    full_name: string | null
    email: string
  }
}

interface Comment {
  id: string
  discussion_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: {
    full_name: string | null
    email: string
  }
}

export function Discussions() {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscussions()
    createSampleData()
  }, [])

  const createSampleData = async () => {
    if (!user) return

    // Check if discussions already exist
    const { data: existing } = await supabase
      .from('discussions')
      .select('id')
      .limit(1)

    if (existing && existing.length > 0) return

    // Create sample discussions
    const sampleDiscussions = [
      {
        user_id: user.id,
        title: 'Managing Anxiety in Daily Life',
        content: 'I\'ve been struggling with anxiety lately, especially in social situations. What techniques have worked for you? I\'ve tried breathing exercises but looking for more strategies.',
      },
      {
        user_id: user.id,
        title: 'The Power of Gratitude Journaling',
        content: 'Started keeping a gratitude journal last month and it\'s been amazing! Writing down 3 things I\'m grateful for each day has really shifted my perspective. Anyone else tried this?',
      },
    ]

    await supabase
      .from('discussions')
      .insert(sampleDiscussions)

    fetchDiscussions()
  }

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles!discussions_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching discussions:', error)
    } else {
      // Add mock upvote data for demonstration
      const discussionsWithUpvotes = (data || []).map(discussion => ({
        ...discussion,
        upvotes_count: Math.floor(Math.random() * 20) + 1,
        user_upvoted: Math.random() > 0.7,
      }))
      setDiscussions(discussionsWithUpvotes)
    }
    setLoading(false)
  }

  const fetchComments = async (discussionId: string) => {
    setCommentsLoading(true)
    
    // For now, create mock comments since we don't have a comments table
    const mockComments: Comment[] = [
      {
        id: '1',
        discussion_id: discussionId,
        user_id: user?.id || '',
        content: 'Great post! I\'ve found that mindfulness meditation really helps with anxiety. Even just 5 minutes a day can make a difference.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        profiles: {
          full_name: 'Sarah Chen',
          email: 'sarah@example.com'
        }
      },
      {
        id: '2',
        discussion_id: discussionId,
        user_id: 'other-user',
        content: 'Thanks for sharing this! I struggle with the same thing. Have you tried progressive muscle relaxation?',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        profiles: {
          full_name: 'Mike Johnson',
          email: 'mike@example.com'
        }
      },
    ]

    setComments(mockComments)
    setCommentsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTitle.trim() || !newContent.trim()) return

    setSubmitting(true)

    const { error } = await supabase
      .from('discussions')
      .insert([
        {
          user_id: user.id,
          title: newTitle.trim(),
          content: newContent.trim(),
        },
      ])

    if (error) {
      console.error('Error creating discussion:', error)
    } else {
      setNewTitle('')
      setNewContent('')
      setShowForm(false)
      fetchDiscussions()
      
      // Create notification for community
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            title: 'New Discussion Created',
            message: `You started a new discussion: "${newTitle.trim()}"`,
            type: 'discussion',
          },
        ])
    }

    setSubmitting(false)
  }

  const handleUpvote = async (discussionId: string) => {
    // Mock upvote functionality
    setDiscussions(discussions.map(discussion => {
      if (discussion.id === discussionId) {
        const newUpvoted = !discussion.user_upvoted
        return {
          ...discussion,
          user_upvoted: newUpvoted,
          upvotes_count: newUpvoted 
            ? discussion.upvotes_count + 1 
            : discussion.upvotes_count - 1
        }
      }
      return discussion
    }))

    if (selectedDiscussion && selectedDiscussion.id === discussionId) {
      const newUpvoted = !selectedDiscussion.user_upvoted
      setSelectedDiscussion({
        ...selectedDiscussion,
        user_upvoted: newUpvoted,
        upvotes_count: newUpvoted 
          ? selectedDiscussion.upvotes_count + 1 
          : selectedDiscussion.upvotes_count - 1
      })
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedDiscussion) return

    const mockComment: Comment = {
      id: Date.now().toString(),
      discussion_id: selectedDiscussion.id,
      user_id: user?.id || '',
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      profiles: {
        full_name: user?.user_metadata?.full_name || null,
        email: user?.email || ''
      }
    }

    setComments([...comments, mockComment])
    setNewComment('')

    // Update replies count
    const updatedDiscussion = {
      ...selectedDiscussion,
      replies_count: selectedDiscussion.replies_count + 1
    }
    setSelectedDiscussion(updatedDiscussion)
    
    setDiscussions(discussions.map(d => 
      d.id === selectedDiscussion.id ? updatedDiscussion : d
    ))
  }

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    fetchComments(discussion.id)
  }

  const closeDiscussion = () => {
    setSelectedDiscussion(null)
    setComments([])
    setNewComment('')
  }

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedDiscussion) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={closeDiscussion}
          className="flex items-center text-teal-600 hover:text-teal-700 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </button>

        {/* Discussion Detail */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedDiscussion.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-teal-600" />
                    </div>
                    <span>
                      {selectedDiscussion.profiles?.full_name || selectedDiscussion.profiles?.email || 'Anonymous'}
                    </span>
                  </div>
                  <span>
                    {formatDistanceToNow(new Date(selectedDiscussion.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedDiscussion.content}
              </p>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleUpvote(selectedDiscussion.id)}
                className={`flex items-center space-x-2 transition-colors duration-200 ${
                  selectedDiscussion.user_upvoted
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-teal-600'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${selectedDiscussion.user_upvoted ? 'fill-current' : ''}`} />
                <span>{selectedDiscussion.upvotes_count}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span>{selectedDiscussion.replies_count} replies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          </div>
          
          {/* Add Comment Form */}
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 transition-colors duration-200"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="p-6">
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discussions</h1>
          <p className="text-gray-500 mt-1">Connect with others on their wellness journey</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start Discussion
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Discussions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDiscussions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredDiscussions.map((discussion) => (
              <div key={discussion.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 
                        className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-teal-600 transition-colors duration-200"
                        onClick={() => openDiscussion(discussion)}
                      >
                        {discussion.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      by {discussion.profiles?.full_name || discussion.profiles?.email || 'Anonymous'}
                    </p>
                    <p 
                      className="text-gray-700 mb-3 line-clamp-3 cursor-pointer"
                      onClick={() => openDiscussion(discussion)}
                    >
                      {discussion.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleUpvote(discussion.id)}
                        className={`flex items-center space-x-1 transition-colors duration-200 ${
                          discussion.user_upvoted
                            ? 'text-teal-600'
                            : 'hover:text-teal-600'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${discussion.user_upvoted ? 'fill-current' : ''}`} />
                        <span>{discussion.upvotes_count}</span>
                      </button>
                      <button 
                        onClick={() => openDiscussion(discussion)}
                        className="flex items-center space-x-1 hover:text-teal-600 transition-colors duration-200"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{discussion.replies_count} replies</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-red-600 transition-colors duration-200">
                        <Heart className="h-4 w-4" />
                        <span>Like</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No discussions found matching your search.' : 'No discussions yet. Start the conversation!'}
            </p>
          </div>
        )}
      </div>

      {/* Create Discussion Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Start a New Discussion</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What would you like to discuss?"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or start a meaningful conversation..."
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim() || !newContent.trim()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 transition-colors duration-200"
                >
                  {submitting ? 'Creating...' : 'Create Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useRef } from "react"

import { createContext, useContext, useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { Heart, MessageSquare, Send, User, X, UserPlus, MessageCircle, Loader } from "lucide-react"

/**
 * Formats the number of likes for display
 */
function formatLikes(likes: number): string {
  return likes >= 1000 ? `${Math.floor(likes / 1000)} thousand` : likes.toString()
}

/**
 * Calculates relative time since a timestamp
 */
function timeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "Now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} d`
}

// Types
type CommentType = {
  id: number
  user: string
  text: string
  likes: number
  liked: boolean
}

type Post = {
  id: number
  user: string
  content: string
  likes: number
  liked: boolean
  comments: CommentType[]
  createdAt: number
}

type PrivateMessage = {
  id: number
  from: string
  to: string
  content: string
  createdAt: number
}

type FriendRequest = {
  id: number
  from: string
  to: string
  status: "pending" | "accepted" | "declined"
}

type AppContextType = {
  posts: Post[]
  privateMessages: PrivateMessage[]
  friendRequests: FriendRequest[]
  loading: boolean
  error: string | null
  toast: string | null
  setToast: (msg: string | null) => void
  createPost: (content: string) => void
  togglePostLike: (postId: number) => void
  addComment: (postId: number, commentText: string) => void
  likeComment: (postId: number, commentId: number) => void
  sendMessage: (to: string, content: string) => void
  sendFriendRequest: (to: string) => void
  respondFriendRequest: (requestId: number, response: "accepted" | "declined") => void
  actionLoading: { type: "post" | "comment" | "message" | "request" | null; id: number | null }
}

// Create context for global state management
const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * AppProvider component
 */
function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{
    type: "post" | "comment" | "message" | "request" | null
    id: number | null
  }>({ type: null, id: null })

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const initialPosts: Post[] = [
          {
            id: 1,
            user: "Alice",
            content: "My first post! Welcome to my timeline.",
            likes: 2,
            liked: false,
            createdAt: Date.now() - 1000 * 60 * 10,
            comments: [
              { id: 100, user: "Bob", text: "Great post!", likes: 0, liked: false },
              { id: 101, user: "Carol", text: "Welcome!", likes: 0, liked: false },
            ],
          },
          {
            id: 2,
            user: "John Doe",
            content: "Today is a fantastic day to code!",
            likes: 5,
            liked: false,
            createdAt: Date.now() - 1000 * 60 * 60 * 2,
            comments: [
              { id: 102, user: "Eve", text: "Absolutely!", likes: 0, liked: false },
              { id: 103, user: "Frank", text: "I need coffee to get started.", likes: 0, liked: false },
            ],
          },
        ]
        const initialMessages: PrivateMessage[] = [
          {
            id: 101,
            from: "Alice",
            to: "You",
            content: "Hi there!",
            createdAt: Date.now() - 60000,
          },
          {
            id: 102,
            from: "You",
            to: "Alice",
            content: "Hello, Alice!",
            createdAt: Date.now() - 30000,
          },
        ]
        setPosts(initialPosts)
        setPrivateMessages(initialMessages)
        setFriendRequests([])
        setLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data.")
        setLoading(false)
      }
    }, 1500)
  }, [])

  // Action handlers for posts
  const createPost = (content: string) => {
    const newPost: Post = {
      id: Date.now(),
      user: "You",
      content,
      likes: 0,
      liked: false,
      createdAt: Date.now(),
      comments: [],
    }
    setPosts((prev) => [newPost, ...prev])
    setToast("Post created successfully.")
  }

  const togglePostLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)),
    )
  }

  const addComment = (postId: number, commentText: string) => {
    const newComment: CommentType = {
      id: Date.now(),
      user: "You",
      text: commentText,
      likes: 0,
      liked: false,
    }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)))
    setToast("Comment added.")
  }

  const likeComment = (postId: number, commentId: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedComments = post.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                liked: !comment.liked,
                likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
              }
            }
            return comment
          })
          return { ...post, comments: updatedComments }
        }
        return post
      }),
    )
  }

  // Handle messages and friend requests
  const sendMessage = (to: string, content: string) => {
    const messageId = Date.now()
    setActionLoading({ type: "message", id: messageId })

    // Simulate API call
    setTimeout(() => {
      const newMessage: PrivateMessage = {
        id: messageId,
        from: "You",
        to,
        content,
        createdAt: Date.now(),
      }
      setPrivateMessages((prev) => [...prev, newMessage])
      setToast("Message sent.")
      setActionLoading({ type: null, id: null })
    }, 500)
  }

  const sendFriendRequest = (to: string) => {
    // Check if there's already any kind of request between these users
    const existingRequest = friendRequests.find(
      (req) => (req.from === "You" && req.to === to) || (req.from === to && req.to === "You"),
    )

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        setToast(`A request with ${to} is already ${existingRequest.from === "You" ? "sent" : "received"}.`)
      } else {
        setToast(
          `You are already ${existingRequest.status === "accepted" ? "friends with" : "not friends with"} ${to}.`,
        )
      }
      return
    }

    const newRequest: FriendRequest = {
      id: Date.now(),
      from: "You",
      to: to,
      status: "pending",
    }
    setFriendRequests((prev) => [...prev, newRequest])
    setToast("Friend request sent.")
  }

  const respondFriendRequest = (requestId: number, response: "accepted" | "declined") => {
    setFriendRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: response } : req)))
    setToast(`Friend request ${response}.`)
  }

  return (
    <AppContext.Provider
      value={{
        posts,
        privateMessages,
        friendRequests,
        loading,
        error,
        toast,
        setToast,
        createPost,
        togglePostLike,
        addComment,
        likeComment,
        sendMessage,
        sendFriendRequest,
        respondFriendRequest,
        actionLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

//to usehe context
function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within an AppProvider")
  return context
}

/**
 * PostCard component
 */
function PostCard({
  post,
  onToggleLike,
  onAddComment,
  onLikeComment,
}: {
  post: Post
  onToggleLike: () => void
  onAddComment: (commentText: string) => void
  onLikeComment: (commentId: number) => void
}) {
  const [commentInput, setCommentInput] = useState("")
  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault()
    onAddComment(commentInput)
    setCommentInput("")
  }
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100" aria-labelledby={`post-${post.id}-title`}>
      <div className="flex items-center space-x-3 mb-4">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-700 to-purple-800 flex items-center justify-center"
          aria-hidden="true"
        >
          <User size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold text-[#3A2E39]" id={`post-${post.id}-title`}>
          {post.user}
        </span>
      </div>
      <p className="text-xl text-[#3A2E39] mb-4">{post.content}</p>
      <div className="space-y-3 mb-4">
        {post.comments.map((com) => (
          <div key={com.id} className="flex items-start space-x-3 p-3 bg-gray-100 rounded-md">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-700 to-purple-800 flex items-center justify-center"
              aria-hidden="true"
            >
              <User size={16} className="text-white" />
            </div>
            <div className="flex flex-col flex-grow">
              <p className="text-sm font-semibold text-[#3A2E39]">{com.user}</p>
              <p className="text-sm text-gray-700">{com.text}</p>
              <div className="flex items-center space-x-1 mt-1">
                <button
                  onClick={() => onLikeComment(com.id)}
                  className="cursor-pointer rounded-full p-1 transition-colors duration-300 hover:bg-pink-600 hover:bg-opacity-20"
                  aria-label={com.liked ? "Unlike comment" : "Like comment"}
                  aria-pressed={com.liked}
                >
                  <Heart size={20} fill={com.liked ? "#F15152" : "none"} stroke="#F15152" />
                </button>
                <span className="text-xs text-gray-600">{formatLikes(com.likes)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleCommentSubmit} className="flex space-x-3 mb-4">
        <label htmlFor={`comment-input-${post.id}`} className="sr-only">
          Add a comment
        </label>
        <input
          id={`comment-input-${post.id}`}
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-[#3A2E39]"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg shadow-md hover:opacity-90 transition-all"
          aria-label="Submit comment"
        >
          <Send size={20} />
        </button>
      </form>
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleLike}
              className="cursor-pointer rounded-full p-1 transition-colors duration-300 hover:bg-pink-600 hover:bg-opacity-20"
              aria-label={post.liked ? "Unlike post" : "Like post"}
              aria-pressed={post.liked}
            >
              <Heart size={30} fill={post.liked ? "#F15152" : "none"} stroke="#F15152" />
            </button>
            <span className="text-sm text-[#3A2E39]">{formatLikes(post.likes)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle size={20} className="text-[#3A2E39]" aria-hidden="true" />
            <span className="text-sm text-[#3A2E39]">{post.comments.length} comments</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">{timeSince(post.createdAt)} ago</span>
      </div>
    </div>
  )
}

type MessagesPanelProps = {
  availableUsers: string[]
  onSendMessage: (to: string, content: string) => void
  onClose: () => void
}

/**
 * MessagesPanel component
 */
function MessagesPanel({ availableUsers, onSendMessage, onClose }: MessagesPanelProps) {
  const { privateMessages, actionLoading } = useAppContext()
  const [selectedRecipient, setSelectedRecipient] = useState(availableUsers.find((u) => u !== "You") || "")
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversation = privateMessages.filter(
    (msg) =>
      (msg.from === "You" && msg.to === selectedRecipient) || (msg.from === selectedRecipient && msg.to === "You"),
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    onSendMessage(selectedRecipient, messageInput)
    setMessageInput("")
  }

  return (
    <div className="flex flex-col h-full bg-white" role="dialog" aria-labelledby="messages-title">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 id="messages-title" className="text-xl font-bold text-indigo-700">
          Messages
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close messages panel"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-100">
        <label htmlFor="recipient-select" className="sr-only">
          Select recipient
        </label>
        <select
          id="recipient-select"
          className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          aria-label="Select message recipient"
        >
          {availableUsers
            .filter((u) => u !== "You")
            .map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" aria-live="polite">
        {conversation.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-2xl max-w-[80%] ${
                msg.from === "You"
                  ? "bg-gradient-to-r from-indigo-700 to-purple-800 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm break-words">{msg.content}</p>
              <span className={`text-xs block mt-1 ${msg.from === "You" ? "text-white/70" : "text-gray-500"}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex space-x-2">
          <label htmlFor="message-input" className="sr-only">
            Type your message
          </label>
          <input
            id="message-input"
            type="text"
            className="flex-1 p-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={actionLoading.type === "message"}
            className="p-3 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            aria-label="Send message"
          >
            {actionLoading.type === "message" ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  )
}

type FriendRequestsPanelProps = {
  availableUsers: string[]
  onSendFriendRequest: (to: string) => void
  onRespondFriendRequest: (requestId: number, response: "accepted" | "declined") => void
  onClose: () => void
}

/**
 * FriendRequestsPanel component
 * Manages sending and responding to friend requests
 */
function FriendRequestsPanel({
  availableUsers,
  onSendFriendRequest,
  onRespondFriendRequest,
  onClose,
}: FriendRequestsPanelProps) {
  const { friendRequests } = useAppContext()
  const sentRequests = friendRequests.filter((req) => req.from === "You")
  const receivedRequests = friendRequests.filter((req) => req.to === "You" && req.status === "pending")

  return (
    <div className="flex flex-col h-full bg-white p-4" role="dialog" aria-labelledby="friend-requests-title">
      <div className="flex justify-between items-center mb-4">
        <h2 id="friend-requests-title" className="text-xl font-bold text-indigo-700">
          Friend Requests
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close friend requests panel"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <h3 className="text-lg mb-2">Send Request</h3>
      <div className="space-y-2 mb-4">
        {availableUsers
          .filter((u) => u !== "You")
          .map((user) => {
            const request = sentRequests.find((r) => r.to === user)
            return (
              <div
                key={user}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
              >
                <span>{user}</span>
                {request ? (
                  <span className="text-gray-500 text-sm">
                    {request.status === "pending" ? "Pending" : request.status}
                  </span>
                ) : (
                  <button
                    onClick={() => onSendFriendRequest(user)}
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg shadow-md hover:opacity-90 transition-all"
                    aria-label={`Send friend request to ${user}`}
                  >
                    <UserPlus size={18} />
                  </button>
                )}
              </div>
            )
          })}
      </div>

      <h3 className="text-lg mb-2">Received</h3>
      <div className="space-y-2">
        {receivedRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No requests.</p>
        ) : (
          receivedRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
            >
              <span>{req.from}</span>
              <div className="space-x-2">
                <button
                  onClick={() => onRespondFriendRequest(req.id, "accepted")}
                  className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg shadow-md hover:opacity-90 transition-all"
                  aria-label={`Accept friend request from ${req.from}`}
                >
                  <UserPlus size={18} />
                </button>
                <button
                  onClick={() => onRespondFriendRequest(req.id, "declined")}
                  className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg shadow-md hover:opacity-90 transition-all"
                  aria-label={`Decline friend request from ${req.from}`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * LoadingSpinner component
 * Displays a loading animation
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader size={40} className="animate-spin text-violet-500 mb-4" aria-hidden="true" />
      <p className="text-lg text-gray-600">Loading content...</p>
    </div>
  )
}

/**
 * HomeContent component
 * Main content container for the social platform
 */
function HomeContent() {
  const {
    posts,
    loading,
    error,
    toast,
    setToast,
    createPost,
    togglePostLike,
    addComment,
    likeComment,
    sendMessage,
    sendFriendRequest,
    respondFriendRequest,
  } = useAppContext()

  const [newPostContent, setNewPostContent] = useState("")
  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false)
  const [isFriendRequestsOpen, setIsFriendRequestsOpen] = useState(false)

  const availableUsers = ["Alice", "Bob", "Carol", "John Doe", "Eve", "Frank"]

  const handleNewPostChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewPostContent(e.target.value)
  }

  const handleNewPostSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newPostContent.trim()) return
    createPost(newPostContent)
    setNewPostContent("")
  }

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, setToast])

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">Modern Social Platform</h1>
          <nav className="flex items-center space-x-6" aria-label="Main navigation">
            <a href="#" className="hidden md:block text-slate-300 hover:text-purple-400 transition-colors">
              Home
            </a>
            <a href="#" className="hidden md:block text-slate-300 hover:text-purple-400 transition-colors">
              Explore
            </a>
            <a href="#" className="hidden md:block text-slate-300 hover:text-purple-400 transition-colors">
              About
            </a>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsMessagesPanelOpen(!isMessagesPanelOpen)
                  setIsFriendRequestsOpen(false)
                }}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg shadow-md hover:opacity-90 transition-all"
                aria-label="Toggle messages panel"
                aria-expanded={isMessagesPanelOpen}
              >
                {isMessagesPanelOpen ? <X size={20} /> : <MessageSquare size={20} />}
              </button>
              <button
                onClick={() => {
                  setIsFriendRequestsOpen(!isFriendRequestsOpen)
                  setIsMessagesPanelOpen(false)
                }}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg shadow-md hover:opacity-90 transition-all"
                aria-label="Toggle friend requests panel"
                aria-expanded={isFriendRequestsOpen}
              >
                {isFriendRequestsOpen ? <X size={20} /> : <UserPlus size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-20 right-4 bg-gradient-to-r from-indigo-700 to-purple-800 text-white px-4 py-2 rounded-lg shadow-md transition-opacity z-50"
          role="alert"
          aria-live="assertive"
        >
          {toast}
        </div>
      )}

      {/* Main content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="flex items-center justify-center h-64" role="alert">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <main className="max-w-7xl mx-auto flex flex-col md:flex-row pt-8 px-4">
            {/* Sidebar - only visible on desktop */}
            <aside className="hidden md:block w-1/4 pr-6">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-[#3A2E39]">Profile</h2>
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-700 to-purple-800 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#3A2E39]">Your Name</p>
                    <p className="text-sm text-gray-500">@username</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-gray-100 rounded">
                    <p className="font-bold text-[#3A2E39]">120</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <p className="font-bold text-[#3A2E39]">1.5K</p>
                    <p className="text-xs text-gray-500">Friends</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#3A2E39]">Trending Topics</h2>
                <div className="space-y-3">
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <p className="font-medium text-[#3A2E39]">#WebDevelopment</p>
                    <p className="text-xs text-gray-500">1.2K posts</p>
                  </div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <p className="font-medium text-[#3A2E39]">#ReactJS</p>
                    <p className="text-xs text-gray-500">856 posts</p>
                  </div>
                  <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <p className="font-medium text-[#3A2E39]">#NextJS</p>
                    <p className="text-xs text-gray-500">643 posts</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="w-full md:w-3/4">
              <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-[#3A2E39]">Create a Post</h2>
                <form onSubmit={handleNewPostSubmit} className="space-y-4">
                  <label htmlFor="post-content" className="sr-only">
                    What&apos;s on your mind?
                  </label>
                  <textarea
                    id="post-content"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
                    rows={4}
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={handleNewPostChange}
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-all"
                    aria-label="Create post"
                  >
                    <Send size={20} className="mr-2" /> Post
                  </button>
                </form>
              </div>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onToggleLike={() => togglePostLike(post.id)}
                    onAddComment={(commentText) => addComment(post.id, commentText)}
                    onLikeComment={(commentId: number) => likeComment(post.id, commentId)}
                  />
                ))}
              </div>
            </div>
          </main>

          {/* Messages panel */}
          <div
            className={`fixed top-20 right-0 h-[calc(100vh-5rem)] w-full md:w-96 shadow-lg transform transition-transform duration-300 z-50 ${
              isMessagesPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <MessagesPanel
              availableUsers={availableUsers}
              onSendMessage={sendMessage}
              onClose={() => setIsMessagesPanelOpen(false)}
            />
          </div>

          {/* Friend requests panel */}
          <div
            className={`fixed top-20 right-0 h-[calc(100vh-5rem)] w-full md:w-96 shadow-2xl transform transition-transform duration-300 z-50 ${
              isFriendRequestsOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <FriendRequestsPanel
              availableUsers={availableUsers}
              onSendFriendRequest={sendFriendRequest}
              onRespondFriendRequest={respondFriendRequest}
              onClose={() => setIsFriendRequestsOpen(false)}
            />
          </div>

          {/* Footer */}
          <footer className="bg-slate-900 text-white mt-12 py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Modern Social</h3>
                  <p className="text-sm">
                    Connecting people around the world through shared interests and meaningful conversations.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Company</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Press
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Resources</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Community Guidelines
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Developers
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Legal</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Cookie Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm text-slate-300 hover:text-purple-400">
                        Accessibility
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                <p className="text-sm text-slate-300">
                  &copy; {new Date().getFullYear()} Modern Social Platform, Inc. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  )
}

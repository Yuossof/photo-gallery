
"use client"

import { useRef, memo, useEffect, useCallback } from "react"
import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react"
import { Heart, MessageSquare, Send, User, X, UserPlus, MessageCircle, Loader } from "lucide-react"

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

// Utility functions
const formatLikes = (likes: number) => (likes >= 1000 ? `${Math.floor(likes / 1000)}K` : likes.toString())
const timeSince = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "Now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} d`
}

// Common style classes
const buttonClass =
  "flex items-center justify-center px-4 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg shadow-sm hover:opacity-90 transition-all"
const cardClass = "bg-white rounded-xl shadow-sm p-6"
const gradientText = "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text"

// Context
const AppContext = createContext<AppContextType | undefined>(undefined)
const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within an AppProvider")
  return context
}

// Custom hooks
function useToast(duration = 3000) {
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), duration)
      return () => clearTimeout(timer)
    }
  }, [toast, duration])
  return { toast, setToast }
}

function useKeyboardNavigation(isOpen: boolean, closeHandler: () => void) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeHandler()
    }
    window.addEventListener("keydown", handleEscape as unknown as EventListener)
    return () => window.removeEventListener("keydown", handleEscape as unknown as EventListener)
  }, [isOpen, closeHandler])
}

// Components
const Comment = memo(({ comment, onLike }: { comment: CommentType; onLike: () => void }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-100 rounded-md">
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
      <User size={16} className="text-white" />
    </div>
    <div className="flex flex-col flex-grow">
      <p className="text-sm font-semibold text-[#3A2E39]">{comment.user}</p>
      <p className="text-sm text-gray-700">{comment.text}</p>
      <div className="flex items-center space-x-1 mt-1">
        <button
          onClick={onLike}
          className="cursor-pointer rounded-full p-1 transition-colors duration-300 hover:bg-pink-600 hover:bg-opacity-20"
          aria-label={comment.liked ? "Unlike comment" : "Like comment"}
          aria-pressed={comment.liked}
        >
          <Heart size={20} fill={comment.liked ? "#F15152" : "none"} stroke="#F15152" />
        </button>
        <span className="text-xs text-gray-600">{formatLikes(comment.likes)}</span>
      </div>
    </div>
  </div>
))

Comment.displayName = "Comment"

const CommentForm = memo(
  ({ postId, onAddComment }: { postId: number; onAddComment: (postId: number, text: string) => void }) => {
    const [commentInput, setCommentInput] = useState("")

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      if (!commentInput.trim()) return
      onAddComment(postId, commentInput)
      setCommentInput("")
    }

    return (
      <form onSubmit={handleSubmit} className="flex space-x-3 mb-4">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          required
        />
        <button type="submit" className={buttonClass}>
          <Send size={20} />
        </button>
      </form>
    )
  },
)

CommentForm.displayName = "CommentForm"

const PostCard = memo(
  ({
    post,
    onToggleLike,
    onAddComment,
    onLikeComment,
  }: {
    post: Post
    onToggleLike: () => void
    onAddComment: (postId: number, commentText: string) => void
    onLikeComment: (commentId: number) => void
  }) => (
    <div className={`${cardClass} border border-gray-100`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold text-[#3A2E39]">{post.user}</span>
      </div>
      <p className="text-xl text-[#3A2E39] mb-4">{post.content}</p>
      <div className="space-y-3 mb-4">
        {post.comments.map((comment) => (
          <Comment key={comment.id} comment={comment} onLike={() => onLikeComment(comment.id)} />
        ))}
      </div>

      <CommentForm postId={post.id} onAddComment={onAddComment} />

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
            <MessageCircle size={20} className="text-[#3A2E39]" />
            <span className="text-sm text-[#3A2E39]">{post.comments.length} comments</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">{timeSince(post.createdAt)} ago</span>
      </div>
    </div>
  ),
)

PostCard.displayName = "PostCard"

const CreatePostForm = memo(({ onSubmit }: { onSubmit: (content: string) => void }) => {
  const [content, setContent] = useState("")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit(content)
    setContent("")
  }

  return (
    <div className={`mb-6 ${cardClass}`}>
      <h2 className="text-2xl font-semibold mb-4 text-[#3A2E39]">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
          rows={4}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" className={`${buttonClass} w-full font-bold`}>
          <Send size={20} className="mr-2" /> Post
        </button>
      </form>
    </div>
  )
})

CreatePostForm.displayName = "CreatePostForm"

const Toast = memo(({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-20 right-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg shadow-sm z-50 flex items-center">
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20">
      <X size={16} />
    </button>
  </div>
))

Toast.displayName = "Toast"

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <Loader size={40} className="animate-spin text-violet-500 mb-4" />
    <p className="text-lg text-gray-600">Loading content...</p>
  </div>
)

const Header = memo(
  ({
    isMessagesPanelOpen,
    isFriendRequestsOpen,
    toggleMessagesPanel,
    toggleFriendRequestsPanel,
  }: {
    isMessagesPanelOpen: boolean
    isFriendRequestsOpen: boolean
    toggleMessagesPanel: () => void
    toggleFriendRequestsPanel: () => void
  }) => (
    <header className="bg-white text-gray-800 p-6 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className={`text-3xl font-bold mb-4 md:mb-0 ${gradientText}`}>Modern Social Platform</h1>
        <nav className="flex items-center space-x-6">
          <a href="#" className="hidden md:block text-gray-600 hover:text-violet-500 transition-colors">
            Home
          </a>
          <a href="#" className="hidden md:block text-gray-600 hover:text-violet-500 transition-colors">
            Explore
          </a>
          <a href="#" className="hidden md:block text-gray-600 hover:text-violet-500 transition-colors">
            About
          </a>
          <div className="flex space-x-4">
            <button onClick={toggleMessagesPanel} className={buttonClass} aria-expanded={isMessagesPanelOpen}>
              {isMessagesPanelOpen ? <X size={20} /> : <MessageSquare size={20} />}
            </button>
            <button onClick={toggleFriendRequestsPanel} className={buttonClass} aria-expanded={isFriendRequestsOpen}>
              {isFriendRequestsOpen ? <X size={20} /> : <UserPlus size={20} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  ),
)

Header.displayName = "Header"

const ProfileSidebar = memo(() => (
  <aside className="hidden md:block w-1/4 pr-6">
    <div className={`${cardClass} mb-6`}>
      <h2 className="text-xl font-semibold mb-4 text-[#3A2E39]">Profile</h2>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
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
    <div className={cardClass}>
      <h2 className="text-xl font-semibold mb-4 text-[#3A2E39]">Trending Topics</h2>
      <div className="space-y-3">
        {["#WebDevelopment", "#ReactJS", "#NextJS"].map((topic, i) => (
          <div key={topic} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            <p className="font-medium text-[#3A2E39]">{topic}</p>
            <p className="text-xs text-gray-500">{[1.2, 0.856, 0.643][i]}K posts</p>
          </div>
        ))}
      </div>
    </div>
  </aside>
))

ProfileSidebar.displayName = "ProfileSidebar"

const MessagesPanel = memo(
  ({
    availableUsers,
    onSendMessage,
    onClose,
  }: {
    availableUsers: string[]
    onSendMessage: (to: string, content: string) => void
    onClose: () => void
  }) => {
    const { privateMessages, actionLoading } = useAppContext()
    const [selectedRecipient, setSelectedRecipient] = useState(availableUsers.find((u) => u !== "You") || "")
    const [messageInput, setMessageInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useKeyboardNavigation(true, onClose)

    const conversation = privateMessages.filter(
      (msg) =>
        (msg.from === "You" && msg.to === selectedRecipient) || (msg.from === selectedRecipient && msg.to === "You"),
    )

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
      <div className="flex flex-col h-full bg-white">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className={`text-xl font-bold ${gradientText}`}>Messages</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <select
            className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {conversation.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</p>
          ) : (
            conversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] ${
                    msg.from === "You"
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <span className={`text-xs block mt-1 ${msg.from === "You" ? "text-white/70" : "text-gray-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={actionLoading.type === "message"}
              className={`${buttonClass} disabled:opacity-50`}
            >
              {actionLoading.type === "message" ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>
      </div>
    )
  },
)

MessagesPanel.displayName = "MessagesPanel"

const FriendRequestsPanel = memo(
  ({
    availableUsers,
    onSendFriendRequest,
    onRespondFriendRequest,
    onClose,
  }: {
    availableUsers: string[]
    onSendFriendRequest: (to: string) => void
    onRespondFriendRequest: (requestId: number, response: "accepted" | "declined") => void
    onClose: () => void
  }) => {
    const { friendRequests } = useAppContext()
    useKeyboardNavigation(true, onClose)

    const sentRequests = friendRequests.filter((req) => req.from === "You")
    const receivedRequests = friendRequests.filter((req) => req.to === "You" && req.status === "pending")

    return (
      <div className="flex flex-col h-full bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${gradientText}`}>Friend Requests</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
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
                    <button onClick={() => onSendFriendRequest(user)} className={buttonClass}>
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
                  <button onClick={() => onRespondFriendRequest(req.id, "accepted")} className={buttonClass}>
                    <UserPlus size={18} />
                  </button>
                  <button onClick={() => onRespondFriendRequest(req.id, "declined")} className={buttonClass}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  },
)

FriendRequestsPanel.displayName = "FriendRequestsPanel"

// AppProvider component
function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { toast, setToast } = useToast(3000)
  const [actionLoading, setActionLoading] = useState<{
    type: "post" | "comment" | "message" | "request" | null
    id: number | null
  }>({ type: null, id: null })

  // Fetch data
  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500))

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
    }

    fetchData()
  }, [])

  // Action handlers
  const createPost = useCallback(
    (content: string) => {
      if (!content.trim()) {
        setToast("Post cannot be empty")
        return
      }

      try {
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
      } catch  {
        setError("Failed to create post. Please try again.")
      }
    },
    [setToast],
  )

  const togglePostLike = useCallback((postId: number) => {
    try {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)),
      )
    } catch {
      setError("Failed to update like status. Please try again.")
    }
  }, [])

  const addComment = useCallback(
    (postId: number, commentText: string) => {
      if (!commentText.trim()) {
        setToast("Comment cannot be empty")
        return
      }

      try {
        const newComment: CommentType = {
          id: Date.now(),
          user: "You",
          text: commentText,
          likes: 0,
          liked: false,
        }
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)))
        setToast("Comment added.")
      } catch {
        setError("Failed to add comment. Please try again.")
      }
    },
    [setToast],
  )

  const likeComment = useCallback((postId: number, commentId: number) => {
    try {
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
    } catch {
      setError("Failed to update comment like status.")
    }
  }, [])

  const sendMessage = useCallback(
    (to: string, content: string) => {
      if (!content.trim()) {
        setToast("Message cannot be empty")
        return
      }

      const messageId = Date.now()
      setActionLoading({ type: "message", id: messageId })

      try {
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
      } catch {
        setError("Failed to send message. Please try again.")
        setActionLoading({ type: null, id: null })
      }
    },
    [setToast],
  )

  const sendFriendRequest = useCallback(
    (to: string) => {
      if (to === "You") {
        setToast("You cannot send a friend request to yourself")
        return
      }

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

      try {
        const newRequest: FriendRequest = {
          id: Date.now(),
          from: "You",
          to: to,
          status: "pending",
        }
        setFriendRequests((prev) => [...prev, newRequest])
        setToast("Friend request sent.")
      } catch {
        setError("Failed to send friend request. Please try again.")
      }
    },
    [friendRequests, setToast],
  )

  const respondFriendRequest = useCallback(
    (requestId: number, response: "accepted" | "declined") => {
      try {
        setFriendRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: response } : req)))
        setToast(`Friend request ${response}.`)
      } catch {
        setError(`Failed to ${response} friend request. Please try again.`)
      }
    },
    [setToast],
  )

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

// Main component
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

  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false)
  const [isFriendRequestsOpen, setIsFriendRequestsOpen] = useState(false)
  const availableUsers = ["Alice", "Bob", "Carol", "John Doe", "Eve", "Frank"]

  const handleToggleMessagesPanel = useCallback(() => {
    setIsMessagesPanelOpen((prev) => !prev)
    setIsFriendRequestsOpen(false)
  }, [])

  const handleToggleFriendRequestsPanel = useCallback(() => {
    setIsFriendRequestsOpen((prev) => !prev)
    setIsMessagesPanelOpen(false)
  }, [])

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Header
        isMessagesPanelOpen={isMessagesPanelOpen}
        isFriendRequestsOpen={isFriendRequestsOpen}
        toggleMessagesPanel={handleToggleMessagesPanel}
        toggleFriendRequestsPanel={handleToggleFriendRequestsPanel}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="flex items-center justify-center h-64" role="alert">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <main className="max-w-7xl mx-auto flex flex-col md:flex-row pt-8 px-4">
            <ProfileSidebar />
            <div className="w-full md:w-3/4">
              <CreatePostForm onSubmit={createPost} />
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onToggleLike={() => togglePostLike(post.id)}
                    onAddComment={(text) => addComment(post.id, String(text))}
                    onLikeComment={(commentId) => likeComment(post.id, commentId)}
                  />
                ))}
              </div>
            </div>
          </main>

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

          <footer className="bg-white text-gray-800 mt-12 py-8 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Modern Social Platform, Inc. All rights reserved.
              </p>
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

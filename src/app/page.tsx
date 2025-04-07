
      "use client"
import { createContext, useContext, useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { Heart, MessageSquare, Send, User, X, UserPlus, MessageCircle } from "lucide-react"

function formatLikes(likes: number): string {
  return likes >= 1000 ? `${Math.floor(likes / 1000)} thousand` : likes.toString()
}

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
export type CommentType = {
  id: number
  user: string
  text: string
  likes: number
  liked: boolean
}

export type Post = {
  id: number
  user: string
  content: string
  likes: number
  liked: boolean
  comments: CommentType[]
  createdAt: number
}

export type PrivateMessage = {
  id: number
  from: string
  to: string
  content: string
  createdAt: number
}

export type FriendRequest = {
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
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Simulation of backend call to load initial data
  useEffect(() => {
    setLoading(true)
    setError(null)
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
        console.log(err)
        setError("Failed to load data.")
        setLoading(false)
      }
    }, 1500)
  }, [])

  // Actions
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

  const sendMessage = (to: string, content: string) => {
    const newMessage: PrivateMessage = {
      id: Date.now(),
      from: "You",
      to,
      content,
      createdAt: Date.now(),
    }
    setPrivateMessages((prev) => [...prev, newMessage])
    setToast("Message sent.")
  }

  const sendFriendRequest = (to: string) => {
    if (friendRequests.some((req) => req.from === "You" && req.to === to)) return
    const newRequest: FriendRequest = {
      id: Date.now(),
      from: "You",
      to,
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within an AppProvider")
  return context
}

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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, setToast])

  return (
    <div className="relative min-h-screen" style={{ background: "#F4D8CD" }}>
      <header className="bg-[#3A2E39] text-[#F4D8CD] p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Modern Social Platform</h1>
          <nav className="flex items-center space-x-6">
            <a href="#" className="hidden md:block text-[#F4D8CD] hover:text-[#EDB183] transition-colors">
              Home
            </a>
            <a href="#" className="hidden md:block text-[#F4D8CD] hover:text-[#EDB183] transition-colors">
              Explore
            </a>
            <a href="#" className="hidden md:block text-[#F4D8CD] hover:text-[#EDB183] transition-colors">
              About
            </a>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsMessagesPanelOpen(!isMessagesPanelOpen)
                  setIsFriendRequestsOpen(false)
                }}
                className="px-4 py-2 bg-[#EDB183] text-[#3A2E39] rounded-lg shadow hover:bg-[#F15152] hover:text-white transition-colors"
              >
                {isMessagesPanelOpen ? <X size={20} /> : <MessageSquare size={20} />}
              </button>
              <button
                onClick={() => {
                  setIsFriendRequestsOpen(!isFriendRequestsOpen)
                  setIsMessagesPanelOpen(false)
                }}
                className="px-4 py-2 bg-[#EDB183] text-[#3A2E39] rounded-lg shadow hover:bg-[#F15152] hover:text-white transition-colors"
              >
                {isFriendRequestsOpen ? <X size={20} /> : <UserPlus size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 right-4 bg-[#EDB183] text-[#3A2E39] px-4 py-2 rounded shadow transition-opacity">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl text-[#3A2E39]">Loading...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row pt-8 px-4">
            {/* Sidebar - only visible on desktop */}
            <div className="hidden md:block w-1/4 pr-6">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-[#EDB183]">
                <h2 className="text-xl font-semibold mb-4 text-[#3A2E39]">Profile</h2>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#EDB183] flex items-center justify-center">
                    <User size={32} className="text-[#3A2E39]" />
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
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#EDB183]">
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
            </div>

            {/* Main content */}
            <div className="w-full md:w-3/4">
              <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border-l-4 border-[#EDB183]">
                <h2 className="text-2xl font-semibold mb-4 text-[#3A2E39]">Create a Post</h2>
                <form onSubmit={handleNewPostSubmit} className="space-y-4">
                  <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EDB183] text-[#3A2E39]"
                    rows={4}
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={handleNewPostChange}
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-6 py-3 bg-[#EDB183] text-[#3A2E39] font-bold rounded-lg shadow hover:bg-[#F15152] hover:text-white transition-colors"
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
          </div>
          <div
            className={`fixed top-20 right-0 h-[calc(100vh-5rem)] w-full md:w-96 shadow-2xl transform transition-transform duration-300 z-50 ${
              isMessagesPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ background: "#1E555C", color: "#F4D8CD" }}
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
            style={{ background: "#1E555C", color: "#F4D8CD" }}
          >
            <FriendRequestsPanel
              availableUsers={availableUsers}
              onSendFriendRequest={sendFriendRequest}
              onRespondFriendRequest={respondFriendRequest}
              onClose={() => setIsFriendRequestsOpen(false)}
            />
          </div>
          <footer className="bg-[#3A2E39] text-[#F4D8CD] mt-12 py-8">
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
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Press
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Resources</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Community Guidelines
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Developers
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Legal</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Cookie Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm hover:text-[#EDB183]">
                        Accessibility
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                <p className="text-sm">
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
    <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-[#EDB183]">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#EDB183] flex items-center justify-center">
          <User size={24} className="text-[#3A2E39]" />
        </div>
        <span className="text-xl font-bold text-[#3A2E39]">{post.user}</span>
      </div>
      <p className="text-xl text-[#3A2E39] mb-4">{post.content}</p>
      <div className="space-y-3 mb-4">
        {post.comments.map((com) => (
          <div key={com.id} className="flex items-start space-x-3 p-3 bg-gray-100 rounded-md">
            <div className="w-8 h-8 rounded-full bg-[#EDB183] flex items-center justify-center">
              <User size={16} className="text-[#3A2E39]" />
            </div>
            <div className="flex flex-col flex-grow">
              <p className="text-sm font-semibold text-[#3A2E39]">{com.user}</p>
              <p className="text-sm text-gray-700">{com.text}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Heart
                  size={20}
                  onClick={() => onLikeComment(com.id)}
                  className="cursor-pointer rounded-full p-1 transition-colors duration-300 hover:bg-pink-600 hover:bg-opacity-20"
                  fill={com.liked ? "#F15152" : "none"}
                  stroke="#F15152"
                />
                <span className="text-xs text-gray-600">{formatLikes(com.likes)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleCommentSubmit} className="flex space-x-3 mb-4">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EDB183] text-[#3A2E39]"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-3 bg-[#EDB183] text-[#3A2E39] rounded-lg shadow hover:bg-[#F15152] hover:text-white transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <Heart
              size={30}
              onClick={onToggleLike}
              className="cursor-pointer rounded-full p-1 transition-colors duration-300 hover:bg-pink-600 hover:bg-opacity-20"
              fill={post.liked ? "#F15152" : "none"}
              stroke="#F15152"
            />
            <span className="text-sm text-[#3A2E39]">{formatLikes(post.likes)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle size={20} className="text-[#3A2E39]" />
            <span className="text-sm text-[#3A2E39]">{post.comments.length}</span>
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

function MessagesPanel({ availableUsers, onSendMessage, onClose }: MessagesPanelProps) {
  const { privateMessages } = useAppContext()
  const [selectedRecipient, setSelectedRecipient] = useState(availableUsers.find((u) => u !== "You") || "")
  const [messageInput, setMessageInput] = useState("")

  const conversation = privateMessages.filter(
    (msg) =>
      (msg.from === "You" && msg.to === selectedRecipient) || (msg.from === selectedRecipient && msg.to === "You"),
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    onSendMessage(selectedRecipient, messageInput)
    setMessageInput("")
  }

  return (
    <div className="flex flex-col h-full p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Messages</h2>
        <button
          onClick={onClose}
          className="px-2 py-1 bg-[#EDB183] text-[#3A2E39] rounded hover:bg-[#F15152] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <select
        className="mb-4 p-2 border rounded bg-[#F4D8CD] text-[#3A2E39]"
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

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-[80%] ${
              msg.from === "You"
                ? "ml-auto text-right bg-[#EDB183] text-[#3A2E39]"
                : "mr-auto text-left bg-[#F15152] text-white"
            }`}
          >
            <p className="text-sm break-words">{msg.content}</p>
            <span className="text-xs block mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-auto sticky bottom-0 bg-[#1E555C] pt-2">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded bg-[#F4D8CD] text-[#3A2E39]"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 bg-[#EDB183] text-[#3A2E39] rounded hover:bg-[#F15152] hover:text-white transition-colors"
          >
            <Send size={20} />
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
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Friend Requests</h2>
        <button
          onClick={onClose}
          className="px-2 py-1 bg-[#EDB183] text-[#3A2E39] rounded hover:bg-[#F15152] hover:text-white transition-colors"
        >
          <X size={20} />
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
                className="flex items-center justify-between p-2 border rounded bg-[#F4D8CD] text-[#3A2E39]"
              >
                <span>{user}</span>
                {request ? (
                  <span className="text-gray-500 text-sm">
                    {request.status === "pending" ? "Pending" : request.status}
                  </span>
                ) : (
                  <button
                    onClick={() => onSendFriendRequest(user)}
                    className="px-3 py-1 bg-[#EDB183] text-[#3A2E39] rounded hover:bg-[#F15152] hover:text-white transition-colors"
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
              className="flex items-center justify-between p-2 border rounded bg-[#F4D8CD] text-[#3A2E39]"
            >
              <span>{req.from}</span>
              <div className="space-x-2">
                <button
                  onClick={() => onRespondFriendRequest(req.id, "accepted")}
                  className="px-3 py-1 bg-[#EDB183] text-[#3A2E39] rounded hover:bg-[#F15152] hover:text-white transition-colors"
                >
                  <UserPlus size={18} />
                </button>
                <button
                  onClick={() => onRespondFriendRequest(req.id, "declined")}
                  className="px-3 py-1 bg-[#EDB183] text-[#3A2E39] rounded hover:bg-[#F15152] hover:text-white transition-colors"
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

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  )
}

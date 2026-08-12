import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { initials } from "../utils/initials"
import { getErrorMessage } from "../utils/errors"
import ReportButton from "../components/ReportButton"
import FlipClock from "../components/FlipClock"
import { PostSkeleton } from "../components/Skeleton"
import { EmptyState } from "../components/EmptyState"
import { SuggestionsBox } from "../components/SuggestionsBox"
import { useToast } from "../context/ToastContext"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function CommentSection({ postId, currentUserId }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState("")

  async function loadComments() {
    const response = await fetch(`https://fast-connect-bay.vercel.app/posts/${postId}/comments`, {
      headers: authHeaders(),
    })
    const data = await response.json()
    if (response.ok) {
      setComments(data)
    }
  }

  useEffect(() => {
    loadComments()
  }, [])

  async function handleAddComment(e) {
    e.preventDefault()

    await fetch(`https://fast-connect-bay.vercel.app/posts/${postId}/comments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    })

    setContent("")
    loadComments()
  }

  return (
    <div className="mt-3 ml-1 border-l-2 pl-3 flex flex-col gap-1" style={{ borderColor: "var(--color-border)" }}>
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start justify-between gap-2">
          <p className="text-sm">
            <span className="font-semibold">{comment.author_name}: </span>
            {comment.content}
          </p>
          {comment.author_id !== currentUserId && (
            <ReportButton targetType="comment" targetId={comment.id} className="shrink-0" />
          )}
        </div>
      ))}

      <form onSubmit={handleAddComment} className="flex gap-2 mt-1">
        <input placeholder="Write a comment..." value={content} onChange={(e) => setContent(e.target.value)} className="border rounded px-2 py-1 text-sm flex-1" style={{ borderColor: "var(--color-border)" }} />
        <button type="submit" className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>Reply</button>
      </form>
    </div>
  )
}

function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [trending, setTrending] = useState([])

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleCancelCreate() {
    setContent("")
    setImageFile(null)
    setImagePreview(null)
  }

  async function loadFeed() {
    setLoading(true)
    const response = await fetch("https://fast-connect-bay.vercel.app/posts", {
      headers: authHeaders(),
    })
    const data = await response.json()

    if (response.ok) {
      setPosts(data)
      
      // Calculate real trending hashtags from posts
      const hashtagCounts = {}
      data.forEach(post => {
        const words = (post.content || "").split(/\s+/)
        words.forEach(word => {
          if (word.startsWith("#") && word.length > 1) {
            hashtagCounts[word] = (hashtagCounts[word] || 0) + 1
          }
        })
      })
      
      const sortedTags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0])
        
      setTrending(sortedTags)
    } else {
      addToast(getErrorMessage(data), "error")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFeed()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!content.trim()) return

    let imageUrl = null

    if (imageFile) {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", imageFile)

      const uploadResponse = await fetch("https://fast-connect-bay.vercel.app/uploads/image", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      })
      const uploadData = await uploadResponse.json()

      setUploading(false)

      if (!uploadResponse.ok) {
        addToast(getErrorMessage(uploadData), "error")
        return
      }

      imageUrl = uploadData.url
    }

    const response = await fetch("https://fast-connect-bay.vercel.app/posts", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content, image_url: imageUrl }),
    })
    const data = await response.json()

    if (response.ok) {
      setContent("")
      setImageFile(null)
      setImagePreview(null)
      addToast("Post created successfully!", "success")
      loadFeed()
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

  async function handleDelete(postId) {
    await fetch(`https://fast-connect-bay.vercel.app/posts/${postId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    loadFeed()
  }

  async function handleLikeToggle(post) {
    const method = post.liked_by_me ? "DELETE" : "POST"
    await fetch(`https://fast-connect-bay.vercel.app/posts/${post.id}/like`, {
      method,
      headers: authHeaders(),
    })
    loadFeed()
  }

  function startEdit(post) {
    setEditingId(post.id)
    setEditContent(post.content)
  }

  async function handleSaveEdit(postId) {
    await fetch(`https://fast-connect-bay.vercel.app/posts/${postId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ content: editContent }),
    })
    setEditingId(null)
    loadFeed()
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto flex gap-8">
      {/* Main Feed Column */}
      <div className="flex-1 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Feed</h1>

      <div className="post-card border rounded-lg p-4 mb-4 flex items-start gap-3" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          {initials(user.name)}
        </div>
        <form onSubmit={handleCreate} className="flex-1 flex flex-col gap-2">
          <input
            placeholder="Share something with your campus..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2"
            style={{ borderColor: "var(--color-border)" }}
          />

          {imagePreview && (
            <img src={imagePreview} alt="Selected" className="w-full h-auto max-h-80 object-cover rounded-lg" />
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm cursor-pointer flex items-center gap-1.5" style={{ color: "var(--color-accent)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              Add photo
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>

            <div className="flex items-center gap-2">
              {(content.trim() || imageFile) && (
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="rounded px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
                  style={{ color: "var(--color-muted)" }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={uploading || (!content.trim() && !imageFile)}
                className="rounded px-4 py-2 disabled:opacity-50 font-medium"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
              >
                {uploading ? "Uploading..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <EmptyState 
            icon="📭" 
            title="No posts yet" 
            message="Be the first to share something with your campus!" 
          />
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card border rounded-lg p-4" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <Link to={`/profile/${post.author_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                >
                  {initials(post.author_name)}
                </div>
                <div>
                  <p className="font-semibold">{post.author_name}</p>
                </div>
              </Link>
            </div>

            {editingId === post.id ? (
              <div className="flex flex-col gap-2">
                <input value={editContent} onChange={(e) => setEditContent(e.target.value)} className="border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(post.id)}
                    className="rounded px-3 py-1 text-sm"
                    style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm" style={{ color: "var(--color-muted)" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p>{post.content}</p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="w-full h-auto rounded-lg mt-2"
                  />
                )}
              </>
            )}

            <div className="flex gap-4 items-center mt-3 text-sm">
              <button onClick={() => handleLikeToggle(post)} className="font-medium" style={{ color: post.liked_by_me ? "var(--color-coral)" : "var(--color-muted)" }}>
                {post.liked_by_me ? "❤️" : "🤍"} {post.likes_count}
              </button>

              {post.author_id === user.id && editingId !== post.id && (
                <>
                  <button onClick={() => startEdit(post)} style={{ color: "var(--color-accent)" }}>Edit</button>
                  <button onClick={() => handleDelete(post.id)} style={{ color: "var(--color-danger)" }}>Delete</button>
                </>
              )}

              {post.author_id !== user.id && (
                <ReportButton targetType="post" targetId={post.id} />
              )}
            </div>

            <CommentSection postId={post.id} currentUserId={user.id} />
          </div>
        )))}
      </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 shrink-0 hidden md:flex flex-col gap-6 mt-[3.2rem]">
        <FlipClock />
        
        {/* Trending Topics Box */}
        <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-bg, #1a1a2e)", border: "1px solid var(--color-border, #333)" }}>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-sm font-bold text-gray-400">Trending Topics</h2>
             <Link to="/trending" className="text-xs font-semibold hover:opacity-70" style={{ color: "var(--color-primary)" }}>See All</Link>
           </div>
           
           <div className="flex flex-col gap-3">
             {trending.length > 0 ? (
               trending.map((tag, idx) => (
                 <div key={idx} className="flex flex-col">
                   <span className="text-xs text-gray-500">{idx + 1}. Campus Trend</span>
                   <span className="font-semibold text-sm">{tag}</span>
                 </div>
               ))
             ) : (
               <p className="text-xs text-gray-500 italic">No trending topics right now. Post with a hashtag to start a trend!</p>
             )}
           </div>
        </div>

        <SuggestionsBox />

        {/* Instagram-style Footer */}
        <div className="mt-4 text-xs text-gray-500 flex flex-col gap-2 px-2">
          <div className="flex gap-x-3 gap-y-1 flex-wrap">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Help</a>
            <a href="#" className="hover:underline">Press</a>
            <a href="#" className="hover:underline">API</a>
            <a href="#" className="hover:underline">Jobs</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
          <p className="mt-2">© 2026 FAST Connect from Mustafa</p>
        </div>
      </div>
    </div>
  )
}

export default Feed

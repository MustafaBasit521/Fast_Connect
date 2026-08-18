import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Inbox, Library, Headphones, GraduationCap, MapPin, Calendar, X, Send, MoreHorizontal } from "lucide-react"
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

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function CommentSection({ postId, currentUserId }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)

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

  async function handleDeleteComment(commentId) {
    await fetch(`https://fast-connect-bay.vercel.app/comments/${commentId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    setOpenMenuId(null)
    loadComments()
  }

  return (
    <div className="mt-3 pt-3 border-t flex flex-col min-w-0 flex-1 min-h-0" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex flex-col gap-4 min-w-0 flex-1 min-h-0 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2.5 min-w-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
            >
              {initials(comment.author_name)}
            </div>
            <p className="text-sm break-words min-w-0 flex-1">
              <span className="font-semibold">{comment.author_name} </span>
              {comment.content}
            </p>
            <div className="relative shrink-0">
              <button
                onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                aria-label="Comment options"
                className="p-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {openMenuId === comment.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                  <div
                    className="absolute right-0 top-6 z-20 rounded-lg shadow-lg border py-1 min-w-[110px]"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
                  >
                    {comment.author_id === currentUserId ? (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="block w-full text-left px-3 py-1.5 text-xs"
                        style={{ color: "var(--color-danger)" }}
                      >
                        Delete
                      </button>
                    ) : (
                      <ReportButton targetType="comment" targetId={comment.id} className="block w-full text-left px-3 py-1.5" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-4 shrink-0">
        <input
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border rounded-full px-3 py-1.5 text-sm flex-1 min-w-0"
          style={{ borderColor: "var(--color-border)" }}
        />
        <button type="submit" aria-label="Send comment" className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "var(--color-accent)" }}>
          <Send className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  )
}

function Feed() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const hashtagFilter = searchParams.get("hashtag")
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [trending, setTrending] = useState([])
  const [nextEvent, setNextEvent] = useState(null)
  const [resourceCount, setResourceCount] = useState(null)

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
    const query = hashtagFilter ? `?hashtag=${encodeURIComponent(hashtagFilter)}` : ""
    const response = await fetch(`https://fast-connect-bay.vercel.app/posts${query}`, {
      headers: authHeaders(),
    })
    const data = await response.json()

    if (response.ok) {
      setPosts(data)
    } else {
      addToast(getErrorMessage(data), "error")
    }
    setLoading(false)
  }

  async function loadTrending() {
    const response = await fetch("https://fast-connect-bay.vercel.app/posts/trending", {
      headers: authHeaders(),
    })
    if (response.ok) setTrending(await response.json())
  }

  async function loadSidebarPreviews() {
    const [eventsRes, resourcesRes] = await Promise.all([
      fetch("https://fast-connect-bay.vercel.app/events", { headers: authHeaders() }),
      fetch("https://fast-connect-bay.vercel.app/resources", { headers: authHeaders() }),
    ])
    if (eventsRes.ok) {
      const events = await eventsRes.json()
      setNextEvent(events[0] || null)
    }
    if (resourcesRes.ok) {
      const resources = await resourcesRes.json()
      setResourceCount(resources.length)
    }
  }

  useEffect(() => {
    loadFeed()
  }, [hashtagFilter])

  useEffect(() => {
    loadTrending()
    loadSidebarPreviews()
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
    setDeleteTargetId(null)
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
    <div className="max-w-[90rem] mx-auto flex gap-8">
      {/* Main Feed Column */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold mb-4">Feed</h1>

        {hashtagFilter && (
          <div className="flex items-center justify-between mb-4 px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--color-border)" }}>
            <span className="text-sm font-medium">Filtered by <strong>#{hashtagFilter}</strong></span>
            <Link to="/feed" className="text-sm" style={{ color: "var(--color-accent)" }}>Clear ×</Link>
          </div>
        )}

      <div className="post-card border rounded-lg p-4 mb-4 flex items-start gap-3" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          {initials(user.name)}
        </div>
        <form onSubmit={handleCreate} className="flex-1 flex flex-col gap-2">
          <textarea
            placeholder="Share something with your campus..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleCreate(e)
              }
            }}
            rows={1}
            className="w-full border rounded px-3 py-2 resize-none"
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
            icon={Inbox}
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
                  <p className="font-semibold text-base">{post.author_name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>{timeAgo(post.created_at)}</p>
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
                <p className="break-words">{post.content}</p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    onClick={() => setExpandedPostId(post.id)}
                    className="w-full h-auto rounded-lg mt-2 cursor-pointer"
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
                  <button onClick={() => setDeleteTargetId(post.id)} style={{ color: "var(--color-danger)" }}>Delete</button>
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
        
        {/* Campus Events quick-link card */}
        <Link
          to="/events"
          className="post-card p-5 rounded-xl flex items-center gap-4 hover:opacity-90 transition-opacity"
        >
          <Calendar className="w-7 h-7 shrink-0" strokeWidth={1.5} style={{ color: "var(--color-primary)" }} />
          <div>
            <h2 className="text-sm font-bold">Campus Events</h2>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {nextEvent ? nextEvent.title : "See what's happening on campus"}
            </p>
          </div>
        </Link>

        {/* Resource Sharing quick-link card
        <Link
          to="/resources"
          className="p-5 rounded-xl flex items-center gap-4 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-bg, #1a1a2e)", border: "1px solid var(--color-border, #333)" }}
        >
          <span className="text-3xl shrink-0">📚</span>
          <div>
            <h2 className="text-sm font-bold">Resource Sharing</h2>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {resourceCount != null ? `${resourceCount} shared notes & files` : "Share notes & projects"}
            </p>
          </div>
        </Link> */}

        {/* Trending Topics Box */}
        <div className="post-card p-5 rounded-xl">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-sm font-bold text-gray-400">Trending Topics</h2>
             <Link to="/trending" className="text-xs font-semibold hover:opacity-70" style={{ color: "var(--color-primary)" }}>See All</Link>
           </div>
           
           <div className="flex flex-col gap-3">
             {trending.length > 0 ? (
               trending.map((topic, idx) => (
                 <Link key={topic.tag} to={`/feed?hashtag=${encodeURIComponent(topic.tag)}`} className="flex items-center justify-between hover:opacity-80 transition-opacity">
                   <span className="font-semibold text-sm">{idx + 1}. #{topic.tag}</span>
                   <span className="text-xs text-gray-500">{topic.count} posts</span>
                 </Link>
               ))
             ) : (
               <p className="text-xs text-gray-500 italic">No trending topics right now. Post with a #hashtag to start a trend!</p>
             )}
           </div>
        </div>

        <SuggestionsBox />

        {/* Quick Links */}
        <div className="post-card p-5 rounded-xl">
          <h2 className="text-sm font-bold mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/campus-map" className="rounded-lg p-3 text-center hover:opacity-80 transition-opacity" style={{ border: "1px solid var(--color-border)" }}>
              <MapPin className="w-5 h-5 mx-auto mb-1" strokeWidth={1.75} />
              <p className="text-xs font-medium">Campus Map</p>
            </Link>
            <div className="rounded-lg p-3 text-center opacity-50 cursor-default" style={{ border: "1px solid var(--color-border)" }}>
              <Library className="w-5 h-5 mx-auto mb-1" strokeWidth={1.75} />
              <p className="text-xs font-medium">Library</p>
            </div>
            <div className="rounded-lg p-3 text-center opacity-50 cursor-default" style={{ border: "1px solid var(--color-border)" }}>
              <Headphones className="w-5 h-5 mx-auto mb-1" strokeWidth={1.75} />
              <p className="text-xs font-medium">IT Support</p>
            </div>
            <div className="rounded-lg p-3 text-center opacity-50 cursor-default" style={{ border: "1px solid var(--color-border)" }}>
              <GraduationCap className="w-5 h-5 mx-auto mb-1" strokeWidth={1.75} />
              <p className="text-xs font-medium">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Instagram-style Footer */}
        <div className="mt-4 text-xs text-gray-500 flex flex-col gap-2 px-2">
          <div className="flex gap-x-3 gap-y-1 flex-wrap">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/feedback" className="hover:underline">Feedback</Link>
          </div>
          <p className="mt-2">© 2026 FAST Connect from Mustafa</p>
        </div>
      </div>

      {deleteTargetId && (
        <div className="report-backdrop" onClick={() => setDeleteTargetId(null)}>
          <div className="report-glass-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#fff" }}>Delete this post?</h3>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
              This can't be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {expandedPostId && (() => {
        const post = posts.find((p) => p.id === expandedPostId)
        if (!post) return null
        return (
          <div className="report-backdrop" onClick={() => setExpandedPostId(null)}>
            <div
              className="w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col md:flex-row"
              style={{ backgroundColor: "var(--color-surface)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex items-center justify-center min-h-0" style={{ backgroundColor: "#000" }}>
                <img src={post.image_url} alt="Post attachment" className="max-w-full max-h-[40vh] md:max-h-[90vh] object-contain" />
              </div>

              <div className="w-full md:w-[360px] shrink-0 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <Link to={`/profile/${post.author_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setExpandedPostId(null)}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
                    >
                      {initials(post.author_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.author_name}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>{timeAgo(post.created_at)}</p>
                    </div>
                  </Link>
                  <button onClick={() => setExpandedPostId(null)} aria-label="Close" style={{ color: "var(--color-muted)" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {post.content && <p className="break-words text-sm p-4 pb-0">{post.content}</p>}

                <div className="flex gap-4 items-center text-sm p-4">
                  <button onClick={() => handleLikeToggle(post)} className="font-medium" style={{ color: post.liked_by_me ? "var(--color-coral)" : "var(--color-muted)" }}>
                    {post.liked_by_me ? "❤️" : "🤍"} {post.likes_count}
                  </button>
                  {post.author_id !== user.id && (
                    <ReportButton targetType="post" targetId={post.id} />
                  )}
                </div>

                <div className="flex-1 min-h-0 flex flex-col p-4 pt-0">
                  <CommentSection postId={post.id} currentUserId={user.id} />
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Feed

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { initials } from "../utils/initials"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState("")

  async function loadComments() {
    const response = await fetch(`http://127.0.0.1:8000/posts/${postId}/comments`, {
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

    await fetch(`http://127.0.0.1:8000/posts/${postId}/comments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    })

    setContent("")
    loadComments()
  }

  return (
    <div className="mt-3 ml-1 border-l-2 border-gray-100 pl-3 flex flex-col gap-1">
      {comments.map((comment) => (
        <p key={comment.id} className="text-sm">
          <span className="font-semibold">{comment.author_name}: </span>
          {comment.content}
        </p>
      ))}

      <form onSubmit={handleAddComment} className="flex gap-2 mt-1">
        <input placeholder="Write a comment..." value={content} onChange={(e) => setContent(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
        <button type="submit" className="text-sm text-blue-900 font-medium">Reply</button>
      </form>
    </div>
  )
}

function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState("")

  async function loadFeed() {
    const response = await fetch("http://127.0.0.1:8000/posts", {
      headers: authHeaders(),
    })
    const data = await response.json()

    if (response.ok) {
      setPosts(data)
    } else {
      setMessage(data.detail)
    }
  }

  useEffect(() => {
    loadFeed()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!content.trim()) return

    const response = await fetch("http://127.0.0.1:8000/posts", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    })
    const data = await response.json()

    if (response.ok) {
      setContent("")
      loadFeed()
    } else {
      setMessage(data.detail)
    }
  }

  async function handleDelete(postId) {
    await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    loadFeed()
  }

  async function handleLikeToggle(post) {
    const method = post.liked_by_me ? "DELETE" : "POST"
    await fetch(`http://127.0.0.1:8000/posts/${post.id}/like`, {
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
    await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
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
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>

      <div className="border border-gray-200 rounded-lg p-4 mb-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initials(user.name)}
        </div>
        <form onSubmit={handleCreate} className="flex-1 flex gap-2">
          <input
            placeholder="Share something with your campus..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-950 text-white rounded px-4 py-2 shrink-0">Post</button>
        </form>
      </div>

      {message && <p className="text-red-600 text-sm mb-2">{message}</p>}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                {initials(post.author_name)}
              </div>
              <div>
                <p className="font-semibold">{post.author_name}</p>
              </div>
            </div>

            {editingId === post.id ? (
              <div className="flex flex-col gap-2">
                <input value={editContent} onChange={(e) => setEditContent(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(post.id)} className="bg-blue-950 text-white rounded px-3 py-1 text-sm">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <p>{post.content}</p>
            )}

            <div className="flex gap-4 items-center mt-3 text-sm text-gray-500">
              <button onClick={() => handleLikeToggle(post)} className={post.liked_by_me ? "text-pink-600 font-medium" : ""}>
                ♥ {post.likes_count}
              </button>

              {post.author_id === user.id && editingId !== post.id && (
                <>
                  <button onClick={() => startEdit(post)}>Edit</button>
                  <button onClick={() => handleDelete(post.id)}>Delete</button>
                </>
              )}
            </div>

            <CommentSection postId={post.id} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feed

import { useState, useEffect } from "react"

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
    <div className="mt-2 ml-2 border-l border-gray-200 pl-2">
      {comments.map((comment) => (
        <p key={comment.id} className="text-sm">
          <span className="font-semibold">{comment.author_name}: </span>
          {comment.content}
        </p>
      ))}

      <form onSubmit={handleAddComment} className="flex gap-2 mt-1">
        <input placeholder="Add a comment..." value={content} onChange={(e) => setContent(e.target.value)} className="border border-gray-400 rounded px-2 py-1 text-sm flex-1" />
        <button type="submit" className="bg-blue-500 text-white rounded px-2 py-1 text-sm">Reply</button>
      </form>
    </div>
  )
}

function Feed() {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
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
    async function loadCurrentUser() {
      const response = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: authHeaders(),
      })
      const data = await response.json()
      if (response.ok) {
        setCurrentUserId(data.id)
      }
    }

    loadCurrentUser()
    loadFeed()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()

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

  return (
    <div className="max-w-md mb-8">
      <h2 className="font-bold">Feed</h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-2 mb-4">
        <input placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
        <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Post</button>
      </form>

      <p>{message}</p>

      {posts.map((post) => (
        <div key={post.id} className="border border-gray-300 rounded p-2 mb-2">
          <p className="text-sm text-gray-500">{post.author_name}</p>

          {editingId === post.id ? (
            <div className="flex flex-col gap-1">
              <input value={editContent} onChange={(e) => setEditContent(e.target.value)} className="border border-gray-400 rounded px-2 py-1" />
              <div className="flex gap-2">
                <button onClick={() => handleSaveEdit(post.id)} className="bg-blue-600 text-white rounded px-2 py-1">Save</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white rounded px-2 py-1">Cancel</button>
              </div>
            </div>
          ) : (
            <p>{post.content}</p>
          )}

          <div className="flex gap-2 items-center mt-1">
            <button onClick={() => handleLikeToggle(post)} className="bg-pink-600 text-white rounded px-2 py-1">
              {post.liked_by_me ? "Unlike" : "Like"} ({post.likes_count})
            </button>

            {post.author_id === currentUserId && (
              <>
                <button onClick={() => startEdit(post)} className="bg-yellow-500 text-white rounded px-2 py-1">Edit</button>
                <button onClick={() => handleDelete(post.id)} className="bg-red-600 text-white rounded px-2 py-1">Delete</button>
              </>
            )}
          </div>

          <CommentSection postId={post.id} />
        </div>
      ))}
    </div>
  )
}

export default Feed

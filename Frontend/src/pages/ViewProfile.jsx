import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getErrorMessage } from "../utils/errors"
import { initials } from "../utils/initials"
import ReportButton from "../components/ReportButton"
import { PostSkeleton } from "../components/Skeleton"
import { EmptyState } from "../components/EmptyState"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

function ViewProfile() {
  const { userId } = useParams()

  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState("")
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch(`https://fast-connect-bay.vercel.app/profile/${userId}`, {
        headers: authHeaders(),
      })
      const data = await response.json()

      if (response.ok) {
        setProfile(data)
        setMessage("")
      } else {
        setProfile(null)
        setMessage(getErrorMessage(data))
      }
    }

    async function loadUserPosts() {
      setLoadingPosts(true)
      const response = await fetch("https://fast-connect-bay.vercel.app/posts", {
        headers: authHeaders(),
      })
      const data = await response.json()
      if (response.ok) {
        // Filter posts to only show this user's posts
        const userPosts = data.filter(p => p.author_id === parseInt(userId) || p.author_id === userId)
        setPosts(userPosts)
      }
      setLoadingPosts(false)
    }

    loadProfile()
    loadUserPosts()
  }, [userId])

  if (message) {
    return <p style={{ color: "var(--color-danger)" }}>{message}</p>
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Profile Header */}
      <div className="border rounded-lg p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-lg" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
        <div
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center font-bold text-3xl sm:text-4xl shrink-0 border-4"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)", borderColor: "var(--color-bg)" }}
        >
          {initials(profile.name)}
        </div>
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h1>
          {profile.bio ? (
            <p className="mb-6 text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>{profile.bio}</p>
          ) : (
            <p className="mb-6 text-sm italic opacity-70" style={{ color: "var(--color-muted)" }}>No bio provided.</p>
          )}
          
          <div className="flex justify-center sm:justify-start gap-3 mt-auto">
             <button className="px-6 py-2 rounded-lg font-bold text-sm transition-transform hover:scale-105" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>Follow</button>
             <ReportButton targetType="user" targetId={profile.id} />
          </div>
        </div>
      </div>
      
      {/* User Posts Section */}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-6 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>Posts by {profile.name}</h2>
        <div className="flex flex-col gap-6">
          {loadingPosts ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <EmptyState 
              icon="📷" 
              title="No posts yet" 
              message={`${profile.name} hasn't shared anything with the campus yet.`} 
            />
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card border rounded-lg p-5 shadow-md" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.01)" }}>
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
                     {initials(profile.name)}
                   </div>
                   <p className="font-semibold text-sm">{profile.name}</p>
                </div>
                <p className="text-base">{post.content}</p>
                {post.image_url && (
                  <img src={post.image_url} alt="Post attachment" className="w-full h-auto rounded-lg mt-3" />
                )}
                <div className="flex gap-4 items-center mt-4 pt-3 border-t text-sm" style={{ borderColor: "var(--color-border)" }}>
                   <span style={{ color: "var(--color-coral, #ff6b6b)" }} className="font-medium">❤️ {post.likes_count} Likes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewProfile

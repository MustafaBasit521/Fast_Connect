import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Flame, ArrowLeft } from "lucide-react"
import { EmptyState } from "../components/EmptyState"

const API = "https://fast-connect-bay.vercel.app"

function authHeaders() {
  const token = localStorage.getItem("token")
  return { "Authorization": `Bearer ${token}` }
}

function TrendingPage() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const response = await fetch(`${API}/posts/trending?limit=20`, { headers: authHeaders() })
      if (response.ok) setTopics(await response.json())
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">
      <Link to="/feed" className="flex items-center gap-1.5 text-sm w-fit hover:opacity-70" style={{ color: "var(--color-muted)" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </Link>
      <h1 className="text-2xl font-bold">🔥 Trending Topics</h1>

      {loading ? (
        <p style={{ color: "var(--color-muted)" }}>Loading...</p>
      ) : topics.length === 0 ? (
        <EmptyState icon={Flame} title="Nothing trending yet" message="Post with a #hashtag to start a trend!" />
      ) : (
        <div className="flex flex-col gap-2">
          {topics.map((topic, i) => (
            <Link
              key={topic.tag}
              to={`/feed?hashtag=${encodeURIComponent(topic.tag)}`}
              className="post-card border rounded-lg p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg w-6 text-center" style={{ color: "var(--color-accent)" }}>{i + 1}</span>
                <span className="font-semibold">#{topic.tag}</span>
              </div>
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>{topic.count} posts</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrendingPage

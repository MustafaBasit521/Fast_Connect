import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"
import { getErrorMessage } from "../utils/errors"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"
import { EmptyState } from "../components/EmptyState"

const API = "https://fast-connect-bay.vercel.app"
const PAGE_SIZE = 20

const FILE_ICONS = {
  PDF: "📄",
  DOCX: "📝",
  PPTX: "📊",
  ZIP: "🗂️",
  IMAGE: "🖼️",
}

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

function ResourceCard({ resource, onDownload, onDelete, isMine }) {
  return (
    <div className="post-card border rounded-lg p-4 flex items-center gap-4" style={{ borderColor: "var(--color-border)" }}>
      <div className="text-3xl shrink-0">{FILE_ICONS[resource.file_type] || "📁"}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {resource.course_code && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
              {resource.course_code}
            </span>
          )}
          <h3 className="font-semibold truncate">{resource.title}</h3>
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
          Uploaded by {resource.uploaded_by_name} • {timeAgo(resource.created_at)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
          {formatSize(resource.file_size)} • {resource.downloads_count} downloads
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => onDownload(resource)}
          className="rounded px-3 py-1.5 text-sm font-semibold"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          ⬇ Download
        </button>
        {isMine && (
          <button onClick={() => onDelete(resource.id)} className="text-xs" style={{ color: "var(--color-danger)" }}>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

function UploadResourceForm({ onUploaded, onClose }) {
  const { addToast } = useToast()
  const [title, setTitle] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !file) return

    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    const uploadResponse = await fetch(`${API}/uploads/resource`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    })
    const uploadData = await uploadResponse.json()

    if (!uploadResponse.ok) {
      setUploading(false)
      addToast(getErrorMessage(uploadData), "error")
      return
    }

    const response = await fetch(`${API}/resources`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        course_code: courseCode || null,
        file_url: uploadData.url,
        file_type: uploadData.file_type,
        file_size: uploadData.file_size,
      }),
    })
    const data = await response.json()

    setUploading(false)

    if (response.ok) {
      addToast("Resource uploaded!", "success")
      onUploaded(data)
      onClose()
    } else {
      addToast(getErrorMessage(data), "error")
    }
  }

  return (
    <div className="border rounded-lg p-5 flex flex-col gap-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Upload Shared Resource</h2>
        <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--color-muted)" }}>×</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Course code (optional)</label>
          <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CS1001" className="w-full border rounded px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">File</label>
          <label
            className="flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg py-6 cursor-pointer text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            <span className="text-2xl">📤</span>
            {file ? file.name : "Click to choose a PDF, DOCX, PPTX, ZIP, or image (max 20MB)"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="rounded px-4 py-2 font-semibold disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          {uploading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>
    </div>
  )
}

function ResourcesPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [showForm, setShowForm] = useState(false)

  async function loadResources() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (courseCode) params.set("course_code", courseCode)
    params.set("skip", "0")
    params.set("limit", String(PAGE_SIZE))

    const response = await fetch(`${API}/resources?${params.toString()}`, { headers: authHeaders() })
    const data = await response.json()

    if (response.ok) {
      setResources(data)
      setHasMore(data.length === PAGE_SIZE)
    } else {
      addToast(getErrorMessage(data), "error")
    }
    setLoading(false)
  }

  async function loadMore() {
    setLoadingMore(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (courseCode) params.set("course_code", courseCode)
    params.set("skip", String(resources.length))
    params.set("limit", String(PAGE_SIZE))

    const response = await fetch(`${API}/resources?${params.toString()}`, { headers: authHeaders() })
    const data = await response.json()

    if (response.ok) {
      setResources((prev) => [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoadingMore(false)
  }

  useEffect(() => {
    const timeout = setTimeout(loadResources, 300)
    return () => clearTimeout(timeout)
  }, [search, courseCode])

  async function handleDownload(resource) {
    const response = await fetch(`${API}/resources/${resource.id}/download`, { method: "POST", headers: authHeaders() })
    const data = await response.json()
    if (response.ok) {
      window.open(data.file_url, "_blank")
      setResources((prev) => prev.map((r) => (r.id === resource.id ? data : r)))
    }
  }

  async function handleDelete(resourceId) {
    await fetch(`${API}/resources/${resourceId}`, { method: "DELETE", headers: authHeaders() })
    setResources((prev) => prev.filter((r) => r.id !== resourceId))
    addToast("Resource deleted", "info")
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Digital Resource Library</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded px-4 py-2 font-semibold"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}
        >
          {showForm ? "Cancel" : "+ Upload Resource"}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes, past papers, assignments..."
          className="flex-1 min-w-[200px] border rounded px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
        />
        <input
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          placeholder="Course code (e.g. CS1001)"
          className="border rounded px-3 py-2 w-48"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {showForm && (
        <UploadResourceForm
          onUploaded={(resource) => setResources((prev) => [resource, ...prev])}
          onClose={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p style={{ color: "var(--color-muted)" }}>Loading resources...</p>
      ) : resources.length === 0 ? (
        <EmptyState icon={BookOpen} title="No resources yet" message="Share your notes, past papers, or project files with the campus." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDownload={handleDownload}
                onDelete={handleDelete}
                isMine={resource.uploaded_by_id === user?.id}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="self-center rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default ResourcesPage

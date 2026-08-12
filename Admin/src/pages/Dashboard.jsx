import { useState, useEffect } from "react"
import { API_URL, authHeaders } from "../api"

function StatCard({ label, value, danger }) {
  return (
    <div className="border rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: danger ? "var(--color-danger)" : "var(--color-text)" }}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    restricted: { color: "var(--color-danger)", backgroundColor: "rgba(220,38,38,0.1)" },
    temp_banned: { color: "#b45309", backgroundColor: "rgba(180,83,9,0.1)" },
    active: { color: "#15803d", backgroundColor: "rgba(21,128,61,0.1)" },
  }

  return (
    <span className="px-2 py-1 rounded text-xs" style={styles[status] || styles.active}>
      {status}
    </span>
  )
}

function UsersTab({ users, onRestrict, onTempBan, onUnrestrict, onDelete }) {
  return (
    <div className="border rounded-lg overflow-x-auto" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b" style={{ color: "var(--color-muted)", borderColor: "var(--color-border)" }}>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b" style={{ borderColor: "var(--color-border)" }}>
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3" style={{ color: "var(--color-muted)" }}>{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3"><StatusBadge status={u.status} /></td>
              <td className="p-3 flex gap-2 flex-wrap">
                {u.status === "active" && (
                  <>
                    <button onClick={() => onRestrict(u.id)} style={{ color: "var(--color-danger)" }}>Restrict</button>
                    <button onClick={() => onTempBan(u.id)} style={{ color: "#b45309" }}>Temp Ban</button>
                  </>
                )}
                {u.status !== "active" && (
                  <button onClick={() => onUnrestrict(u.id)} style={{ color: "var(--color-accent)" }}>Unrestrict</button>
                )}
                <button onClick={() => onDelete(u.id)} style={{ color: "var(--color-danger)" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReportsTab({ reports, onResolve }) {
  return (
    <div className="flex flex-col gap-3">
      {reports.length === 0 && (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>No reports yet.</p>
      )}

      {reports.map((r) => (
        <div key={r.id} className="border rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">
              {r.target_type} reported by {r.reporter_name}
            </p>
            <StatusBadge status={r.status === "pending" ? "temp_banned" : "active"} />
          </div>

          <p className="text-sm mb-2"><span className="font-medium">Reason: </span>{r.reason}</p>

          <div className="rounded p-3 text-sm mb-2" style={{ backgroundColor: "var(--color-bg)" }}>
            <p style={{ color: "var(--color-muted)" }}>
              Proof {r.proof_author_name ? `— from ${r.proof_author_name}` : "(content no longer available)"}
            </p>
            {r.proof_content && <p className="mt-1">{r.proof_content}</p>}
            {r.proof_image_url && (
              <img src={r.proof_image_url} alt="Reported content" className="mt-2 max-h-60 rounded" />
            )}
          </div>

          {r.status === "pending" ? (
            <div className="flex gap-3 text-sm">
              <button onClick={() => onResolve(r.id, "dismiss")} style={{ color: "var(--color-muted)" }}>Dismiss</button>
              <button onClick={() => onResolve(r.id, "restrict")} style={{ color: "var(--color-danger)" }}>Restrict user</button>
              <button onClick={() => onResolve(r.id, "temp_ban")} style={{ color: "#b45309" }}>Temp ban user</button>
            </div>
          ) : (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Resolved: {r.resolved_action}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const [tab, setTab] = useState("reports")
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])

  async function loadStats() {
    const response = await fetch(`${API_URL}/admin/stats`, { headers: authHeaders() })
    if (response.ok) setStats(await response.json())
  }

  async function loadUsers() {
    const response = await fetch(`${API_URL}/admin/users`, { headers: authHeaders() })
    if (response.ok) setUsers(await response.json())
  }

  async function loadReports() {
    const response = await fetch(`${API_URL}/reports`, { headers: authHeaders() })
    if (response.ok) setReports(await response.json())
  }

  useEffect(() => {
    loadStats()
    loadUsers()
    loadReports()
  }, [])

  async function handleRestrict(userId) {
    await fetch(`${API_URL}/admin/users/${userId}/restrict`, { method: "PUT", headers: authHeaders() })
    loadUsers()
    loadStats()
  }

  async function handleTempBan(userId) {
    await fetch(`${API_URL}/admin/users/${userId}/temp-ban`, { method: "PUT", headers: authHeaders() })
    loadUsers()
    loadStats()
  }

  async function handleUnrestrict(userId) {
    await fetch(`${API_URL}/admin/users/${userId}/unrestrict`, { method: "PUT", headers: authHeaders() })
    loadUsers()
    loadStats()
  }

  async function handleDelete(userId) {
    await fetch(`${API_URL}/admin/users/${userId}`, { method: "DELETE", headers: authHeaders() })
    loadUsers()
    loadStats()
  }

  async function handleResolveReport(reportId, action) {
    await fetch(`${API_URL}/reports/${reportId}/resolve`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ action }),
    })
    loadReports()
    loadUsers()
    loadStats()
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Users" value={stats.total_users} />
          <StatCard label="Total Posts" value={stats.total_posts} />
          <StatCard label="Restricted" value={stats.restricted} danger />
        </div>
      )}

      <div className="flex gap-4 border-b mb-4" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={() => setTab("reports")}
          className="pb-2 px-1 font-medium"
          style={{ borderBottom: tab === "reports" ? "2px solid var(--color-accent)" : "none" }}
        >
          Reports {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setTab("users")}
          className="pb-2 px-1 font-medium"
          style={{ borderBottom: tab === "users" ? "2px solid var(--color-accent)" : "none" }}
        >
          Users
        </button>
      </div>

      {tab === "users" ? (
        <UsersTab
          users={users}
          onRestrict={handleRestrict}
          onTempBan={handleTempBan}
          onUnrestrict={handleUnrestrict}
          onDelete={handleDelete}
        />
      ) : (
        <ReportsTab reports={reports} onResolve={handleResolveReport} />
      )}
    </div>
  )
}

export default Dashboard

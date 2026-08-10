import { useState, useEffect } from "react"

function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])

  async function loadStats() {
    const response = await fetch("http://127.0.0.1:8000/admin/stats", { headers: authHeaders() })
    if (response.ok) setStats(await response.json())
  }

  async function loadUsers() {
    const response = await fetch("http://127.0.0.1:8000/admin/users", { headers: authHeaders() })
    if (response.ok) setUsers(await response.json())
  }

  useEffect(() => {
    loadStats()
    loadUsers()
  }, [])

  async function handleRestrict(userId) {
    await fetch(`http://127.0.0.1:8000/admin/users/${userId}/restrict`, {
      method: "PUT",
      headers: authHeaders(),
    })
    loadUsers()
    loadStats()
  }

  async function handleDelete(userId) {
    await fetch(`http://127.0.0.1:8000/admin/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    loadUsers()
    loadStats()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Total Users</p>
            <p className="text-2xl font-bold">{stats.total_users}</p>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Total Posts</p>
            <p className="text-2xl font-bold">{stats.total_posts}</p>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Restricted</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-danger)" }}>{stats.restricted}</p>
          </div>
        </div>
      )}

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
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={
                      u.status === "restricted"
                        ? { color: "var(--color-danger)", backgroundColor: "rgba(220,38,38,0.1)" }
                        : { color: "#15803d", backgroundColor: "rgba(21,128,61,0.1)" }
                    }
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleRestrict(u.id)}
                    disabled={u.status === "restricted"}
                    style={{ color: u.status === "restricted" ? "var(--color-muted)" : "var(--color-accent)" }}
                  >
                    Restrict
                  </button>
                  <button onClick={() => handleDelete(u.id)} style={{ color: "var(--color-danger)" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard

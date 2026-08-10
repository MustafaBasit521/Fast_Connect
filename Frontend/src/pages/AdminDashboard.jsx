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
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{stats.total_users}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Posts</p>
            <p className="text-2xl font-bold">{stats.total_posts}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Restricted</p>
            <p className="text-2xl font-bold text-red-600">{stats.restricted}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">
                  <span className={u.status === "restricted" ? "text-red-600 bg-red-50 px-2 py-1 rounded text-xs" : "text-green-700 bg-green-50 px-2 py-1 rounded text-xs"}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleRestrict(u.id)}
                    disabled={u.status === "restricted"}
                    className="text-blue-900 disabled:text-gray-300"
                  >
                    Restrict
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600">Delete</button>
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

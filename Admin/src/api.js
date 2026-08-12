export const API_URL = "https://fast-connect-bay.vercel.app"

export function authHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
}

export function getErrorMessage(data) {
  if (Array.isArray(data.detail)) {
    return data.detail.map((err) => err.msg).join(", ")
  }

  return data.detail || "Something went wrong"
}

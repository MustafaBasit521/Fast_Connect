export function getErrorMessage(data) {
  if (Array.isArray(data.detail)) {
    return data.detail.map((err) => err.msg).join(", ")
  }

  return data.detail || "Something went wrong"
}

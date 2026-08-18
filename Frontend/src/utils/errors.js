const FIELD_LABELS = {
  email: "Email",
  password: "Password",
  old_password: "Current password",
  new_password: "New password",
  name: "Name",
  bio: "Bio",
  phone: "Phone number",
  content: "Content",
}

function fieldLabel(loc) {
  const field = loc?.[loc.length - 1]
  if (typeof field !== "string") return "This field"
  return FIELD_LABELS[field] || field.replace(/_/g, " ")
}

function friendlyFieldError(err) {
  const label = fieldLabel(err.loc)
  const field = err.loc?.[err.loc.length - 1]

  if (err.type === "missing") {
    return `${label} is required.`
  }
  if (err.type === "string_too_short") {
    const min = err.ctx?.min_length
    return `${label} must be at least ${min} character${min === 1 ? "" : "s"} long.`
  }
  if (err.type === "string_too_long") {
    const max = err.ctx?.max_length
    return `${label} must be at most ${max} characters long.`
  }
  if (field === "email" && err.msg?.toLowerCase().includes("email address")) {
    return "Please enter a valid email address."
  }

  const cleaned = (err.msg || "Invalid value").replace(/^Value error,\s*/i, "")
  return `${label}: ${cleaned}`
}

export function getErrorMessage(data) {
  if (Array.isArray(data.detail)) {
    return data.detail.map(friendlyFieldError).join(" ")
  }

  return data.detail || "Something went wrong"
}

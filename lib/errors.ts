export function toFriendlyError(message: string, status?: number): string {
  const msg = (message || "").toLowerCase()
  if (status === 401 || msg.includes("unauthorized") || msg.includes("invalid login")) {
    return "Sign-in failed. Check your email and password."
  }
  if (msg.includes("confirm") && msg.includes("email")) {
    return "Please confirm your email to continue. Check your inbox or resend the confirmation."
  }
  if (msg.includes("rate limit") || msg.includes("too many requests") || status === 429) {
    return "Too many requests. Please try again shortly."
  }
  if (msg.includes("network") || msg.includes("fetch failed") || msg.includes("timeout")) {
    return "Network error. Please check your connection and try again."
  }
  if (msg.includes("supabase") || msg.includes("database") || msg.includes("server")) {
    return "Something went wrong on our side. Please try again."
  }
  if (status && status >= 500) {
    return "Service is temporarily unavailable. Please try again later."
  }
  return "Something went wrong. Please try again."
}



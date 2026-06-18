// ============================================================
// api.js — every fetch call to your backend goes through here.
//
// Why one file? So you never repeat "add the token, parse JSON,
// throw on error" logic in every component. Components call
// api.login(...), api.getCourses(...) etc and just deal with
// plain JS objects.
// ============================================================

// Change this if your backend runs on a different port.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Your JWT is stored in localStorage after login.
// localStorage persists even after the tab is closed.
function getToken() {
  return localStorage.getItem('token')
}

// The core function. Every api.* call below uses this.
async function request(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // If we have a token, attach it as a Bearer token.
  // Your `authenticate` middleware reads this header.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Your backend always responds with JSON (even errors),
  // so we can safely parse it here.
  const data = await res.json()

  // res.ok is true for status 200-299.
  // If the backend sent an error status, throw so the
  // calling component can catch it and show a message.
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Something went wrong')
  }

  return data
}

// ------------------------------------------------------------
// Every endpoint your backend exposes, wrapped in a simple
// function. Adjust the paths/body shapes here if your routes
// differ slightly — this is the ONLY place that needs to change.
// ------------------------------------------------------------
export const api = {
  // --- Auth ---
  register: (email, password) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // --- Courses ---
  getCourses: () => request('/courses'),

  getCourse: (id) => request(`/courses/${id}`),

  createCourse: (course) =>
    request('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    }),

  // --- Sessions / Messages ---
  getSessions: (courseId) => request(`/courses/${courseId}/sessions`),

  getMessages: (sessionId) => request(`/sessions/${sessionId}/messages`),

  sendMessage: (sessionId, content) =>
    request(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  endSession: (sessionId) =>
    request(`/sessions/${sessionId}`, {
      method: 'PATCH',
    }),
}

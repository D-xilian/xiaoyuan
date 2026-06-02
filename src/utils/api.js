const API_BASE_URL = '/api'

export function getAuthHeaders() {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    return {
      'Content-Type': 'application/json',
      'X-User-ID': userData.id.toString()
    }
  }
  return {
    'Content-Type': 'application/json'
  }
}

export async function apiGet(url) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  return response
}

export async function apiPost(url, data, method = 'POST') {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: method,
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  return response
}

export async function apiPut(url, data) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  return response
}

export async function apiDelete(url) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return response
}

export async function getUnreadCount() {
  const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  return response
}

export async function getNotifications(page = 1) {
  const response = await fetch(`${API_BASE_URL}/notifications?page=${page}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  return response
}

export async function markNotificationRead(id) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  return response
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  return response
}

export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function isLoggedIn() {
  return !!localStorage.getItem('user')
}

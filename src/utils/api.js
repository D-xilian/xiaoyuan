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
  
  // 检查响应是否为JSON
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    // 如果不是JSON，尝试读取文本内容并返回错误
    const text = await response.text()
    return {
      ok: false,
      status: response.status,
      json: async () => ({ message: `服务器返回非JSON响应: ${text.substring(0, 100)}...` })
    }
  }
  
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

// 检查用户是否为管理员
export function isAdmin() {
  const user = getCurrentUser()
  return user && user.role === 'admin'
}

// 检查用户是否为普通用户
export function isUser() {
  const user = getCurrentUser()
  return user && user.role === 'user'
}

// 获取用户角色
export function getUserRole() {
  const user = getCurrentUser()
  return user ? user.role : null
}

// 管理员API调用
export async function adminApiGet(url) {
  if (!isAdmin()) {
    return {
      ok: false,
      status: 403,
      json: async () => ({ message: '无权限访问，需要管理员权限' })
    }
  }
  return await apiGet(url)
}

export async function adminApiPost(url, data) {
  if (!isAdmin()) {
    return {
      ok: false,
      status: 403,
      json: async () => ({ message: '无权限访问，需要管理员权限' })
    }
  }
  return await apiPost(url, data)
}

export async function adminApiPut(url, data) {
  if (!isAdmin()) {
    return {
      ok: false,
      status: 403,
      json: async () => ({ message: '无权限访问，需要管理员权限' })
    }
  }
  return await apiPut(url, data)
}

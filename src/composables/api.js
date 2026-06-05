const API = 'https://2fa.miqi1916.workers.dev'

export async function apiCall(path, data) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(data || {}),
  })
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

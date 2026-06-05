export function cleanSecret(s) {
  s = (s || '').trim()
  if (s.startsWith('otpauth://')) {
    try {
      const u = new URL(s)
      s = u.searchParams.get('secret') || ''
    } catch {}
  }
  return s.replace(/[\s-]/g, '').toUpperCase()
}

function base32ToBytes(base32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  const out = []
  base32 = cleanSecret(base32).replace(/=+$/, '')
  for (const c of base32) {
    const v = chars.indexOf(c)
    if (v < 0) throw new Error('密钥格式错误')
    bits += v.toString(2).padStart(5, '0')
  }
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    out.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return new Uint8Array(out)
}

export async function makeCode(secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    base32ToBytes(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const counter = Math.floor(Date.now() / 30000)
  const buf = new ArrayBuffer(8)
  new DataView(buf).setUint32(4, counter)
  const hash = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf))
  const offset = hash[hash.length - 1] & 15
  const bin =
    ((hash[offset] & 127) << 24) |
    (hash[offset + 1] << 16) |
    (hash[offset + 2] << 8) |
    hash[offset + 3]
  return String(bin % 1_000_000).padStart(6, '0')
}

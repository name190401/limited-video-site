const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function readEnvOptional(name) {
  // ファイルごと無い場合も null。CI など .env.local を置かない環境で throw しないため。
  const file = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(file)) return null
  const match = fs.readFileSync(file, 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'))
  return match ? match[1].trim() : null
}

function readEnv(name) {
  const value = readEnvOptional(name)
  if (value === null) throw new Error(`${name} is not set in .env.local`)
  return value
}

function todayCode(offsetDays = 0) {
  const jst = new Date(Date.now() + (9 * 60 * 60 + offsetDays * 24 * 60 * 60) * 1000)
  const date = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, '0')}-${String(jst.getUTCDate()).padStart(2, '0')}`
  const hash = crypto.createHash('sha256').update(readEnv('PASSWORD_SECRET_KEY') + date + '0').digest('hex')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[parseInt(hash.slice(i * 2, i * 2 + 2), 16) % chars.length]
  return code
}

async function postLogin(page, BASE, password) {
  await page.goto(`${BASE}/enter`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  return page.evaluate(async (value) => {
    const response = await fetch('/api/auth/layer1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: value }),
    })
    return response.status
  }, password)
}

function loginAsMember(page, BASE) {
  return postLogin(page, BASE, todayCode())
}

function loginAsAdmin(page, BASE) {
  // settings.admin_password に行がある環境では、そちらが ADMIN_PASSWORD より正本になる。
  return postLogin(page, BASE, readEnv('ADMIN_PASSWORD'))
}

module.exports = { todayCode, loginAsMember, loginAsAdmin, readEnv, readEnvOptional }

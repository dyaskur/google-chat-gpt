import {query} from './client'
import {CreateUserInput} from './user.types'

export async function getUser(userId: number) {
  try {
    const {rows} = await query(`SELECT * FROM users WHERE id = $1`, [userId])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const {rows} = await query(`SELECT id FROM users WHERE email = $1`, [email])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function getUserIntegrationByEmail(email: string) {
  try {
    const {rows} = await query(`SELECT * FROM user_integrations WHERE external_email = $1`, [email])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user by email:', error, email)
    throw error
  }
}

export async function getUserIntegrationByUid(uid: string) {
  try {
    const {rows} = await query(`SELECT * FROM user_integrations WHERE external_id = $1`, [uid])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user by uid:', error, uid)
    throw error
  }
}

export async function createOrGetUser(data: CreateUserInput) {
  const existingUser = await getUserByEmail(data.email)
  console.log(existingUser, 'existingUser')
  if (existingUser) {
    return existingUser.id
  }
  const {email, displayName} = data
  const password = '' // google chat app doesnt need password
  const user = await query(`INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id`, [
    email,
    password,
    displayName,
  ])
  return user.rows[0].id
}

export async function createUserIntegration(data: CreateUserInput) {
  const userId = await createOrGetUser(data)
  const metadata = JSON.stringify({
    ...data.metadata,
    avatarUrl: data.avatarUrl,
    displayName: data.displayName,
    type: data.type,
    domainId: data.domainId,
  })
  const userIntegration = await query(
    `INSERT INTO user_integrations (user_id, external_email, external_id, metadata) VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, data.email, data.name, metadata],
  )
  return userIntegration.rows[0].id
}

export async function getUserCoins(userId: bigint) {
  try {
    const {rows} = await query(`SELECT coin_balance FROM users WHERE id = $1`, [userId])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user coins:', error)
    throw error
  }
}

export async function deductUserCoins(userId: bigint, amount: number) {
  try {
    const {rows} = await query(
      `UPDATE users SET coin_balance = coin_balance - $1 WHERE id = $2 RETURNING coin_balance`,
      [amount, userId],
    )
    return rows[0]
  } catch (error) {
    console.error('Error update user coins:', error)
    throw error
  }
}

export async function addUserCoins(userId: bigint, amount: number) {
  try {
    const {rows} = await query(
      `UPDATE users SET coin_balance = coin_balance + $1 WHERE id = $2 RETURNING coin_balance`,
      [[amount, userId]],
    )
    return rows[0]
  } catch (error) {
    console.error('Error fetching user coins:', error)
    throw error
  }
}

export async function addCoinTransaction(userId: bigint, amount: number, type: string, description: string = '') {
  try {
    const {rows} = await query(
      `INSERT INTO user_coin_transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, amount, type, description],
    )
    return rows[0]
  } catch (error) {
    console.error('Error fetching user coins:', error)
    throw error
  }
}

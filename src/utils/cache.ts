import type {RedisClientType} from 'redis'
import {createClient} from 'redis'
import {getUserIntegrationByEmail, getUserIntegrationByUid} from '../db/user'

let redisClient: RedisClientType | null = null
let isReady = false

const cacheOptions = {
  url: process.env.REDIS_URI,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 3) {
        console.error('Redis reconnect failed after 3 attempts.')
        return new Error('Retry attempts exceeded')
      }
      console.info(`Redis reconnect attempt #${retries}`)
      return Math.min(retries * 50, 750) // Exponential backoff with a max delay of 0.75 seconds
    },
  },
}

export async function getCache(): Promise<RedisClientType> {
  if (redisClient && isReady) return redisClient

  if (!redisClient) {
    redisClient = createClient(cacheOptions)

    redisClient.on('error', (err) => console.error(`Redis Error: ${err}`))
    redisClient.on('connect', () => console.debug('Redis connected'))
    // redisClient.on('reconnecting', () => console.info('Redis reconnecting'))
    redisClient.on('ready', () => {
      isReady = true
      console.debug('Redis ready!')
    })
  }

  try {
    await redisClient.connect()
    return redisClient
  } catch (err) {
    console.error('Redis connection failed:', err)
    throw new Error('Failed to connect to Redis')
  }
}

export async function getUser(email: string): Promise<string | null> {
  const cache = await getCache()
  const userId = await cache.get(email)
  if (userId !== null) return userId

  const user = await getUserIntegrationByEmail(email)
  if (!user) return null
  cache.set(email, user.user_id).catch((err) => console.error(`Failed to cache user: ${err}`))
  return user.user_id
}

export async function getDefaultModel(userId: string): Promise<string | null> {
  const cache = await getCache()
  const model = await cache.get(`default_model_${userId}`)
  if (model !== null) return model
  const user = await getUserIntegrationByUid(userId)
  if (!user) return null
  cache
    .set(`default_model_${userId}`, user.default_model || '138')
    .catch((err) => console.error(`Failed to cache default model: ${err}`))
  return user.default_model
}

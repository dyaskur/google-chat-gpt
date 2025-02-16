import type {RedisClientType} from 'redis'
import {createClient} from 'redis'

let redisClient: RedisClientType
let isReady: boolean

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

async function getCache(): Promise<RedisClientType> {
  if (!isReady) {
    redisClient = createClient({
      ...cacheOptions,
    })
    redisClient.on('error', (err) => console.error(`Redis Error: ${err}`))
    redisClient.on('connect', () => console.debug('Redis connected'))
    // redisClient.on('reconnecting', () => console.info('Redis reconnecting'))
    redisClient.on('ready', () => {
      isReady = true
      console.debug('Redis ready!')
    })
    await redisClient.connect()
  }
  return redisClient
}
export {getCache}

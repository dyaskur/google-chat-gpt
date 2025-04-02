import {CreateUserInput} from './db/user.types'

const API_BASE_URL = process.env.API_BASE_URL

const fetchWithRetry = async (url: string, options: globalThis.RequestInit | undefined, retries = 3, delay = 500) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Retrying request... attempt ${attempt + 1}`)
        await new Promise((res) => setTimeout(res, delay * Math.pow(2, attempt))) // Exponential backoff
      } else {
        throw error
      }
    }
  }
}

export const createUser = async (data: CreateUserInput): Promise<string> => {
  const responseJson = await fetchWithRetry(API_BASE_URL + '/users', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.displayName,
      email: data.email,
      external_id: data.name,
      platform: 'google_chat',
      metadata: data.metadata,
      space: data.space,
    }),
  })

  console.log('create_user', responseJson)
  return responseJson.data.id
}

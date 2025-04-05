import {chat, auth} from '@googleapis/chat'
import {chat_v1} from '@googleapis/chat/v1'

/**
 * Create google api credentials
 *
 * @returns {chat_v1.Chat} google.chat
 */
function gAuth(): chat_v1.Chat {
  // Use default credentials (service account)
  const credentials = new auth.GoogleAuth({
    // keyFile: path.join(__dirname, '../../tests/creds.json'),
    scopes: ['https://www.googleapis.com/auth/chat.bot'],
  })

  return chat({
    version: 'v1',
    auth: credentials,
  })
}

export async function callMessageApi(action: string, request: object) {
  const chatApi = gAuth()
  let response

  try {
    if (action === 'create') {
      response = await chatApi.spaces.messages.create(request)
    } else if (action === 'update') {
      response = await chatApi.spaces.messages.update(request)
    } else if (action === 'get') {
      response = await chatApi.spaces.messages.get(request)
    } else {
      throw new Error(`Unsupported action: ${action}`)
    }
  } catch (error) {
    // @ts-ignore: all error should have this method
    const errorMessage: string = error.message ?? error.toString() ?? 'Unknown error'
    console.error('Error:', action, JSON.stringify(request), response, errorMessage)
    response = {status: 444, statusText: errorMessage, data: {}}
  }

  if (!response) {
    throw new Error('Empty response')
  }

  return response
}

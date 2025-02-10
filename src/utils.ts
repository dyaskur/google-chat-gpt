import {ChatResponse} from './types/response'

export function createMessageResponse(text: string): ChatResponse {
  return {
    hostAppDataAction: {
      chatDataAction: {
        createMessageAction: {
          message: {
            text,
          },
        },
      },
    },
  }
}

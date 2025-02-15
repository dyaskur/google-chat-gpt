// Input text containing special characters
import {createMessageResponse} from '../src/utils'
import {ChatResponse} from '../src/types/response'

// Function returns ChatResponse object with correct nested structure
it('should return ChatResponse with nested message structure when given text', () => {
  const text = 'Hello world'

  const result: ChatResponse = createMessageResponse(text)

  expect(result).toEqual({
    hostAppDataAction: {
      chatDataAction: {
        createMessageAction: {
          message: {
            text: 'Hello world',
          },
        },
      },
    },
  })
})
it('should handle text with special characters correctly', () => {
  const text = '!@#$%^&*()_+ <>'

  const result: ChatResponse = createMessageResponse(text)

  expect(result.hostAppDataAction.chatDataAction.createMessageAction?.message.text).toBe('!@#$%^&*()_+ <>')
})

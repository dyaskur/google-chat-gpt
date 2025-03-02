// Input text containing special characters
import {createMessageResponse, formatForGoogleChat} from '../src/utils/chat'
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

it('should successfully format markdown', () => {
  const input = `
# Step 1: Define the Object Type
## Step 2: Implement the Methods
### Step 3: Test the Functions
**Bold Text**
*Italic Text*
\`Inline Code\`
\`\`\`
Code Block
\`\`\`
\`\`\`typescript
TS Code Block
\`\`\`
> Blockquote
*incompletebold
[Google](https://google.com)
`
  const expected = `
*Step 1: Define the Object Type*
*Step 2: Implement the Methods*
*Step 3: Test the Functions*
*Bold Text*
_Italic Text_
\`Inline Code\`
\`\`\`
Code Block
\`\`\`
\`\`\`
TS Code Block

\`\`\`
> Blockquote
*incompletebold
<https://google.com|Google>
`
  const result = formatForGoogleChat(input)
  expect(result).toBe(expected)
})
// Handle incomplete/malformed markdown syntax
it('should leave text unchanged when bold syntax is incomplete', () => {
  const input = '*test bold'

  const result = formatForGoogleChat(input)
  expect(result).toBe(input)
})

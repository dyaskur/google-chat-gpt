import {ActionCard, ChatResponse} from '../types/response'
import {chat_v1} from '@googleapis/chat'
import Schema$CardWithId = chat_v1.Schema$CardWithId
import Schema$GoogleAppsCardV1Card = chat_v1.Schema$GoogleAppsCardV1Card

export function createActionResponse(): ChatResponse {
  return {
    hostAppDataAction: {
      chatDataAction: {
        createMessageAction: {
          message: {
            text: 'please login first',
            actionResponse: {
              type: 'REQUEST_CONFIG',
              url: 'https://yaskur.com/',
            },
          },
        },
      },
    },
  }
}

export function createMessageResponse(text?: string, cardsV2?: Schema$CardWithId[]): ChatResponse {
  return {
    hostAppDataAction: {
      chatDataAction: {
        createMessageAction: {
          message: {
            text,
            cardsV2,
          },
        },
      },
    },
  }
}

export function createActionDialog(card: Schema$GoogleAppsCardV1Card): ActionCard {
  return {
    action: {
      navigations: [
        {
          pushCard: card,
        },
      ],
    },
  }
}

export function formatForGoogleChat(text: string): string {
  return (
    text
      .replace(/^### (.*$)/gm, '🔥$1🔥') // H3: ### Heading -> *Heading*
      .replace(/^## (.*$)/gm, '🔥$1🔥') // H2: ## Heading -> *Heading*
      .replace(/^# (.*$)/gm, '🔥$1🔥') // H1: # Heading -> *Heading*
      .replace(/\*\*(.+?)\*\*/g, '🔥$1🔥') // Match only properly closed **bold**
      .replace(/\*(.*?)\*/g, '_$1_') // Italic: *text* -> _text_
      .replace(/🔥(.*?)🔥/g, '*$1*') // Bold: **text** -> *text*
      // .replace(/`([^`\n]+)`/g, '"$1"')  // Inline code: `code` -> "code"
      .replace(/```(\w+)\n([\s\S]+?)```/g, '```\n$2\n```') // Remove language from code block
      // .replace(/```([\s\S]+?)```/g, '```\n$1\n```') // Code block: ```code``` -> ```\ncode\n```
      .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<$2|$1>')
  )
}

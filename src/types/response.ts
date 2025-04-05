import {chat_v1} from '@googleapis/chat'
import Schema$CardWithId = chat_v1.Schema$CardWithId
import Schema$GoogleAppsCardV1Card = chat_v1.Schema$GoogleAppsCardV1Card

type MessageAction = {
  message: {
    text?: string
    actionResponse?: {
      type: string
      url?: string
    }
    cardsV2?: Schema$CardWithId[]
  }
}

type ChatDataAction = {
  createMessageAction?: MessageAction
  updateMessageAction?: MessageAction
  dialogAction?: MessageAction
}

type HostAppDataAction = {
  chatDataAction: ChatDataAction
}

export type ChatResponse = {
  hostAppDataAction: HostAppDataAction
}

export type ActionCard = {
  action: {
    navigations: {
      pushCard: Schema$GoogleAppsCardV1Card
    }[]
  }
}

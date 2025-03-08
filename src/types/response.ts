type MessageAction = {
  message: {
    text?: string
    actionResponse?: {
      type: string
      url?: string
    }
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

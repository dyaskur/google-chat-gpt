type MessageAction = {
  message: {
    text: string
  }
}

type ChatDataAction = {
  createMessageAction?: MessageAction
  updateMessageAction?: MessageAction
}

type HostAppDataAction = {
  chatDataAction: ChatDataAction
}

export type ChatResponse = {
  hostAppDataAction: HostAppDataAction
}

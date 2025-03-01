type AuthorizationEventObject = {
  systemIdToken: string
}

type TimeZone = {
  offset: number
  id: string
}

type CommonEventObject = {
  hostApp: string
  platform: string
  timeZone: TimeZone
  userLocale: string
}

type EventTime = {
  nanos: number
  seconds: number
}

export type User = {
  displayName: string
  type: 'HUMAN' | 'BOT'
  email: string
  avatarUrl: string
  name: string
  domainId: string
}

type AppCommandMetadata = {
  appCommandId: number
  appCommandType: string
}

type Space = {
  spaceHistoryState: 'HISTORY_ON' | 'HISTORY_OFF'
  spaceThreadingState: 'UNTHREADED_MESSAGES' | 'THREADED_MESSAGES'
  singleUserBotDm: boolean
  spaceUri: string
  type: 'DM' | 'ROOM'
  spaceType: 'DIRECT_MESSAGE' | 'SPACE'
  name: string
}

type AppCommandPayload = {
  message: Message
  appCommandMetadata: AppCommandMetadata
  space: Space
  configCompleteRedirectUri: string
}

type AddedToSpacePayload = {
  configCompleteRedirectUri: string
  space: Space
  interactionAdd: boolean
}

type MessagePayload = {
  configCompleteRedirectUri: string
  space: Space
  message: Message
  interactionAdd: boolean
}

type Chat = {
  eventTime: EventTime
  user: User
  appCommandPayload?: AppCommandPayload
  addedToSpacePayload?: AddedToSpacePayload
  messagePayload?: MessagePayload
}

export type ChatEvent = {
  authorizationEventObject: AuthorizationEventObject
  commonEventObject: CommonEventObject
  chat: Chat
}

type RetentionSettings = {
  state: 'PERMANENT' | 'TEMPORARY'
}

type Sender = {
  domainId: string
  email: string
  displayName: string
  name: string
  avatarUrl: string
  type: 'HUMAN' | 'BOT'
}

type Thread = {
  name: string
  retentionSettings: RetentionSettings
}

type Message = {
  sender: Sender
  thread: Thread
  argumentText: string
  formattedText: string
  messageHistoryState: 'HISTORY_ON' | 'HISTORY_OFF'
  name: string
  space: Space
  text: string
  retentionSettings: RetentionSettings
  createTime: EventTime
}

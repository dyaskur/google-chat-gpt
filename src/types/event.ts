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

export type EventTime = {
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

export type MembershipCount = {
  joinedDirectHumanUserCount: number
}

export type Space = {
  spaceHistoryState: 'HISTORY_ON' | 'HISTORY_OFF'
  spaceThreadingState: 'UNTHREADED_MESSAGES' | 'THREADED_MESSAGES'
  singleUserBotDm: boolean
  spaceUri: string
  type: 'DM' | 'ROOM'
  spaceType: 'DIRECT_MESSAGE' | 'SPACE'
  name: string
  displayName?: string
  membershipCount?: MembershipCount
  lastActiveTime?: EventTime
}

type AppCommandPayload = {
  message: Message
  appCommandMetadata: AppCommandMetadata
  space: Space
  configCompleteRedirectUri: string
  isDialogEvent?: boolean
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
type Timestamp = {
  seconds: number
  nanos: number
}
type MessageMetadata = {
  sender: string
  name: string
  createTime: Timestamp
  updateTime: Timestamp
}
type QuotedMessageMetadata = {
  name: string
  lastUpdateTime: Timestamp
}

type AttachmentDataRef = {
  resourceName: string
}

type Attachment = {
  contentName: string
  contentType: string
  attachmentDataRef: AttachmentDataRef
  name: string
  messageMetadata: MessageMetadata
  thumbnailUri: string
  source: string
  downloadUri: string
}

type Gif = {
  url: string
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
  quotedMessageMetadata?: QuotedMessageMetadata
  attachment?: Attachment[]
  attachedGifs?: Gif[]
}

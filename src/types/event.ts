type AuthorizationEventObject = {
  systemIdToken: string;
};

type TimeZone = {
  offset: number;
  id: string;
};

type CommonEventObject = {
  hostApp: string;
  platform: string;
  timeZone: TimeZone;
  userLocale: string;
};

type EventTime = {
  nanos: number;
  seconds: number;
};

type User = {
  displayName: string;
  type: string;
  email: string;
  avatarUrl: string;
  name: string;
  domainId: string;
};

type AppCommandMetadata = {
  appCommandId: number;
  appCommandType: string;
};

type Space = {
  spaceUri: string;
  spaceHistoryState: string;
  name: string;
  type: string;
  spaceType: string;
  displayName: string;
  spaceThreadingState: string;
};

type AppCommandPayload = {
  message: Record<string, unknown>;
  appCommandMetadata: AppCommandMetadata;
  space: Space;
  configCompleteRedirectUri: string;
};

type AddedToSpacePayload = {
  configCompleteRedirectUri: string;
  space: Space;
  interactionAdd: boolean;
};

type Chat = {
  eventTime: EventTime;
  user: User;
  appCommandPayload?: AppCommandPayload;
  addedToSpacePayload?: AddedToSpacePayload;
};

export type ChatEvent = {
  authorizationEventObject: AuthorizationEventObject;
  commonEventObject: CommonEventObject;
  chat: Chat;
};

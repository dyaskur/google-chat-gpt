import {Space} from '../types/event'

export type CreateUserInput = {
  email: string
  name: string
  avatarUrl?: string
  displayName?: string
  type?: 'HUMAN' | 'BOT'
  domainId?: string
  metadata?: object
  space?: Space
}

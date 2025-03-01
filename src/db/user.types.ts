export type CreateUserInput = {
  email: string
  name: string
  avatarUrl?: string
  displayName?: string
  type?: 'HUMAN' | 'BOT'
  domainId?: string
}

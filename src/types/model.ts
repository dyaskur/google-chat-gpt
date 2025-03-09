export interface AbangModel extends OpenrouterModel {
  straico?: {
    model?: string
    coins: string
    max_output: number
  }
  commandName?: string
  provider?: string
}

export type OpenrouterModel = {
  id: string
  name: string
  coins?: string
  description: string
  pricing: {
    prompt: string
    completion: string
    image: string
    request: string
  }
  context_length: number
}
export type StraicoModel = {
  name: string
  model: string
  pricing: {
    coins: string
  }
  max_output: number
}

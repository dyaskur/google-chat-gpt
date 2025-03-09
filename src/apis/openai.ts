export interface OpenAIOptions {
  apiKey?: string
  baseURL?: string
}

export interface CompletionRequest {
  model: string
  prompt: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string | string[]
}

export interface CompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {text: string; index: number; finish_reason: string}[]
  usage: {prompt_tokens: number; completion_tokens: number; total_tokens: number}
}

export class OpenAI {
  private apiKey: string
  private baseURL: string

  constructor(options: OpenAIOptions) {
    this.apiKey = options.apiKey || ''
    this.baseURL = options.baseURL || 'https://api.openai.com/v1'
  }

  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(`${this.baseURL}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`)
    }

    return response.json()
  }
}

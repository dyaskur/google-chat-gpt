const BASE_URL = 'https://api.straico.com/'
export type CompletionResponse = {
  data: {
    completion: {
      id: string
      model: string
      object: string
      created: number
      choices: {
        index: number
        message: {
          role: string
          content: string
        }
        finish_reason: string
      }[]
      usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
    }
    price: {
      input: number
      output: number
      total: number
    }
    words: {
      input: number
      output: number
      total: number
    }
  }
  success: boolean
}

// const models = {
//   'amazon/nova-lite-v1': 'Amazon: Nova Lite 1.0',
//   'amazon/nova-micro-v1': 'Amazon: Nova Micro 1.0',
//   'amazon/nova-pro-v1': 'Amazon: Nova Pro 1.0',
//   'anthropic/claude-3-haiku:beta': 'Anthropic: Claude 3.0 haiku',
//   'anthropic/claude-3-opus': 'Anthropic: Claude 3.0 opus',
//   'anthropic/claude-3-sonnet': 'Anthropic: Claude 3.0 sonnet',
//   'anthropic/claude-3-5-haiku-20241022': 'Anthropic: Claude 3.5 haiku',
//   'anthropic/claude-3.5-sonnet': 'Anthropic: Claude 3.5 sonnet',
// }

export const fetchCompletion = async (
  message: string,
  model: string = 'openai/gpt-4o-mini',
): Promise<CompletionResponse> => {
  const response = await fetch(BASE_URL + 'v0/prompt/completion', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRAICO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      message: message,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  console.log(data)
  return data
}

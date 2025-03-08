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

export const fetchCompletion = async (
  message: string,
  model: string = 'openai/gpt-4o-mini',
): Promise<CompletionResponse> => {
  console.log(message, model)
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

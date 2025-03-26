import {AbangModel} from '../types/model'
import {fetchCompletion} from './straico'
import {OpenAI, OpenAIOptions} from './openai'

const MODEL_URLS: Record<string, OpenAIOptions> = {
  openai: {
    baseURL: 'https://api.openai.com/v1/',
    apiKey: process.env.OPENAI_API_KEY!,
  },
  github: {
    baseURL: 'https://models.inference.ai.azure.com/',
    apiKey: process.env.GITHUB_API_KEY!,
  },
  google: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: process.env.GEMINI_API_KEY!,
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
}

type Provider = keyof typeof MODEL_URLS

export async function generateCompletionRequest(prompt: string, model: AbangModel, retry = 0): Promise<string> {
  try {
    if (model.straico && retry === 0) {
      const {data} = await fetchCompletion(prompt, model.straico.model ?? model.id)
      console.timeLog('process', 'straico price', data.price.total, 'coin')
      return data.completion.choices[0].message.content
    }

    const provider: Provider = retry > 0 ? ((model.provider as Provider) ?? 'openrouter') : 'openrouter'

    const openai = new OpenAI(MODEL_URLS[provider])
    const response = await openai.createCompletion({prompt, model: model.id})
    console.timeLog('process', 'price', response.usage.total_tokens, 'token')
    return response.choices[0].text
  } catch (error) {
    console.error(`Error generating completion (retry: ${retry}):`, error)

    if (retry < 1) {
      return generateCompletionRequest(prompt, model, retry + 1)
    }

    throw error
  }
}

import {AbangModel} from '../types/model'
import {fetchCompletion} from './straico'
import {OpenAI, OpenAIOptions} from './openai'
import {HourRange, isCurrentTimeInRanges} from '../utils/helpers'

const MODEL_URLS: Record<string, OpenAIOptions> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY!,
  },
  github: {
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey: process.env.GITHUB_API_KEY!,
  },
  google: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: process.env.GEMINI_API_KEY!,
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
}

const PEAK_HOURS: Record<string, HourRange[]> = {
  deepseek: [
    {
      start: '16:30',
      end: '00:30',
    },
  ],
}

type Provider = keyof typeof MODEL_URLS

export async function generateCompletionRequest(prompt: string, model: AbangModel, retry = 0): Promise<string> {
  try {
    // Peak hour is when provider gives a special discount
    const isPeakHour = isCurrentTimeInRanges(PEAK_HOURS[model.provider] ?? [])
    const shouldUseOriginalProvider = retry > 0 || isPeakHour || !model.straico

    const provider: Provider = shouldUseOriginalProvider ? (model.provider ?? 'openrouter') : 'openrouter'

    // Use Straico if configured and not retrying and not peak hour
    if (model.straico && retry === 0 && !isPeakHour) {
      const {data} = await fetchCompletion(prompt, model.straico.model ?? model.id)
      const content = data.completion.choices[0].message.content

      console.timeLog('process', 'straico price', data.price.total, 'coin', content.length, 'chars')
      return content
    }

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

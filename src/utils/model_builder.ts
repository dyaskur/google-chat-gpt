import * as fs from 'node:fs'
import commands from '../json/commands_by_model.json'

async function getStraicoModels() {
  const apiKey = process.env.STRAICO_API_KEY

  if (!apiKey) {
    throw new Error('Missing STRAICO_API_KEY')
  }
  const response = await fetch('https://api.straico.com/v0/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const data = await response.json()
    // console.log(data)
    return data.data
  }
  console.log(process.env.STRAICO_API_KEY)
  return []
}

async function getOpenrouterModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models')
  if (response.ok) {
    const data = await response.json()
    // console.log(data)
    return data.data
  }
  return []
}

function mapModelsByKey(models: StraicoModel[], key: keyof StraicoModel = 'model') {
  return models.reduce((acc: {[key: string]: StraicoModel}, model) => {
    acc[model[key] as string] = model
    return acc
  }, {})
}
interface AbangModel extends OpenrouterModel {
  straico?: {
    model?: string
    coins: string
    max_output: number
  }
  commandName?: string
}
type OpenrouterModel = {
  id: string
  name: string
  coins: string
  pricing: {
    prompt: string
    completion: string
    image: string
    request: string
  }
  context_length: number
}
type StraicoModel = {
  name: string
  model: string
  pricing: {
    coins: string
  }
  max_output: number
}

async function exportModels() {
  const straico: StraicoModel[] = await getStraicoModels()
  const straicoByModel = mapModelsByKey(straico)
  const openrouter: OpenrouterModel[] = await getOpenrouterModels()
  const result: AbangModel[] = []
  const models: {[key: number]: AbangModel} = {}
  for (const model of openrouter) {
    const abangModel: AbangModel = {
      ...model,
      commandName: model.id.replace(/-/g, '_').replace(/\//g, '-'),
    }
    if (straicoByModel[model.id]) {
      abangModel['straico'] = {
        coins: straicoByModel[model.id].pricing.coins,
        max_output: straicoByModel[model.id].max_output,
      }
    } else if (straicoByModel[model.id.split('/')[1]]) {
      abangModel['straico'] = {
        model: model.id.split('/')[1],
        coins: straicoByModel[model.id.split('/')[1]].pricing.coins,
        max_output: straicoByModel[model.id.split('/')[1]].max_output,
      }
    }
    result.push(abangModel)
    const commandsTyped = commands as {[key: string]: number}
    models[commandsTyped[model.id as string] as number] = abangModel
  }
  fs.writeFileSync('models_by_command_id.json', JSON.stringify(models))
  // generate commands
  // result.sort((a, b) => a.id.localeCompare(b.id))
  // const startIndex = 11
  // const commands = Object.fromEntries(result.map((item, index) => [item.id, startIndex + index]))
  // fs.writeFileSync('commands_by_model.json', JSON.stringify(commands, null, 2))
  // sort by prompt pricing
  result.sort((a, b) => a.pricing.prompt.localeCompare(b.pricing.prompt))
  const pricing = Object.fromEntries(
    result.map((item) => [
      item.id,
      {prompt: item.pricing.prompt, completion: item.pricing.completion, coins: item.straico?.coins},
    ]),
  )

  fs.writeFileSync('models_sorted_by_prompt_price.json', JSON.stringify(pricing))
  // sort by prompt pricing
  result.sort((a, b) => a.pricing.completion.localeCompare(b.pricing.completion))
  const completion = Object.fromEntries(
    result.map((item) => [
      item.id,
      {prompt: item.pricing.prompt, completion: item.pricing.completion, coins: item.straico?.coins},
    ]),
  )

  fs.writeFileSync('models_sorted_by_completion_price.json', JSON.stringify(completion))

  // console.log(result, 'result')
  // console.log(openrouter, 'openrouter')
  // console.log(mapModelsByKey(straico, 'model'), 'straico')
}

exportModels()

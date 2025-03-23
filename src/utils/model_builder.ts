import * as fs from 'node:fs'
import * as commands from '../json/commands_by_model.json'
import {AbangModel, OpenrouterModel, StraicoModel} from '../types/model'

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

async function exportModels() {
  const straico: StraicoModel[] = await getStraicoModels()
  const straicoByModel = mapModelsByKey(straico)
  const openrouter: OpenrouterModel[] = await getOpenrouterModels()
  const result: AbangModel[] = []
  const straicoModels: {[key: number]: object} = {}
  const models: {[key: number]: AbangModel} = {}
  for (const model of openrouter) {
    const abangModel: AbangModel = {
      ...model,
      commandName: '/' + model.id.replace(/-/g, '_').replace(/\//g, ':'),
      abangPricing: {
        completion: Math.round(Number(model.pricing.completion) * 350 * 20000),
        image: Math.round(Number(model.pricing.image) * 100 * 20000),
      },
    }
    const modelExploded = model.id.split('/')
    abangModel['provider'] = modelExploded[0]
    if (straicoByModel[model.id]) {
      abangModel['straico'] = {
        coins: straicoByModel[model.id].pricing.coins,
        max_output: straicoByModel[model.id].max_output,
      }
    } else if (straicoByModel[modelExploded[1]]) {
      abangModel['straico'] = {
        model: model.id.split('/')[1],
        coins: straicoByModel[modelExploded[1]].pricing.coins,
        max_output: straicoByModel[modelExploded[1]].max_output,
      }
    }
    result.push(abangModel)
    const commandsTyped = commands as {[key: string]: number}
    let commandId = commandsTyped[model.id as string] as number
    if (!commandId) {
      // random number
      commandId = Math.floor(Math.random() * 1000000)
    }

    if (abangModel.straico) {
      straicoModels[commandId] = {
        description: abangModel.description,
        name: abangModel.name,
        commandName: abangModel.commandName,
        commandId: commandId,
        straico: abangModel.straico,
      }
    }
    models[commandId] = abangModel
  }
  fs.writeFileSync('../json/models_by_command_id.json', JSON.stringify(models, null, 2))
  fs.writeFileSync('../json/simplified.json', JSON.stringify(straicoModels, null, 2))
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

  fs.writeFileSync('../json/models_sorted_by_prompt_price.json', JSON.stringify(pricing, null, 2))
  // sort by prompt pricing
  result.sort((a, b) => a.pricing.completion.localeCompare(b.pricing.completion))
  const completion = Object.fromEntries(
    result.map((item) => [
      item.id,
      {prompt: item.pricing.prompt, completion: item.pricing.completion, coins: item.straico?.coins},
    ]),
  )

  fs.writeFileSync('../json/models_sorted_by_completion_price.json', JSON.stringify(completion, null, 2))

  // console.log(result, 'result')
  // console.log(openrouter, 'openrouter')
  // console.log(mapModelsByKey(straico, 'model'), 'straico')
}

exportModels()

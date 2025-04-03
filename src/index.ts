import {HttpFunction} from '@google-cloud/functions-framework'
import {ChatEvent, Space} from './types/event'
import {createActionResponse, createMessageResponse} from './utils/chat'
import * as fs from 'node:fs'
import {getCache, getDefaultModel, getUser} from './utils/cache'
import {CreateUserInput} from './db/user.types'
import * as commands from './json/models_by_command_id.json'
import {AbangModel} from './types/model'
import {createUser} from './api'
import {generateCompletionWithCoins} from './services'
import {addSpaceUser, getSpaceUser} from './db/team'

const commandsTyped = commands as {[key: string]: object}

export const app: HttpFunction = async (req, res) => {
  console.time('process')

  if (!(req.method === 'POST' && req.body)) {
    console.log('unknown access', req.hostname, req.ips.join(','), req.method, JSON.stringify(req.body))
    const cache = await getCache()
    await cache.set('test', 'test 123 sdfsd dsf sdf ')
    console.log(await cache.get('test'), process.env.DATABASE_URL)
    fs.readdir('./node_modules', (err, files) => {
      if (err) {
        res.status(500).send('Error reading node_modules')
      } else {
        res.status(200).send(files.join('\n'))
      }
    })
    // res.status(400).send('')
  } else {
    const event: ChatEvent = req.body

    if (event) {
      console.timeLog('process', JSON.stringify(event))
    }
    const displayName = event.chat.user.displayName
    const email = event.chat.user.email
    const space = event.chat.messagePayload?.space

    let userId = await getUser(email)
    if (!userId) {
      const userData: CreateUserInput = {
        email,
        name: event.chat.user.name,
        displayName: displayName,
        type: event.chat.user.type,
        avatarUrl: event.chat.user.avatarUrl,
        domainId: event.chat.user.domainId,
        metadata: event.commonEventObject,
      }
      if (space && space.type === 'ROOM') {
        userData.space = space as Space
      }
      // userId = await createUserIntegration(userData)
      userId = await createUser(userData)
      console.timeLog('process', 'a new registered user', userId)
      if (!userId) {
        res.status(500).send('Error creating user')
      }
    } else if (space && space.type === 'ROOM') {
      const spaceUser = await getSpaceUser(space.name, Number(userId))
      if (!spaceUser.user_id) {
        addSpaceUser(Number(spaceUser.id), Number(userId)).catch((err) =>
          console.error(`Failed to add user to space: ${err}`),
        )
      }
    }

    console.timeLog('process', event.chat.appCommandPayload, event.chat.addedToSpacePayload, event.chat.messagePayload)
    // const user = event.chat.user
    if (event.chat.addedToSpacePayload) {
      res.json(createMessageResponse('Hi, thanks for install my app'))
    } else if (event.chat.appCommandPayload) {
      const commandId = event.chat.appCommandPayload.appCommandMetadata.appCommandId
      if (commandId) {
        const commandModel: AbangModel = commandsTyped[commandId.toString()] as AbangModel
        const messageText = event.chat.appCommandPayload?.message?.argumentText
        if (!commandModel) {
          res.json(createMessageResponse('Sorry, this command is not supported yet'))
        } else if (!messageText) {
          res.json(createMessageResponse('Please give me a context'))
        } else {
          const response = await generateCompletionWithCoins(messageText, commandModel, userId, displayName)
          res.json(createMessageResponse(response))
        }
      } else {
        res.json(createMessageResponse('unknown command'))
      }
    } else if (event.chat.messagePayload) {
      const message = event.chat.messagePayload.message

      if (message.attachment) {
        res.json(
          createMessageResponse(
            `Currently, we don't support attachments. 
            We will try to support them in the future.  
            But for now, please only send text only`,
          ),
        )
      } else if (message.quotedMessageMetadata) {
        //todo: request auth to user and then get quoted message using the new token
        res.json(createActionResponse())
      } else {
        const messageText = event.chat.messagePayload.message.text
        const defaultModel = await getDefaultModel(event.chat.user.name)
        const commandModel: AbangModel = commandsTyped[defaultModel || '138'] as AbangModel

        const response = await generateCompletionWithCoins(messageText, commandModel, userId, displayName)
        res.json(createMessageResponse(response))
      }
    } else {
      res.json(createMessageResponse('Hi, what can I do for you?'))
    }
  }
}

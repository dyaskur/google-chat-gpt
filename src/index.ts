import {HttpFunction} from '@google-cloud/functions-framework'
import {ChatEvent} from './types/event'
import {createActionResponse, createMessageResponse, formatForGoogleChat} from './utils/chat'
import * as fs from 'node:fs'
import {getCache, getUser} from './utils/cache'
import {fetchCompletion} from './apis/straico'
import {createUserIntegration} from './db/user'
import {CreateUserInput} from './db/user.types'
import * as commands from './json/models_by_command_id.json'
import {AbangModel} from './types/model'

export const app: HttpFunction = async (req, res) => {
  if (!(req.method === 'POST' && req.body)) {
    console.log('unknown access', req.hostname, req.ips.join(','), req.method, JSON.stringify(req.body))
    const cache = await getCache()
    await cache.set('test', 'test 123 sdfsd dsf sdf ')
    console.log(await cache.get('test'), process.env.DATABASE_URL)
    fs.readdir('./node_modules', (err, files) => {
      if (err) {
        res.status(500).send('Error reading node_modules')
      } else {
        // console.log(files.join('\n'))
        res.status(200).send(files.join('\n'))
      }
    })
    // res.status(400).send('')
  } else {
    const event: ChatEvent = req.body

    if (event) {
      console.log(JSON.stringify(event))
    }

    const email = event.chat.user.email
    let userId = await getUser(email)
    if (!userId) {
      const userData: CreateUserInput = {
        email,
        name: event.chat.user.name,
        displayName: event.chat.user.name,
        type: event.chat.user.type,
        avatarUrl: event.chat.user.avatarUrl,
        domainId: event.chat.user.domainId,
      }
      userId = await createUserIntegration(userData)
      console.log('a new registered user', userId)
    }
    console.log(event.chat.appCommandPayload, event.chat.addedToSpacePayload, event.chat.messagePayload)
    // const user = event.chat.user
    if (event.chat.addedToSpacePayload) {
      res.json(createMessageResponse('Hi, thanks for install my app'))
    } else if (event.chat.appCommandPayload) {
      const commandId = event.chat.appCommandPayload.appCommandMetadata.appCommandId
      console.log('commandId', commandId)
      if (commandId) {
        const commandsTyped = commands as {[key: string]: object}
        const commandModel: AbangModel = commandsTyped[commandId.toString()] as AbangModel
        console.log(commandModel)
        const messageText = event.chat.appCommandPayload?.message?.argumentText
        if (!commandModel) {
          res.json(createMessageResponse('Sorry, this command is not supported yet'))
        } else if (!messageText) {
          res.json(createMessageResponse('Please give me a context'))
        } else {
          const model: string = commandModel?.straico?.model ?? commandModel.id
          try {
            // @ts-ignore
            const response = await fetchCompletion(messageText, model)
            res.json(createMessageResponse(formatForGoogleChat(response.data.completion.choices[0].message.content)))
          } catch (error) {
            res.json(
              createMessageResponse(
                'Sorry, something went wrong, please try again later or if the problem persists, contact support',
              ),
            )
            console.error('An error occurred:', (error as Error).message, messageText, model)
          }
        }
      } else {
        res.json(createMessageResponse('unknown command'))
      }
    } else if (event.chat.messagePayload) {
      const message = event.chat.messagePayload.message

      if (message.attachment) {
        res.json(
          createMessageResponse(
            "Currently, we don't support attachments. " +
              'We will try to support them in the future.  ' +
              'But for now pLease only send text only',
          ),
        )
      } else if (message.quotedMessageMetadata) {
        //todo: request auth to user and then get quoted message using the new token
        res.json(createActionResponse())
      } else {
        const messageText = event.chat.messagePayload.message.text
        const response = await fetchCompletion(messageText)
        res.json(createMessageResponse(formatForGoogleChat(response.data.completion.choices[0].message.content)))
      }
    } else {
      res.json(createMessageResponse('Hi, what can I do for you?'))
    }
  }
}

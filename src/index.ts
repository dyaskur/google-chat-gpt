import {HttpFunction} from '@google-cloud/functions-framework'
import {ChatEvent} from './types/event'
import {createMessageResponse} from './utils'
import * as fs from 'node:fs'
import client, {connectDB, disconnectDB} from './db/client'
import {getCache} from './utils/cache'
import {getCache, getUser} from './utils/cache'
import {createUserIntegration} from './db/user'
import {CreateUserInput} from './db/user.types'

export const app: HttpFunction = async (req, res) => {
  if (!(req.method === 'POST' && req.body)) {
    console.log('unknown access', req.hostname, req.ips.join(','), req.method, JSON.stringify(req.body))
    await connectDB() // Connect to DB
    const cache = await getCache()
    await cache.set('test', 'test 123 sdfsd dsf sdf ')
    console.log(await cache.get('test'), process.env.DATABASE_URL)
    const result = await client.query('SELECT NOW()')
    console.log('Current Time:', result.rows[0])

    await disconnectDB()
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
    // const user = event.chat.user
    if (event.chat.addedToSpacePayload) {
      res.json(createMessageResponse('Hi, thanks for install my app'))
    } else {
      res.json(createMessageResponse('Hi, what can I do for you?'))
    }
  }
}

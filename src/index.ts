import {HttpFunction} from '@google-cloud/functions-framework'
import {ChatEvent} from './types/event'
import {createMessageResponse} from './utils'
import * as fs from 'node:fs'

export const app: HttpFunction = async (req, res) => {
  if (!(req.method === 'POST' && req.body)) {
    console.log('unknown access', req.hostname, req.ips.join(','), req.method, JSON.stringify(req.body))
    fs.readdir('./node_modules', (err, files) => {
      if (err) {
        res.status(500).send('Error reading node_modules')
      } else {
        console.log(files.join('\n'))
        res.status(200).send(files.join('\n'))
      }
    })
    // res.status(400).send('')
  } else {
    const event: ChatEvent = req.body

    if (event) {
      console.log(JSON.stringify(event))
    }

    if (event.chat.addedToSpacePayload) {
      res.json(createMessageResponse('Hi, thanks for install my app'))
    } else {
      res.json(createMessageResponse('Hi, what can I do for you?'))
    }
  }
}

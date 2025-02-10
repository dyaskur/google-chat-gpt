import {HttpFunction} from '@google-cloud/functions-framework'
import {ChatEvent} from './types/event'
import {createMessageResponse} from './utils'

export const app: HttpFunction = async (req, res) => {
  if (!(req.method === 'POST' && req.body)) {
    console.log('unknown access', req.hostname, req.ips.join(','), req.method, JSON.stringify(req.body))
    res.status(400).send('')
  }
  const event: ChatEvent = req.body
  if (event) {
    console.log(JSON.stringify(event))
  }

  if (event.chat.addedToSpacePayload) {
    res.json(createMessageResponse('Hi, thanks for install my app' ))
  }

  res.json(createMessageResponse('Hi, what can I do for you?'))

}



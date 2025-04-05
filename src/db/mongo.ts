import {MongoClient, ObjectId, Db, Collection, FindOptions} from 'mongodb'

const COSMOS_CONNECTION_STRING = process.env.MONGO_URL || ''
const DATABASE_NAME = 'abang'
const COLLECTION_NAME = 'chat'

export interface ChatHistory {
  _id?: ObjectId
  user_id: number
  role: string
  model: string
  message: string
  created_at: Date
}

export class MongoHelper {
  private client: MongoClient
  private db: Db
  private collection: Collection<ChatHistory>

  constructor() {
    this.client = new MongoClient(COSMOS_CONNECTION_STRING)
    this.db = this.client.db(DATABASE_NAME)
    this.collection = this.db.collection<ChatHistory>(COLLECTION_NAME)
  }

  async insertOne(data: ChatHistory): Promise<string> {
    await this.client.connect()
    const result = await this.collection.insertOne(data)
    return result.insertedId.toString()
  }

  async findOneById(user_id: string): Promise<ChatHistory | null> {
    await this.client.connect()
    return await this.collection.findOne({_id: new ObjectId(user_id)} as any)
  }

  async findAllSorted(userId: string, limit?: number, sortOrder: 'asc' | 'desc' = 'desc'): Promise<ChatHistory[]> {
    await this.client.connect()
    const query = {user_id: Number(userId)}
    const sortDirection = sortOrder === 'asc' ? 1 : -1
    const options: FindOptions = {sort: {created_at: sortDirection}, ...(limit && {limit})}
    return this.collection.find(query, options).toArray()
  }
  async close() {
    await this.client.close()
  }
}

export async function test() {
  const chatDb = new MongoHelper()
  const newChat: ChatHistory = {user_id: 1, role: 'user', model: 'gpt4.0', message: 'hello', created_at: new Date()}
  const userId = await chatDb.insertOne(newChat)
  console.log('Inserted User ID:', userId)
  const history = await chatDb.findAllSorted(String(1060046125828341760))
  console.log('history', history)
  await chatDb.close()
}

// test()

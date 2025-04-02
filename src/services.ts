import {addCoinTransaction, addUserCoins, deductUserCoins} from './db/user'
import {getCachedUserCredits, setUserCreditsCache} from './utils/cache'
import {generateCompletionRequest} from './apis/router'
import {formatForGoogleChat} from './utils/chat'
import {AbangModel} from './types/model'

export async function generateCompletionWithCredits(messageText: string, commandModel: AbangModel, userId: string) {
  const currentCredits = await getCachedUserCredits(BigInt(userId))
  const price = commandModel.abangPricing.completion

  if (currentCredits < price) {
    return "Sorry, you don't have enough credits"
  }
  const remainingCredits = currentCredits - price
  // async reduce user credits to reduce response time
  const deductCredit = deductUserCoins(BigInt(userId), price)
  const setCreditCache = setUserCreditsCache(BigInt(userId), remainingCredits)
  const addTransaction = addCoinTransaction(BigInt(userId), -price, 'used', commandModel.id)

  deductCredit.catch((err) => console.error(`Failed to reduce user credits: ${err}`))
  setCreditCache.catch((err) => console.error(`Failed to cache user credits: ${err}`))
  addTransaction.catch((err) => console.error(`Failed to add credit transaction: ${err}`))

  let response = ''
  try {
    const logMessage = `User ID: ${userId}, Model: ${commandModel.name}, Price: ${price}`
    console.timeLog('process', logMessage)
    response = await generateCompletionRequest(messageText, commandModel)
  } catch (error) {
    deductCredit.then(() => {
      addUserCoins(BigInt(userId), price).catch((err) => console.error(`Failed to refund user credits: ${err}`))
    })
    setCreditCache.then(() => {
      setUserCreditsCache(BigInt(userId), currentCredits).catch((err) =>
        console.error(`Failed to cache user credits: ${err}`),
      )
    })
    addTransaction.then(() => {
      addCoinTransaction(BigInt(userId), price, 'refunded').catch((err) =>
        console.error(`Failed to add refund credit transaction: ${err}`),
      )
    })
    console.error('An error occurred:', (error as Error).message, messageText)
    return 'An error occurred. Please try again.'
  } finally {
    console.timeEnd('process')
  }
  const creditInfo = `\n\n_By ${commandModel.name}. Deducted ${price} credits. You have ${remainingCredits} credits left_`

  return formatForGoogleChat(response) + creditInfo
}

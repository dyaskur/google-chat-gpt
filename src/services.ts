import {addCoinTransaction, addUserCoins, deductUserCoins} from './db/user'
import {getCachedUserCoins, setUserCoinsCache} from './utils/cache'
import {generateCompletionRequest} from './apis/router'
import {formatForGoogleChat} from './utils/chat'
import {AbangModel} from './types/model'

export async function generateCompletionWithCoins(messageText: string, commandModel: AbangModel, userId: string) {
  const currentCoins = await getCachedUserCoins(BigInt(userId))
  const price = commandModel.abangPricing.completion

  if (currentCoins < price) {
    return `Sorry, you don't have enough coins, ${commandModel.name} model costs *${price}* coin, you only have *${currentCoins}*.`
  }
  const remainingCoins = currentCoins - price
  console.log('remaining coins', remainingCoins)
  // async reduce user coins to reduce response time
  const deductCoins = deductUserCoins(BigInt(userId), price)
  const setCreditCache = setUserCoinsCache(BigInt(userId), remainingCoins)
  const addTransaction = addCoinTransaction(BigInt(userId), -price, 'used', commandModel.id)

  deductCoins.catch((err) => console.error(`Failed to reduce user coins: ${err}`))
  setCreditCache.catch((err) => console.error(`Failed to cache user coins: ${err}`))
  addTransaction.catch((err) => console.error(`Failed to add credit transaction: ${err}`))

  let response = ''
  try {
    const logMessage = `User ID: ${userId}, Model: ${commandModel.name}, Price: ${price}`
    console.timeLog('process', logMessage)
    response = await generateCompletionRequest(messageText, commandModel)
  } catch (error) {
    deductCoins.then(() => {
      addUserCoins(BigInt(userId), price).catch((err) => console.error(`Failed to refund user coins: ${err}`))
    })
    setCreditCache.then(() => {
      setUserCoinsCache(BigInt(userId), currentCoins).catch((err) =>
        console.error(`Failed to cache user coins: ${err}`),
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
  const creditInfo = `\n\n_By ${commandModel.name}. Deducted ${price} coins. You have ${remainingCoins} coins left_`

  return formatForGoogleChat(response) + creditInfo
}

import { ICall } from '@wonderwall/multicall'
import { IMultiCall } from '~/src/interfaces/IMultiCall'

export const formatMultiCallAbi = (calls: IMultiCall[], address: string): ICall[] => {
  return calls.map((call) => {
    return {
      target: address,
      call: typeof call.call === 'string' ? [call.call] : call.call,
      returns: call.returns
    }
  })
}

export const getScale = (price: string): number => {
  const priceParts = price.split('')

  let firstIndex = priceParts.findIndex(i => i !== '0' && i !== '.')

  if (firstIndex <= 0) {
    firstIndex = 2
  }

  firstIndex += 2

  return 10 ** firstIndex
}

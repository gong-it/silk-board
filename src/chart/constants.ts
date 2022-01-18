import { IMultiCall } from '~/src/interfaces/IMultiCall'
import { WebsocketProviderOptions } from '~/node_modules/web3-core-helpers'
import { AvailableSaveloadVersions } from '~/plugins/tradingview/charting_library'

export const providerEndpoint = 'https://graphql.bitquery.io/'
export const defaultInterval = 60
export const millisMultiplier = 60 * 1000
export const libraryPath = '/charting_library/'
export const chartsStorageUrl = 'https://saveload.tradingview.com'
export const chartsStorageApiVersion: AvailableSaveloadVersions = '1.1'
export const userId = 'public_user_id'
export const bandChainEndpoint = 'https://api-gm-lb.bandchain.org'
export const contractInfoCalls: IMultiCall[] = [
  {
    call: 'name()(string)',
    returns: [['name']]
  },
  {
    call: 'decimals()(uint8)',
    returns: [['decimals']]
  },
  {
    call: 'symbol()(string)',
    returns: [['symbol']]
  },
  {
    call: 'totalSupply()(uint256)',
    returns: [['totalSupply']]
  },
  {
    call: 'owner()(address)',
    returns: [['owner']]
  }
]
export const poolInfoCalls: IMultiCall[] = [
  {
    call: 'token0()(address)',
    returns: [['token0']]
  },
  {
    call: 'token1()(address)',
    returns: [['token1']]
  },
  {
    call: 'decimals()(uint8)',
    returns: [['decimals']]
  },
  {
    call: 'totalSupply()(uint256)',
    returns: [['totalSupply']]
  },
  {
    call: 'getReserves()(uint112 _reserve0,uint112 _reserve1,uint32 _blockTimestampLast)',
    returns: [['reserve0'], ['reserve1'], ['blockTimestampLast']]
  }
]
export const burnInfoCall: IMultiCall = {
  call: 'balanceOf(address)(uint256)',
  returns: [['balance']]
}
interface IBurnAddress {
  alias: string
  address: string
}
export const burnAddresses: IBurnAddress[] = [
  {
    alias: 'deployer',
    address: '0x0000000000000000000000000000000000000000'
  },
  {
    alias: 'dead',
    address: '0x000000000000000000000000000000000000dEaD'
  }
]
export const poolBurnInfoCalls: IMultiCall[] = burnAddresses.map((burnAddress) => {
  return {
    call: [burnInfoCall.call, burnAddress.address] as string[],
    returns: [[`${burnInfoCall.returns[0][0]}-${burnAddress.alias}`]]
  }
})
export const wsDataSeedParams: WebsocketProviderOptions = {
  timeout: 60000,
  reconnect: {
    auto: true,
    delay: 5,
    maxAttempts: 5
  }
}
export const sellAction = 'sell'
export const buyAction = 'buy'
export const newSwapEvent = 'candle'
export const noDataEvent = 'noData'
export const setDailyVolumeEvent = 'setDailyVolume'

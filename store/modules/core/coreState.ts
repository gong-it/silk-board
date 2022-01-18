import { bandChainEndpoint } from '~/src/chart/constants'
import { ReferenceData } from '~/src/interfaces/IBandChain'
import { IDaily } from '~/src/interfaces/IDaily'
import { IToken } from '~/src/interfaces/IToken'
import { ITokenSupply } from '~/src/interfaces/ITokenSupply'
import { ILiquidityPool } from '~/src/interfaces/ILiquidityPool'
import { IBalanceList } from '~/src/interfaces/IBalance'
import { IUser } from '~/src/interfaces/IUser'

export default class CoreState {
  bandChainUrl: string = bandChainEndpoint

  priceCache: { [key: string]: ReferenceData } = {}

  dailyVolume: IDaily[] = []

  balanceList: IBalanceList = {
    BNB: {
      balance: 0,
      decimals: 18
    },
    ETH: {
      balance: 0,
      decimals: 18
    }
  }

  todayVolume: IDaily = {
    tradeAmount: 0,
    trades: 0,
    price: 0,
    isToday: true
  }

  yesterdayVolume: IDaily = {
    tradeAmount: 0,
    trades: 0,
    price: 0,
    isToday: false
  }

  tokenData: IToken = {
    name: '',
    symbol: '',
    owner: '',
    decimals: 18,
    scale: 10,
    lp: '',
    address: ''
  }

  tokenSupply: ITokenSupply = {
    total: 0,
    burned: 0,
    circulated: 0,
    locked: 0
  }

  liquidityPool: ILiquidityPool = {
    total: 0,
    burned: 0,
    locked: 0,
    usd: 0
  }

  user: IUser = {
    address: '',
    auth: false
  }
}

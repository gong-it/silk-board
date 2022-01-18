import { AbiItem } from 'web3-utils'
import { Exchange } from '~/plugins/tradingview/charting_library'
import { RouterUrl } from '~/src/interfaces/IRouter'

export interface IAbiList {
  [key: string]: AbiItem | AbiItem[]
}

export interface IChainCurrency {
  symbol: string,
  address: string,
  decimals: number,
  // alias is primarily using by bandChain protocol to map BNB -> WBNB, BUSD -> USD, USD-T -> USD
  alias?: string
}

export interface IPool {
  name: string,
  address: string,
  router: string,
  lpAbi: string,
  baseCurrency: IChainCurrency,
  quoteCurrency: IChainCurrency,
  // TODO: properly handle multiple liquidity locks
  dexSaleAddress: string,
  uniCryptAddress: string,
  dexSaleTokenAddress?: string,
  uniCryptTokenAddress?: string
}

export interface IExchange extends Exchange {
  pools: {
    [key: string]: IPool
  },
  additionalCurrencies?: {
    [key: string]: IChainCurrency
  }
}

export interface IChain {
  id: number,
  name: 'ethereum' | 'bsc',
  fullName: string,
  dataSeed: string,
  wsDataSeed: string,
  multiCall: string,
  routerUrl: RouterUrl,
  explorer: string,
  exchanges: {
    [key: string]: IExchange
  }
}

export interface IChainList {
  [key: number]: IChain
}

/* eslint-disable no-console */

import BigNumber from 'bignumber.js'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import Provider from './historyProvider'
import EventBus, { ISubscription } from '~/src/core/eventBus'
import {
  DatafeedConfiguration,
  ErrorCallback, HistoryCallback, OnReadyCallback,
  ResolutionString,
  ResolveCallback, SearchSymbolsCallback, SubscribeBarsCallback
} from '~/plugins/tradingview/charting_library'
import { ITokenData } from '~/src/interfaces/ITokenData'
import { IChain, IExchange, IPool } from '~/src/interfaces/IChain'
import { ISymbolInfoExt } from '~/src/interfaces/ISymbolInfoExt'
import { IBigNumberBar, IFormattedBar, ISubscriptionBar } from '~/src/interfaces/IBar'
import { millisMultiplier, newSwapEvent, noDataEvent } from '~/src/chart/constants'

export default class DataFeed {
  configuration!: DatafeedConfiguration
  tokenData!: ITokenData
  chain!: IChain
  exchange!: IExchange
  pool!: IPool
  axios!: NuxtAxiosInstance
  current!: IBigNumberBar
  subscription!: ISubscription | null
  firstCallSubscription!: ISubscription | null

  constructor (axios: NuxtAxiosInstance, tokenData: ITokenData, chain: IChain, exchange: IExchange, pool: IPool) {
    this.tokenData = tokenData
    this.chain = chain
    this.exchange = exchange
    this.pool = pool
    this.axios = axios
    this.current = {
      time: 0,
      open: new BigNumber(0),
      close: new BigNumber(0),
      high: new BigNumber(0),
      low: new BigNumber(0),
      volume: 0,
      tradeAmount: 0
    }

    this.configuration = {
      supported_resolutions: [
        '1', '3', '5', '15', '30', '60', '120', '240', 'D'
      ] as ResolutionString[],
      exchanges: Object.values(this.chain.exchanges),
      symbols_types: [
        {
          name: 'crypto',
          value: 'crypto'
        }
      ],
      currency_codes: ['USD', 'BNB']
    }
  }

  // get a configuration of your dataFeed (e.g. supported resolutions, exchanges and so on)
  onReady (cb: OnReadyCallback) {
    setTimeout(() => cb(this.configuration)) // callback must be called asynchronously.
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchSymbols (userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback) {}

  // retrieve information about a specific symbol (exchange, price scale, full symbol etc.)
  resolveSymbol (symbolName: string, onSymbolResolvedCallback: ResolveCallback, onResolveErrorCallback: ErrorCallback) {
    if (!this.configuration.exchanges) {
      onResolveErrorCallback('There are no exchanges being provided')
      return
    }

    const name = `wonderwall.finance: ${this.tokenData.symbol}/${this.pool.baseCurrency.symbol}`

    const symbol = {
      name: this.tokenData.symbol,
      full_name: name,
      description: '',
      type: this.configuration.symbols_types![0].value,
      session: '24x7',
      exchange: `${this.exchange.desc} (${this.pool.name})`,
      timezone: 'Etc/UTC',
      ticker: symbolName,
      minmov: 1,
      pricescale: this.tokenData.scale,
      has_intraday: true,
      has_weekly_and_monthly: false,
      intraday_multipliers: ['1', '5', '10', '15', '30', '60', '240', '720', '1D', '1W'],
      volume_precision: 8,
      data_status: 'streaming',
      factories: [
        this.pool.address
      ],
      currency_code: this.pool.quoteCurrency.symbol,
      original_currency_code: this.pool.baseCurrency.symbol,
      baseCurrency: this.pool.baseCurrency,
      usdCurrency: this.pool.quoteCurrency,
      supported_resolutions: this.configuration.supported_resolutions,
      listed_exchange: this.exchange.name,
      format: 'price'
    }

    setTimeout(() => {
      onSymbolResolvedCallback(symbol as ISymbolInfoExt)
    }, 0)
  }

  // get historical data for the symbol
  async getBars (symbolInfo: ISymbolInfoExt, resolution: ResolutionString, rangeStartDate: number, rangeEndDate: number, onResult: HistoryCallback, onError: ErrorCallback, isFirstCall: boolean) {
    const provider = new Provider({
      network: this.chain.name,
      info: symbolInfo,
      since: rangeStartDate,
      till: rangeEndDate,
      interval: Number(resolution),
      axios: this.axios,
      pool: this.pool
    })

    try {
      const bars: IFormattedBar[] = await provider.getBars()
      if (bars.length) {
        if (this.current.volume === 0) {
          const lastBar = bars[bars.length - 1]
          this.current = {
            time: lastBar.time,
            open: new BigNumber(lastBar.open),
            close: new BigNumber(lastBar.close),
            high: new BigNumber(lastBar.high),
            low: new BigNumber(lastBar.low),
            volume: lastBar.volume,
            tradeAmount: lastBar.tradeAmount
          }
        }
        onResult(bars, { noData: false })
      } else {
        if (isFirstCall) {
          EventBus.publish(noDataEvent, { token: symbolInfo.ticker })
        }
        onResult(bars, { noData: true })
      }
    } catch (e) {
      console.error({ e })
      onError(e)
    }
  }

  // subscription to real-time updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeBars (symbolInfo: ISymbolInfoExt, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void) {
    this.subscription = EventBus.subscribe(newSwapEvent, (rawData: ISubscriptionBar) => {
      const millisInterval = Number(resolution) * millisMultiplier
      const currentCandleTime = Math.floor(rawData.time / millisInterval) * millisInterval
      const newCandle = (this.current.time * millisInterval) < rawData.time
      this.current.time = newCandle ? currentCandleTime : this.current.time
      this.current.open = newCandle ? this.current.close || rawData.price : this.current.open
      this.current.close = rawData.price
      this.current.high = newCandle || this.current.high.isLessThan(rawData.price) ? rawData.price : this.current.high
      this.current.low = newCandle || this.current.low.isGreaterThan(rawData.price) ? rawData.price : this.current.low
      this.current.volume = newCandle ? rawData.tradeAmount : this.current.volume + 1
      this.current.tradeAmount = newCandle ? rawData.tradeAmount : this.current.tradeAmount + rawData.tradeAmount
      const candle: IFormattedBar = {
        time: this.current.time,
        close: this.current.close.toNumber(),
        open: this.current.open.toNumber(),
        high: this.current.high.toNumber(),
        low: this.current.low.toNumber(),
        volume: this.current.volume,
        tradeAmount: this.current.tradeAmount
      }

      onTick(candle)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unsubscribeBars (listenerGuid: string) {
    if (this.subscription !== null) {
      this.subscription.unsubscribe()
      this.current.volume = 0
    }
  }
}

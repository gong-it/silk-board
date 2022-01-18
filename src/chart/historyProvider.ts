import BigNumber from 'bignumber.js'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import query from './query'
import { IHistoryProvider } from '~/src/interfaces/IHistoryProvider'
import { ISymbolInfoExt } from '~/src/interfaces/ISymbolInfoExt'
import { providerEndpoint, setDailyVolumeEvent } from '~/src/chart/constants'
import { IBar, IBarResponse, IFormattedBar } from '~/src/interfaces/IBar'
import { IPool } from '~/src/interfaces/IChain'
import EventBus from '~/src/core/eventBus'

export default class HistoryProvider {
  network: string
  info: ISymbolInfoExt
  since: string
  till: string
  tradeAmountUsd: number
  interval: number
  axios: NuxtAxiosInstance
  pool: IPool
  dailySince!: string
  dailyTill!: string

  constructor (props: IHistoryProvider) {
    this.network = props.network
    this.info = props.info
    this.since = this.formatDate(props.since)
    this.till = this.formatDate(props.till)
    this.tradeAmountUsd = 10
    this.interval = props.interval
    this.axios = props.axios
    this.pool = props.pool

    this.calculateYesterday()
  }

  calculateYesterday () {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)

    this.dailySince = yesterday.toISOString()
    this.dailyTill = new Date().toISOString()
  }

  formatDate (date: number) {
    return (new Date(date * 1000)).toISOString()
  }

  async getBars () {
    const variables = {
      network: this.network,
      since: this.since,
      till: this.till,
      dailySince: this.dailySince,
      dailyTill: this.dailyTill,
      baseCurrency: this.info.ticker,
      quoteCurrency: this.info.baseCurrency.address,
      usdCurrency: this.info.usdCurrency.address,
      exchangeAddresses: this.info.factories,
      tradeAmountUsd: this.tradeAmountUsd,
      interval: this.interval
    }

    let bars: IBar[] = []

    try {
      const result: IBarResponse = (await this.axios.post(`/api/${providerEndpoint}`, {
        query,
        variables
      })).data

      bars = result.data.ethereum.dexTrades

      EventBus.publish(setDailyVolumeEvent, result.data.ethereum.dailyVolume)
    } catch (e) {
      console.error('Unnable to fetch data')
    }

    let resultBars: IFormattedBar[] = []

    if (bars && bars.length) {
      const rawTokenTrades: IBar[] = []
      const rawBaseCurrencyTrades: IBar[] = []

      bars.forEach((bar) => {
        if (!bar) { return }

        if (bar.baseCurrency.address !== this.pool.baseCurrency.address.toLowerCase()) {
          rawTokenTrades.push(bar)
        } else {
          rawBaseCurrencyTrades.push(bar)
        }
      })

      const tokenTrades = this.formatBars(rawTokenTrades)

      const baseCurrencyTrades = this.formatBars(rawBaseCurrencyTrades)

      // TODO: optimize this fragment. BaseCurrencyTrades is O(n) right now
      const transformedTrades: IFormattedBar[] = []
      tokenTrades.forEach((bar, index) => {
        const baseCurrencyValue = baseCurrencyTrades.find(
          x => x.time === bar.time
        )

        const newBar: IFormattedBar = {
          time: 0,
          open: 0,
          close: 0,
          high: 0,
          low: 0,
          volume: 0,
          tradeAmount: 0
        }

        if (!baseCurrencyValue) {
          return newBar
        }

        newBar.time = bar.time
        const open = new BigNumber(bar.open).times(baseCurrencyValue.open).toNumber()
        newBar.close = new BigNumber(bar.close).times(baseCurrencyValue.close).toNumber()
        newBar.low = new BigNumber(bar.low).times(baseCurrencyValue.low).toNumber()
        newBar.high = new BigNumber(bar.high).times(baseCurrencyValue.high).toNumber()

        newBar.open = index > 0 ? transformedTrades[index - 1].close : open
        newBar.volume = bar.volume
        newBar.tradeAmount = bar.tradeAmount

        transformedTrades.push(newBar)
      })

      resultBars = transformedTrades
    }
    return resultBars
  }

  formatBars (bars: IBar[]): IFormattedBar[] {
    const formattedBars: IFormattedBar[] = []
    bars.forEach((bar, index) => {
      formattedBars.push({
        time: Date.parse(bar.timeInterval.minute),
        open: index > 0 ? (formattedBars[index - 1] as IFormattedBar).close : Number(bar.open_price),
        close: Number(bar.close_price),
        low: bar.minimum_price,
        high: bar.maximum_price,
        volume: bar.trades,
        tradeAmount: bar.tradeAmount
      })
    })
    return formattedBars
  }
}

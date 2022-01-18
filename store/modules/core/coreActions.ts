import { Store } from 'vuex'
import { Actions } from 'vuex-smart-module'
import CoreState from './coreState'
import CoreGetters from './coreGetters'
import CoreMutations from './coreMutations'
import { ReferenceData } from '~/src/interfaces/IBandChain'
import { bandChainUpdateRate } from '~/src/constants'

export default class CoreActions extends Actions<CoreState,
  CoreGetters,
  CoreMutations,
  CoreActions> {
  store!: Store<any>

  $init (store: Store<any>): void {
    // Retain store instance for later
    this.store = store
  }

  async bandChainFetch (pairs: string[]): Promise<ReferenceData[]> {
    const usdSymbol = 'USD'
    const symbolList: string[] = []
    const data: ReferenceData[] = []
    const now = this.store.$dayjs()

    pairs.forEach((pair: string) => {
      const symbols = pair.split('/')
      symbols.forEach((symbol: string) => {
        if (symbol === usdSymbol) {
          return
        }
        if (Object.prototype.hasOwnProperty.call(this.state.priceCache, symbol)) {
          const cacheData = this.state.priceCache[symbol]
          const cacheDate = this.store.$dayjs.unix(cacheData.updatedAt.base).add(bandChainUpdateRate, 'second')

          if (cacheDate.diff(now, 'second') > 0) {
            data.push(cacheData)
          } else {
            this.commit('deletePriceCache', symbol)
          }
        }
        symbolList.push(symbol)
      })
    })

    if (symbolList.length === data.length) {
      return data
    }

    const pricerBody = {
      symbols: symbolList,
      min_count: 10,
      ask_count: 16
    }

    const priceData = (await this.store.$axios.post(`${this.state.bandChainUrl}/oracle/request_prices`, pricerBody)).data.result

    const symbolMap: any = {}
    symbolMap[usdSymbol] = {
      symbol: usdSymbol,
      multiplier: '1000000000',
      px: '1000000000',
      request_id: 0,
      resolve_time: Math.floor(Date.now() / 1000).toString()
    }

    priceData.forEach((price: any) => {
      symbolMap[price.symbol] = price
    })
    pairs.forEach((pair) => {
      const [baseSymbol, quoteSymbol] = pair.split('/')

      const priceData: ReferenceData = {
        pair,
        rate:
          (Number(symbolMap[baseSymbol].px) *
            Number(symbolMap[quoteSymbol].multiplier)) /
          (Number(symbolMap[quoteSymbol].px) *
            Number(symbolMap[baseSymbol].multiplier)),
        updatedAt: {
          base: Number(symbolMap[baseSymbol].resolve_time),
          quote: Number(symbolMap[quoteSymbol].resolve_time)
        },
        requestID: {
          base: Number(symbolMap[baseSymbol].request_id),
          quote: Number(symbolMap[quoteSymbol].request_id)
        }
      }

      if (!Object.prototype.hasOwnProperty.call(this.state.priceCache, baseSymbol)) {
        this.commit('addPriceCache', { key: baseSymbol, data: priceData })
      }

      if (quoteSymbol !== usdSymbol && !Object.prototype.hasOwnProperty.call(this.state.priceCache, quoteSymbol)) {
        this.commit('addPriceCache', { key: quoteSymbol, data: priceData })
      }

      data.push(priceData)
    })
    return data
  }
}

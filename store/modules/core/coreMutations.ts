import { Mutations } from 'vuex-smart-module'
import CoreState from './coreState'
import { ReferenceData } from '~/src/interfaces/IBandChain'
import { IDaily } from '~/src/interfaces/IDaily'
import { IToken } from '~/src/interfaces/IToken'
import { ITokenSupply } from '~/src/interfaces/ITokenSupply'
import { ILiquidityPool } from '~/src/interfaces/ILiquidityPool'
import { IBalanceList } from '~/src/interfaces/IBalance'
import { IUser } from '~/src/interfaces/IUser'

export default class CoreMutations extends Mutations<CoreState> {
  addPriceCache (payload: { key: string, data: ReferenceData }) {
    this.state.priceCache[payload.key] = payload.data
  }

  deletePriceCache (payload: string) {
    delete this.state.priceCache[payload]
  }

  setDailyVolume (payload: IDaily[]) {
    this.state.dailyVolume = payload

    if (payload.length === 0) {
      return
    }

    if (payload[0].isToday) {
      this.state.todayVolume = payload[0]
    } else if (payload.length === 1) {
      this.state.yesterdayVolume = payload[0]
      this.state.todayVolume = {
        trades: 0,
        tradeAmount: 0,
        price: payload[0].price,
        isToday: true
      }
    } else {
      this.state.yesterdayVolume = payload[0]
      this.state.todayVolume = payload[1]
    }
  }

  setTodayVolume (payload: IDaily) {
    this.state.todayVolume = payload
  }

  setTokenData (payload: IToken) {
    this.state.tokenData = payload
  }

  setTokenSupply (payload: ITokenSupply) {
    this.state.tokenSupply = payload
  }

  setLiquidityPool (payload: ILiquidityPool) {
    this.state.liquidityPool = payload
  }

  setBalance (payload: IBalanceList) {
    this.state.balanceList = Object.assign(this.state.balanceList, payload)
  }

  setUser (payload: IUser) {
    this.state.user = payload
  }
}

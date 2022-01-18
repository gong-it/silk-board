import { Getters } from 'vuex-smart-module'
import CoreState from './coreState'
import { calculatePercent } from '~/src/utils/token'

export default class CoreGetters extends Getters<CoreState> {
  todayVolumePercent () {
    return calculatePercent(this.state.todayVolume.tradeAmount, this.state.yesterdayVolume.tradeAmount)
  }

  todayPricePercent () {
    return calculatePercent(this.state.todayVolume.price, this.state.yesterdayVolume.price)
  }

  todayTradesPercent () {
    return calculatePercent(this.state.todayVolume.trades, this.state.yesterdayVolume.trades)
  }

  balanceOf (currency: string) {
    return Object.prototype.hasOwnProperty.call(this.state.balanceList, currency) ? this.state.balanceList[currency].balance : null
  }
}

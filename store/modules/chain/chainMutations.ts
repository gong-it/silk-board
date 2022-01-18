import { Mutations } from 'vuex-smart-module'
import ChainState from './chainState'

export default class ChainMutations extends Mutations<ChainState> {
  setCurrentChain (payload: number) {
    if (Object.prototype.hasOwnProperty.call(this.state.list, payload)) {
      this.state.currentChain = this.state.list[payload]

      if (this.state.multiCallConfig.preset !== this.state.currentChain.name) {
        this.state.multiCallConfig.preset = this.state.currentChain.name
      }
    } else {
      throw new Error(`There is no network with id "${payload}"!`)
    }
  }

  setCurrentExchange (payload: string) {
    if (Object.prototype.hasOwnProperty.call(this.state.currentChain.exchanges, payload)) {
      this.state.currentExchange = this.state.currentChain.exchanges[payload]
    } else {
      throw new Error(`There is no exchange with name "${payload}"!`)
    }
  }

  setCurrentPool (payload: string) {
    if (Object.prototype.hasOwnProperty.call(this.state.currentExchange.pools, payload)) {
      this.state.currentPool = this.state.currentExchange.pools[payload]
    } else {
      throw new Error(`There is no pool with name "${payload}"!`)
    }
  }
}

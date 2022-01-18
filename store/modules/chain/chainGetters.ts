import { Getters } from 'vuex-smart-module'
import { aggregate, ICall } from '@wonderwall/multicall'
import ChainState from './chainState'

export default class ChainGetters extends Getters<ChainState> {
  aggregatePromise (payload: { calls: Partial<ICall>[], requireSuccess?: boolean }) {
    const requireSuccess = Object.prototype.hasOwnProperty.call(payload, 'requireSuccess') ? payload.requireSuccess! : false

    return aggregate(payload.calls, requireSuccess, { preset: 'bsc' })
  }
}

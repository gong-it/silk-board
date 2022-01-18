import { Store } from 'vuex'
import { Actions } from 'vuex-smart-module'
import ChainState from './chainState'
import ChainGetters from './chainGetters'
import ChainMutations from './chainMutations'

export default class ChainActions extends Actions<ChainState,
  ChainGetters,
  ChainMutations,
  ChainActions> {
  store!: Store<any>

  $init (store: Store<any>): void {
    // Retain store instance for later
    this.store = store
  }
}

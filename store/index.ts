import { Store } from 'vuex'
import { Actions, Context, createStore, Getters, Module, Mutations } from 'vuex-smart-module'
import core from './modules/core'
import chain from './modules/chain'

class RootState {}

class RootGetters extends Getters<RootState> {}

class RootMutations extends Mutations<RootState> {}

class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {
  store!: Store<any>
  chain!: Context<typeof chain>

  $init (store: Store<any>): void {
    this.chain = chain.context(store)
    this.store = store
  }

  // @ts-ignore
  nuxtServerInit ({ error }) {
    try {
      // TODO: remove hardcode
      this.chain.commit('setCurrentChain', 56)
      this.chain.commit('setCurrentExchange', 'pcs')
      this.chain.commit('setCurrentPool', 'pcsV2')
    } catch (e) {
      error(e.message)
    }
  }
}

const root = new Module({
  modules: {
    core,
    chain
  },
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions
})

export default () => createStore(root)

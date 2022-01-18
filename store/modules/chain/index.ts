import { createMapper, Module } from 'vuex-smart-module'
import ChainState from './chainState'
import ChainGetters from './chainGetters'
import ChainMutations from './chainMutations'
import ChainActions from './chainActions'

const chain = new Module({
  state: ChainState,
  getters: ChainGetters,
  mutations: ChainMutations,
  actions: ChainActions
})

export default chain

export const chainMapper = createMapper(chain)

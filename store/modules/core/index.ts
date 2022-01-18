import { createMapper, Module } from 'vuex-smart-module'
import CoreState from './coreState'
import CoreGetters from './coreGetters'
import CoreMutations from './coreMutations'
import CoreActions from './coreActions'

const core = new Module({
  state: CoreState,
  getters: CoreGetters,
  mutations: CoreMutations,
  actions: CoreActions
})

export default core

export const coreMapper = createMapper(core)

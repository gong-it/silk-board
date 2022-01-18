import { Vue, Component } from 'vue-property-decorator'

import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import logo from '~/assets/images/NavBar/logo.svg'
import bscscan from '~/assets/images/NavBar/bscscan.svg'
import discord from '~/assets/images/NavBar/discord.svg'
import telegram from '~/assets/images/NavBar/telegram.svg'
import twitter from '~/assets/images/NavBar/twitter.svg'
import buttonComponent from '~/components/Button/button.vue'
import { chainMapper } from '~/store/modules/chain'
import { coreMapper } from '~/store/modules/core'
import { roundBalance } from '~/src/utils/token'

const Super = Vue.extend({
  computed: {
    ...chainMapper.mapState(['currentChain', 'currentPool']),
    ...coreMapper.mapState(['user'])
  },
  methods: {
    ...coreMapper.mapMutations(['setBalance', 'setUser'])
  }
})

@Component({
  components: {
    logo,
    bscscan,
    discord,
    telegram,
    twitter,
    buttonComponent
  }
})
export default class HeaderComponent extends Super {
  loading: boolean = false
  web3: Web3 | null = null

  async connectProvider () {
    this.loading = true

    try {
      await window.ethereum.request!({ method: 'eth_requestAccounts' })
      this.getUser()
      await this.getEthBalance()
    } catch (e) {
      this.$toast.error(e.message)
    }

    this.loading = false
  }

  async changeProvider () {
    this.loading = true

    try {
      await window.ethereum.request!({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {}
          }
        ]
      })
    } catch (e) {
      this.$toast.error(e.message)
    }

    this.loading = false
  }

  async mounted () {
    this.web3 = new Web3(this.currentChain.dataSeed)

    if (!window.ethereum) {
      this.$toast.warning('Please install metamask to use this application')

      return
    }

    if (window.ethereum.selectedAddress) {
      this.getUser()
      await this.getEthBalance()
    }
  }

  getUser () {
    this.setUser({
      address: window.ethereum.selectedAddress,
      auth: true
    })
  }

  async getEthBalance () {
    const result = await this.web3!.eth.getBalance(window.ethereum.selectedAddress)
    const balance = new BigNumber(result).div(10 ** this.currentPool.baseCurrency.decimals).toNumber()

    this.setBalance({
      [this.currentPool.baseCurrency.alias!]: {
        balance: roundBalance(balance),
        decimals: this.currentPool.baseCurrency.decimals
      }
    })
  }
}

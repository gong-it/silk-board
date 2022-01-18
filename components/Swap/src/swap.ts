import { Component, Vue, Watch } from 'nuxt-property-decorator'

import { ICall } from '@wonderwall/multicall'
import Web3 from 'web3'
import { providers } from '@0xsequence/multicall'
import { BigNumber, ethers, providers as ethersProviders } from 'ethers'
import { LogLevel } from '@ethersproject/logger'
import InputComponent from '~/components/Input/input.vue'
import ButtonComponent from '~/components/Button/button.vue'
import { coreMapper } from '~/store/modules/core'
import { chainMapper } from '~/store/modules/chain'
import { ISwapToken } from '~/src/interfaces/ISwapToken'
import Arrow from '~/assets/images/Swap/arrow.svg'
import ArrowPartial from '~/assets/images/Swap/arrowPartial.svg'
import { IToken } from '~/src/interfaces/IToken'
import { IChainCurrency } from '~/src/interfaces/IChain'
import { roundBalance } from '~/src/utils/token'
import { abstractContractAbi } from '~/src/partialAbi'
import { Debounce } from '~/src/decorators/debounce.decorator'
import Router from '~/src/core/router'

const Super = Vue.extend({
  computed: {
    ...chainMapper.mapState(['currentChain', 'currentExchange', 'currentPool']),
    ...coreMapper.mapState(['tokenData', 'balanceList', 'user']),
    ...chainMapper.mapGetters(['aggregatePromise']),
    ...coreMapper.mapGetters(['balanceOf'])
  },
  methods: {
    ...coreMapper.mapMutations(['setBalance'])
  }
})

@Component({
  components: {
    InputComponent,
    ButtonComponent,
    Arrow,
    ArrowPartial
  }
})
export default class SwapComponent extends Super {
  active: boolean = false

  web3: Web3 | null = null

  router: Router | null = null

  notEnoughBalance: boolean = false

  multicall: providers.MulticallProvider | null = null

  slippage: number = 3

  transaction: any | null = null

  slippageLoading: boolean = false

  calculating = {
    from: false,
    to: false
  }

  from: ISwapToken = {
    symbol: '',
    address: '',
    amount: 0,
    decimals: 18,
    main: true
  }

  to: ISwapToken = {
    symbol: '',
    address: '',
    amount: BigInt(0),
    decimals: 18,
    main: false
  }

  @Debounce(500)
  setFromAmountDelayed (value: string) {
    this.setFromAmount(Number(value))

    this.calculateTo()
  }

  setFromAmount (value: number) {
    this.notEnoughBalance = value > this.fromBalance

    this.from.amount = value
  }

  @Debounce(500)
  setToAmountDelayed (value: string) {
    this.setToAmount(Number(value))

    this.calculateFrom()
  }

  setToAmount (value: number) {
    this.to.amount = value
  }

  tokensMap: {
    [key: string]: {
      allowance: BigNumber,
      slippage: number
    }
  } = {}

  mainAddress: string = ''
  ethAddress: string = ''

  get fromBalance (): number {
    return Object.prototype.hasOwnProperty.call(this.balanceList, this.from.symbol) ? this.balanceList[this.from.symbol].balance : 0
  }

  get currencies () {
    return this.currentExchange.additionalCurrencies
      ? Object.values(this.currentExchange.additionalCurrencies)
        .concat([
          this.currentPool.baseCurrency,
          this.currentPool.quoteCurrency
        ])
        .filter(currency => currency.address !== this.mainAddress)
      : []
  }

  async allowanceOf (token: ISwapToken) {
    this.slippageLoading = true
    const abstractContractInstance = new ethers.Contract(token.address, abstractContractAbi, this.multicall!)

    let allowance = BigNumber.from(0)
    let fee = 3
    let liquidityFee = BigNumber.from(0)
    let taxFee = BigNumber.from(0)

    const allowancePromise = abstractContractInstance.allowance(this.user.address, this.currentPool.router)
    const liquidityFeePromise = abstractContractInstance._liquidityFee()
    const taxFeePromise = abstractContractInstance._taxFee()

    try {
      allowance = await allowancePromise
    } catch (e) {
      console.warn('Unable to get allowance of the token: ' + token.address)
    }

    try {
      liquidityFee = await liquidityFeePromise
    } catch (e) {
      console.warn('Unable to get liquidity fee of the token: ' + token.address)
    }

    try {
      taxFee = await taxFeePromise
    } catch (e) {
      console.warn('Unable to get tax fee of the token: ' + token.address)
    }

    fee = liquidityFee.add(taxFee).toNumber() + 1

    // Decimals could be larger than Number.MAX_SAFE_INTEGER
    const decimals = (10 ** token.decimals).toString()

    if (allowance.gt(decimals)) {
      allowance = allowance.div(decimals)
    }

    this.slippageLoading = false

    return {
      fee,
      allowance
    }
  }

  getTokenLogo (address: string) {
    return `https://raw.githubusercontent.com/CryptOasisDS/assets/master/${this.currentChain.name}/assets/${address}/logo.png`
  }

  getBalanceCall (currency: IChainCurrency): { call: ICall, key: string } {
    const key = `balance-${currency.symbol}`
    return {
      call: {
        target: currency.address,
        call: ['balanceOf(address)(uint256)', this.user.address],
        returns: [[`balance-${currency.symbol}`]]
      },
      key
    }
  }

  async calculateFrom () {
    const toAmount = BigNumber.from(this.to.amount.toString()).mul((10 ** this.to.decimals).toString()).toString()
    try {
      this.calculating.from = true
      const result = await this.router!.quote({
        sellToken: this.from.address,
        buyToken: this.to.address,
        slippagePercentage: this.slippage,
        buyAmount: toAmount
      })
      this.transaction = result.data
      this.setFromAmount(Number(result.data.guaranteedPrice))
    } catch (e) {
    } finally {
      this.calculating.from = false
    }
  }

  async calculateTo () {
    const fromAmount = BigNumber.from(BigInt(this.from.amount * 10 ** this.from.decimals)).toString()

    try {
      this.calculating.to = true
      const result = await this.router!.quote({
        sellToken: this.from.address,
        buyToken: this.to.address,
        slippagePercentage: this.slippage / 100,
        sellAmount: fromAmount
      })
      this.transaction = result.data
      this.setToAmount(Number(result.data.buyTokenToEthRate))
    } catch (e) {
    } finally {
      this.calculating.to = false
    }
  }

  async mounted () {
    ethers.utils.Logger.setLogLevel(LogLevel.OFF)
    this.web3 = new Web3(this.currentChain.dataSeed)

    this.router = new Router(this.currentChain.routerUrl, this.$axios)

    this.multicall = new providers.MulticallProvider(new ethersProviders.JsonRpcProvider(this.currentChain.dataSeed), {
      batchSize: 50,
      timeWindow: 50, // ms
      contract: '0x90656a736f6979098e21cbed9d64f91f3e02a2ea'
    })

    if (this.currentExchange.additionalCurrencies) {
      const firstCurrency = Object.values(this.currentExchange.additionalCurrencies)[0]
      this.from = {
        symbol: firstCurrency.symbol,
        address: firstCurrency.address,
        amount: 0,
        decimals: firstCurrency.decimals,
        main: true
      }
      this.ethAddress = firstCurrency.address
    } else {
      this.from = {
        symbol: this.currentPool.baseCurrency.symbol,
        address: this.currentPool.baseCurrency.address,
        amount: 0,
        decimals: this.currentPool.baseCurrency.decimals,
        main: true
      }
    }

    this.mainAddress = this.from.address

    this.to = {
      symbol: this.tokenData.symbol,
      address: this.tokenData.address,
      amount: 0,
      decimals: this.tokenData.decimals,
      main: false
    }

    if (this.user.auth) {
      const calls: ICall[] = []
      const keyToIndexMap: { [key: string]: number } = {}
      this.currencies.forEach((currency, index: number) => {
        if (!Object.prototype.hasOwnProperty.call(this.balanceList, currency.symbol)) {
          const balanceCallObject = this.getBalanceCall(currency)
          calls.push(balanceCallObject.call)
          keyToIndexMap[balanceCallObject.key] = index
        }
      })

      if (calls.length !== 0) {
        const balances = (await this.aggregatePromise({ calls })).results.original
        const balanceKeys = Object.keys(balances)
        balanceKeys.forEach((key: string) => {
          const currency = this.currencies[keyToIndexMap[key]]
          const decimals = currency.decimals
          const balance = BigNumber.from(balances[key].toString()).div((10 ** decimals).toString()).toNumber()

          this.setBalance({
            [currency.symbol]: {
              balance: roundBalance(balance),
              decimals
            }
          })
        })
      }
    }
  }

  swap () {
    const from = this.from
    from.amount = 0
    this.from = this.to
    this.to = from
  }

  chooseFromCurrency (currency: IChainCurrency) {
    this.from = {
      symbol: currency.symbol,
      address: currency.address,
      amount: 0,
      decimals: currency.decimals,
      main: this.from.main
    }
    this.mainAddress = currency.address
    this.active = false
  }

  dropdown () {
    this.active = !this.active
  }

  max () {
    this.from.amount = this.fromBalance
  }

  reset () {
    this.from.amount = 0
  }

  @Watch('from')
  async onFromChange (value: ISwapToken) {
    if (value.address !== this.ethAddress) {
      if (Object.prototype.hasOwnProperty.call(this.tokensMap, value.symbol)) {
        this.slippage = this.tokensMap[value.symbol].slippage
        return
      }

      const info = await this.allowanceOf(this.from)

      this.tokensMap[value.symbol] = {
        allowance: info.allowance,
        slippage: info.fee
      }

      this.slippage = info.fee
    }
  }

  @Watch('tokenData')
  onTokenDataChange (value: IToken) {
    if (this.to.main) {
      this.from = this.to
    }

    this.to = {
      symbol: value.symbol,
      address: value.address,
      amount: 0,
      decimals: value.decimals,
      main: false
    }
  }
}

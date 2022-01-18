import 'reflect-metadata'
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import BigNumber from 'bignumber.js'
import { Subscription } from 'web3-core-subscriptions'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { BlockNumber, Log } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import { oasis } from '~/src/constants'
import 'dayjs/plugin/isToday'
import {
  chartsStorageApiVersion,
  chartsStorageUrl,
  contractInfoCalls,
  defaultInterval, libraryPath,
  newSwapEvent, noDataEvent, poolBurnInfoCalls,
  poolInfoCalls, setDailyVolumeEvent, userId,
  wsDataSeedParams
} from '~/src/chart/constants'
import { coreMapper } from '~/store/modules/core'
import { chainMapper } from '~/store/modules/chain'
import { ReferenceData } from '~/src/interfaces/IBandChain'
import { formatMultiCallAbi, getScale } from '~/src/utils/chart'
import { IToken } from '~/src/interfaces/IToken'
import EventBus, { ISubscription } from '~/src/core/eventBus'
import { IDailyVolume, ISubscriptionBar } from '~/src/interfaces/IBar'
import DataFeed from '~/src/chart/datafeed'
import {
  IBasicDataFeed, IChartingLibraryWidget,
  LanguageCode,
  ResolutionString, ThemeName,
  TimeFrameItem,
  Timezone
} from '~/plugins/tradingview/charting_library'
import InputComponent from '~/components/Input/input.vue'
import Loader from '~/components/loader.vue'
import { IDaily } from '~/src/interfaces/IDaily'

const Super = Vue.extend({
  components: {
    InputComponent,
    Loader
  },
  computed: {
    ...coreMapper.mapState(['todayVolume', 'tokenData', 'user']),
    ...chainMapper.mapState({
      currentChain: 'currentChain',
      currentExchange: 'currentExchange',
      currentPool: 'currentPool',
      abiList: 'abiList'
    }),
    ...chainMapper.mapGetters(['aggregatePromise'])
  },
  methods: {
    ...coreMapper.mapMutations(['setDailyVolume', 'setTodayVolume', 'setTokenData', 'setTokenSupply', 'setLiquidityPool', 'setBalance']),
    ...coreMapper.mapActions(['bandChainFetch'])
  }
})

@Component
export default class ChartComponent extends Super {
  @Prop({ default: 'chart-container' }) readonly containerId!: string
  @Prop({ default: defaultInterval }) readonly interval!: number
  @Prop({ default: false }) readonly fullscreen!: boolean
  @Prop({ default: true }) readonly autosize!: boolean

  symbol: string = oasis

  currentSymbol: string = ''

  loading: boolean = false

  ready: boolean = false

  baseCurrencyPrice: BigNumber = new BigNumber(0)

  subscription: Subscription<Log> | null = null

  widget: null | IChartingLibraryWidget = null

  noDataSubscription: ISubscription | null = null

  setDailyVolumeSubscription: ISubscription | null = null

  action: 'buy' | 'sell' | null = null

  reverse: boolean = false

  noDataSubscriptions: string[] = []

  lpAddress: string = ''

  uniCryptContract: Contract | null = null

  async getBaseCurrencyPrice () {
    const results = (await this.bandChainFetch([`${this.currentPool.baseCurrency.alias}/${this.currentPool.quoteCurrency.alias}`])) as ReferenceData[]
    return new BigNumber(results[0].rate)
  }

  async mounted () {
    try {
      await this.search()
    } catch (e) {
      this.$toast.error(e.message)
    }
  }

  async search () {
    if (this.symbol === this.currentSymbol) {
      return
    }

    this.ready = false
    try {
      this.loading = true
      await this.initChart()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
      this.$toast.error('Incorrect token address')

      if (this.currentSymbol !== '') {
        this.symbol = this.currentSymbol
      }
    } finally {
      this.loading = false
      this.ready = true
    }
  }

  async getLockedLPPcsV1 () {
    /*
    const dxSale = [
      {
        call: ['presales(address)(bool exists, uint256 createdOn, address presaleInfoAddr, address tokenAddress, address presaleAddress, address governor, bool active, uint256 govStartTime, uint256 govEndTime, uint256 govPercentage, address uniswapDep, uint256 uniswapPercentage, uint256 uniswapRate, uint256 lp_locked)', '0xd4e43fe65E175f53Ea9C4D0E8c32a46BdDbc860B'],
        returns: [['exists'], ['createdOn'], ['presaleInfoAddr'], ['tokenAddress'], ['presaleAddress'], ['governor'], ['active'], ['govStartTime'], ['govEndTime'], ['govPercentage'], ['uniswapDep'], ['uniswapPercentage'], ['uniswapRate'], ['lp_locked']]
      }
    ]
    */

    const uniCrypt = [
      {
        call: ['tokenLocks(address,uint256)(uint256 lockDate,uint256 amount,uint256 initialAmount,uint256 unlockDate,uint256 lockID,address owner)', this.lpAddress, '0'],
        returns: [['lockDate'], ['amount'], ['initialAmount'], ['unlockDate'], ['lockID'], ['owner']]
      }
    ]

    const dxSaleLockedLP = new BigNumber(0)
    let uniCryptLockedLP = new BigNumber(0)

    /*
    * TODO: fix dexSale PcsV1
    * */
    /*
    try {
      const dxActions = formatMultiCallAbi(dxSale, this.currentPool.dexSaleAddress)
      const dxActionsResult = (await aggregate(dxActions, this.multiCallConfig)).results

      console.info('dx sale results', dxActionsResult, new BigNumber(dxActionsResult.original.lp_locked).toNumber())

      dxSaleLockedLP = new BigNumber(dxActionsResult.original.balance).div(10 ** this.currentPool.baseCurrency.decimals)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info('DexSale contract response: ', e.message)
    }
    */

    try {
      const uniActions = formatMultiCallAbi(uniCrypt, this.currentPool.uniCryptAddress)
      const uniActionsResult = (await this.aggregatePromise({ calls: uniActions })).results

      uniCryptLockedLP = new BigNumber(uniActionsResult.original.amount).div(10 ** this.currentPool.baseCurrency.decimals)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info('UniCrypt contract response: ', e.message)
    }

    return uniCryptLockedLP.plus(dxSaleLockedLP).toNumber()
  }

  async getLockedLPPcsV2 () {
    const dxSale = [
      {
        call: ['tokenBalance(address)(uint256)', this.lpAddress],
        returns: [['balance']]
      }
    ]

    const uniCrypt = [
      {
        call: ['tokenLocks(address,uint256)(uint256 lockDate,uint256 amount,uint256 initialAmount,uint256 unlockDate,uint256 lockID,address owner)', this.lpAddress, '0'],
        returns: [['lockDate'], ['amount'], ['initialAmount'], ['unlockDate'], ['lockID'], ['owner']]
      }
    ]

    let dxSaleLockedLP = new BigNumber(0)
    let uniCryptLockedLP = new BigNumber(0)

    try {
      const dxActions = formatMultiCallAbi(dxSale, this.currentPool.dexSaleAddress)
      const dxActionsResult = (await this.aggregatePromise({ calls: dxActions })).results

      dxSaleLockedLP = new BigNumber(dxActionsResult.original.balance).div(10 ** this.currentPool.baseCurrency.decimals)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info('DexSale contract response: ', e.message)
    }

    try {
      const uniActions = formatMultiCallAbi(uniCrypt, this.currentPool.uniCryptAddress)
      const uniActionsResult = (await this.aggregatePromise({ calls: uniActions })).results

      uniCryptLockedLP = new BigNumber(uniActionsResult.original.amount).div(10 ** this.currentPool.baseCurrency.decimals)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info('UniCrypt contract response: ', e.message)
    }

    return uniCryptLockedLP.plus(dxSaleLockedLP).toNumber()
  }

  async getLockedLP (): Promise<number> {
    let lockedLP = 0
    switch (this.currentPool.name) {
      case 'pcsV1': lockedLP = await this.getLockedLPPcsV1(); break
      case 'pcsV2': lockedLP = await this.getLockedLPPcsV2(); break
      default: lockedLP = await this.getLockedLPPcsV2(); break
    }
    return lockedLP
  }

  async getLockedTokensPcsV2 (decimals: number) {
    const dxSale = [
      {
        call: ['tokenBalance(address)(uint256)', this.symbol],
        returns: [['balance']]
      }
    ]

    let dxSaleLockedTokens = new BigNumber(0)
    let uniCryptLockedTokens = new BigNumber(0)

    try {
      if (!this.currentPool.dexSaleTokenAddress) {
        throw (new Error('DexSale token address is missing'))
      }

      const dxActions = formatMultiCallAbi(dxSale, this.currentPool.dexSaleTokenAddress)
      const dxActionsResult = (await this.aggregatePromise({ calls: dxActions })).results

      dxSaleLockedTokens = new BigNumber(dxActionsResult.original.balance).div(10 ** decimals)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info('DexSale token contract response: ', e.message)
    }

    try {
      if (!this.currentPool.uniCryptTokenAddress) {
        throw (new Error('UniCrypt token address is missing'))
      }

      const length = await this.uniCryptContract!.methods.getTokenLocksLength(this.symbol).call()

      if (length === 0) {
        throw new Error('Tokens are not locked inside UniCrypt vault')
      }

      const uniCryptLocksIDs = []

      for (let i = 0; i < length; i++) {
        const id = await this.uniCryptContract!.methods.getTokenLockIDAtIndex(this.symbol, i).call()

        uniCryptLocksIDs.push(id)
      }

      const uniGetLocksCalls = uniCryptLocksIDs.map((idRaw) => {
        const id = new BigNumber(idRaw).toNumber().toString()
        return {
          call: ['getLock(uint256)(uint256 lockID, address tokenAddress, uint256 tokensDeposited, uint256 tokensWithdrawn, uint256 sharesDeposited, uint256 sharesWithdrawn, uint256 startEmission, uint256 endEmission, address owner, address condition)', id],
          returns: [['lock-id-' + id], ['lock-address-' + id], ['lock-tokens-deposited-' + id], ['lock-tokens-withdrawn-' + id], ['lock-shares-deposited-' + id], ['lock-shares-withdrawn-' + id], ['lock-start-emission-' + id], ['lock-end-emission-' + id], ['lock-owner-' + id], ['lock-condition-' + id]]
        }
      })

      const uniGetLocksActions = formatMultiCallAbi(uniGetLocksCalls, this.currentPool.uniCryptTokenAddress)
      const uniGetLocksActionsResult = (await this.aggregatePromise({ calls: uniGetLocksActions })).results.original

      const now = new Date().getTime()

      const lockedTokens: BigNumber[] = []

      uniCryptLocksIDs.forEach((id) => {
        const emissionEndIndex = 'lock-end-emission-' + id
        if (Object.prototype.hasOwnProperty.call(uniGetLocksActionsResult, emissionEndIndex)) {
          const date = new BigNumber(uniGetLocksActionsResult[emissionEndIndex]).toNumber() * 1000

          if (date > now) {
            const lockedTokensIndex = 'lock-tokens-deposited-' + id

            lockedTokens.push(new BigNumber(uniGetLocksActionsResult[lockedTokensIndex]).div(10 ** decimals))
          }
        }
      })

      uniCryptLockedTokens = lockedTokens.reduce((prev, next) => prev.plus(next), new BigNumber(0))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info('UniCrypt contract response: ', e.message)
    }

    return uniCryptLockedTokens.plus(dxSaleLockedTokens)
  }

  async getLockedTokens (decimals: number): Promise<BigNumber> {
    let lockedTokens = new BigNumber(0)
    switch (this.currentPool.name) {
      case 'pcsV1': await this.getLockedTokensPcsV2(decimals); break
      case 'pcsV2': lockedTokens = await this.getLockedTokensPcsV2(decimals); break
      default: lockedTokens = await this.getLockedTokensPcsV2(decimals); break
    }
    return lockedTokens
  }

  async initChart () {
    this.baseCurrencyPrice = await this.getBaseCurrencyPrice()

    const provider = new Web3(new Web3.providers.WebsocketProvider(this.currentChain.wsDataSeed, wsDataSeedParams))

    this.uniCryptContract = new provider.eth.Contract(this.abiList.uniCryptTokenLockerAbi, this.currentPool.uniCryptTokenAddress)

    const poolAbi = this.abiList[this.currentPool.name]

    const poolContract = new provider.eth.Contract(poolAbi, this.currentPool.address)

    this.lpAddress = await poolContract.methods.getPair(this.currentPool.baseCurrency.address, this.symbol).call()

    const lpInfoActions = formatMultiCallAbi(poolInfoCalls.concat(poolBurnInfoCalls), this.lpAddress)

    const lpAbi = this.abiList[this.currentPool.lpAbi] as AbiItem[]

    const lpContract = new provider.eth.Contract(lpAbi, this.lpAddress)

    const lpInfoActionsResult = (await this.aggregatePromise({ calls: lpInfoActions })).results

    const lockedLP = await this.getLockedLP()

    const burdAddresesLP = Object.keys(lpInfoActionsResult.original).filter(propertyName => propertyName.indexOf('balance-') === 0)

    const { token0, reserve0, reserve1, decimals, totalSupply } = lpInfoActionsResult.original
    let baseCurrencyReserve = new BigNumber(reserve0)
    let tokenReserve = new BigNumber(reserve1)

    if (token0.toLowerCase() === this.symbol.toLowerCase()) {
      tokenReserve = new BigNumber(reserve0)
      baseCurrencyReserve = new BigNumber(reserve1)
      this.reverse = true
    }

    const burnedAmountLP = burdAddresesLP.reduce((prev, current) => {
      return prev.plus(new BigNumber(lpInfoActionsResult.original[current]))
    }, new BigNumber(0)).div(10 ** decimals)

    this.setTokenData(await this.getTokenData())

    const totalLPTokens = new BigNumber(totalSupply).div(10 ** decimals)

    const baseCurrencyReserveFormatted = baseCurrencyReserve.div(10 ** this.currentPool.baseCurrency.decimals)

    const tokenReserveFormatted = tokenReserve.div(10 ** this.tokenData.decimals)

    const initialPrice = baseCurrencyReserveFormatted
      .div(tokenReserveFormatted)
      .times(this.baseCurrencyPrice)
      .toFormat(this.currentPool.baseCurrency.decimals)

    const liquidityUsd = baseCurrencyReserveFormatted.times(this.baseCurrencyPrice)

    this.setLiquidityPool({
      total: totalLPTokens.toNumber(),
      burned: burnedAmountLP.toNumber(),
      locked: lockedLP,
      usd: liquidityUsd.toNumber()
    })

    this.setTokenData(Object.assign(this.tokenData, {
      scale: getScale(initialPrice)
    }))

    const swapInterface = lpAbi.find(abi => abi.name === 'Swap' && abi.type === 'event')

    if (!swapInterface) {
      this.$toast.error('This lp contract is wrong. There is no Swap event')
      return
    }

    this.subscription = provider.eth.subscribe('logs', {
      address: this.lpAddress,
      topics: [provider.eth.abi.encodeEventSignature(swapInterface)]
    }, async (err: Error, result: Log) => {
      if (!err) {
        const eventObj = provider.eth.abi.decodeLog(
          swapInterface.inputs!,
          result.data,
          result.topics.slice(1)
        )

        const rawData = await this.formatRawCandle(eventObj)

        this.setTodayVolume({
          tradeAmount: this.todayVolume.tradeAmount + rawData.tradeAmount,
          trades: this.todayVolume.trades + 1,
          price: rawData.price.toNumber(),
          isToday: true
        })

        EventBus.publish(newSwapEvent, rawData)
      } else {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    })

    this.noDataSubscription = EventBus.subscribe(noDataEvent, async (result: { token: string }) => {
      if (!this.noDataSubscriptions.includes(result.token)) {
        const latest: BlockNumber = await provider.eth.getBlockNumber()

        const events = await lpContract.getPastEvents('Swap', {
          topics: [provider.eth.abi.encodeEventSignature(swapInterface)],
          fromBlock: latest - 5000,
          toBlock: latest
        })

        let rawData

        for (const event of events) {
          rawData = await this.formatRawCandle(event.returnValues)
          EventBus.publish(newSwapEvent, rawData)
        }

        this.noDataSubscriptions.push(result.token)
      }
    })

    this.setDailyVolumeSubscription = EventBus.subscribe(setDailyVolumeEvent, (payload: IDailyVolume[]) => {
      const tokenTrades: IDailyVolume[] = []
      const baseCurrencyTrades: IDailyVolume[] = []

      payload.forEach((volume) => {
        if (volume.baseCurrency.address !== this.currentPool.baseCurrency.address) {
          tokenTrades.push(volume)
        } else {
          baseCurrencyTrades.push(volume)
        }
      })

      const dailyVolume: IDaily[] = []

      tokenTrades.forEach((trade) => {
        const timestamp = Date.parse(trade.timeInterval.day)
        const baseCurrencyValue = baseCurrencyTrades.find(
          x => Date.parse(x.timeInterval.day) === timestamp
        )
        if (!baseCurrencyValue) {
          return
        }
        dailyVolume.push({
          trades: trade.trades,
          tradeAmount: trade.tradeAmount,
          price: new BigNumber(trade.quotePrice).times(new BigNumber(baseCurrencyValue.quotePrice)).toNumber(),
          isToday: this.$dayjs(timestamp).isToday()
        })
      })

      if (dailyVolume.length > 0) {
        this.setDailyVolume(dailyVolume)
      } else {
        this.setDailyVolume([
          {
            trades: 0,
            tradeAmount: 0,
            price: Number(initialPrice),
            isToday: true
          }
        ])
      }
    })

    this.buildChart()
  }

  async formatRawCandle (eventObj: { [key: string]: string }): Promise<ISubscriptionBar> {
    let inAmount = eventObj.amount1In
    let inAmount1 = eventObj.amount0In
    let outAmount = eventObj.amount1Out
    let outAmount1 = eventObj.amount0Out
    const timestamp = Date.now()

    if (this.reverse) {
      inAmount = eventObj.amount0In
      outAmount = eventObj.amount0Out
      inAmount1 = eventObj.amount1In
      outAmount1 = eventObj.amount1Out
    }

    this.action = 'sell'
    if (outAmount !== '0') {
      this.action = 'buy'
    }
    const price = new BigNumber(this.action === 'sell' ? outAmount1 : inAmount1).div(10 ** this.currentPool.baseCurrency.decimals)
    const divider = new BigNumber(this.action === 'sell' ? inAmount : outAmount).div(10 ** this.tokenData.decimals)
    this.baseCurrencyPrice = await this.getBaseCurrencyPrice()

    return {
      time: timestamp,
      price: price.div(divider).times(this.baseCurrencyPrice),
      tradeAmount: price.times(this.baseCurrencyPrice).toNumber()
    }
  }

  buildChart () {
    const dataFeedProvider = new DataFeed(this.$axios, this.tokenData, this.currentChain, this.currentExchange, this.currentPool)

    const datafeed: IBasicDataFeed = {
      onReady: dataFeedProvider.onReady.bind(dataFeedProvider),
      searchSymbols: dataFeedProvider.searchSymbols.bind(dataFeedProvider),
      resolveSymbol: dataFeedProvider.resolveSymbol.bind(dataFeedProvider),
      getBars: dataFeedProvider.getBars.bind(dataFeedProvider),
      subscribeBars: dataFeedProvider.subscribeBars.bind(dataFeedProvider),
      unsubscribeBars: dataFeedProvider.unsubscribeBars.bind(dataFeedProvider)
    }

    const locale: LanguageCode = 'en'
    const timezone: 'exchange' | Timezone = Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone

    const widgetOptions = {
      symbol: this.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed,
      interval: this.interval.toString() as ResolutionString,
      container_id: this.containerId,
      library_path: libraryPath,
      theme: 'Dark' as ThemeName,
      locale,
      custom_css_url: '/charting_library/custom.css',
      disabled_features: ['symbol_search_hot_key', 'header_symbol_search', 'display_market_status'],
      timeframe: '2D',
      timezone,
      charts_storage_url: chartsStorageUrl,
      charts_storage_api_version: chartsStorageApiVersion,
      client_id: this.currentChain.name,
      user_id: userId,
      fullscreen: this.fullscreen,
      autosize: this.autosize,
      time_frames: [{
        text: '1m',
        resolution: '60',
        description: '1 Month'
      }, {
        text: '1w',
        resolution: '15',
        description: '5 Days'
      }, {
        text: '1d',
        resolution: '1',
        description: '1 Day'
      }] as TimeFrameItem[]
    }

    this.widget = new this.$TradingView(widgetOptions)

    this.currentSymbol = this.symbol
  }

  async getTokenData (): Promise<IToken> {
    if (this.user.auth) {
      const balanceCall = {
        call: ['balanceOf(address)(uint256)', this.user.address],
        returns: [['balanceOf']]
      }

      contractInfoCalls.push(balanceCall)
    }

    const contractInfoActions = formatMultiCallAbi(contractInfoCalls.concat(poolBurnInfoCalls), this.symbol)

    const contractInfoActionsResult = (await this.aggregatePromise({ calls: contractInfoActions })).results

    const burdAddreses = Object.keys(contractInfoActionsResult.original).filter(propertyName => propertyName.indexOf('balance-') === 0)

    const decimals = contractInfoActionsResult.original.decimals as number

    const burnedAmount = burdAddreses.reduce((prev, current) => {
      return prev.plus(new BigNumber(contractInfoActionsResult.original[current]))
    }, new BigNumber(0)).div(10 ** decimals)

    const name = contractInfoActionsResult.original.name as string
    const symbol = contractInfoActionsResult.original.symbol as string
    const totalSupply = new BigNumber(contractInfoActionsResult.original.totalSupply).div(10 ** decimals)
    const owner = contractInfoActionsResult.original.owner
    const lockedTokens = await this.getLockedTokens(decimals)
    const circulatedSupply = totalSupply.minus(burnedAmount).minus(lockedTokens)

    this.setTokenSupply({
      total: totalSupply.toNumber(),
      burned: burnedAmount.toNumber(),
      circulated: circulatedSupply.toNumber(),
      locked: lockedTokens.toNumber()
    })

    if (this.user.auth) {
      const balance = new BigNumber(contractInfoActionsResult.original.balanceOf).div(10 ** decimals).toNumber()

      this.setBalance({
        [symbol]: {
          decimals,
          balance
        }
      })
    }

    return {
      name,
      symbol,
      decimals,
      scale: 10,
      owner,
      lp: this.lpAddress,
      address: this.symbol
    }
  }

  async destroyed () {
    if (this.subscription) {
      await this.subscription.unsubscribe((err, result) => {
        if (err && !result) {
          // eslint-disable-next-line no-console
          console.error(err.message)
        }
      })
    }
    if (this.noDataSubscription) {
      this.noDataSubscription.unsubscribe()
    }
    if (this.setDailyVolumeSubscription) {
      this.setDailyVolumeSubscription.unsubscribe()
    }
    if (this.widget) {
      this.widget.remove()
      this.widget = null
    }
  }
}

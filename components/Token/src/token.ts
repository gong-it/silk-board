import { Vue, Component } from 'nuxt-property-decorator'
import millify from 'millify'
import BigNumber from 'bignumber.js'
import { coreMapper } from '~/store/modules/core'
import { burnAddresses } from '~/src/chart/constants'
import { chainMapper } from '~/store/modules/chain'

const Super = Vue.extend({
  computed: {
    ...coreMapper.mapGetters(['todayVolumePercent', 'todayPricePercent', 'todayTradesPercent']),
    ...coreMapper.mapState(['todayVolume', 'tokenData', 'liquidityPool', 'tokenSupply']),
    ...chainMapper.mapState(['currentChain', 'currentPool'])
  }
})

@Component
export default class TokenComponent extends Super {
  get todayPriceBigNumber () {
    return new BigNumber(this.todayVolume.price)
  }

  get formattedPrice () {
    return this.todayPriceBigNumber.toFormat(this.tokenData.scale.toString().length - 1)
  }

  get ownershipRenouncement () {
    return burnAddresses.map(address => address.address).includes(this.tokenData.owner)
  }

  get formattedLiquidity () {
    return new BigNumber(this.liquidityPool.usd).toFormat(0)
  }

  get formattedBurnedLiquidity (): string {
    const burnedPercent = this.liquidityPool.burned / this.liquidityPool.total * 100

    if (isNaN(burnedPercent)) {
      return '0'
    }

    return burnedPercent < 1 ? '<1' : burnedPercent.toFixed(2)
  }

  get formattedLockedLiquidity (): number {
    return this.liquidityPool.locked / this.liquidityPool.total * 100
  }

  get circulatedSupplyBigNumber () {
    return new BigNumber(this.tokenSupply.circulated)
  }

  get formattedTotalSupply () {
    return millify(new BigNumber(this.tokenSupply.total).toNumber())
  }

  get formattedBurnedSupply () {
    return millify(this.tokenSupply.burned)
  }

  get formattedLockedSupply () {
    return millify(this.tokenSupply.locked)
  }

  get formattedCirculatedSupply () {
    return millify(this.circulatedSupplyBigNumber.toNumber())
  }

  get marketCap () {
    return millify(this.circulatedSupplyBigNumber.times(this.todayPriceBigNumber).toNumber())
  }
}

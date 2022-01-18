<template>
  <div id="token-info">
    <h4 id="price" class="text-green">
      ${{ formattedPrice }}
      <small class="difference" :class="[todayPricePercent() < 0 ? 'text-red': 'text-green']">
        <template v-if="todayPricePercent()">
          24h: {{ todayPricePercent() }}%
        </template>
      </small>
    </h4>
    <perfect-scrollbar class="token-info">
      <h4>
        <small class="text-grey-second">
          24h Volume
          <span :class="[todayVolumePercent() < 0 ? 'text-red': 'text-green']">
            <template v-if="todayVolumePercent()">
              ({{ todayVolumePercent() }}%)
            </template>
          </span>
        </small>
        <br>
        ${{ todayVolume.tradeAmount.toFixed(2) }}
      </h4>
      <h4>
        <small class="text-grey-second">
          24h Trades
          <span :class="[todayTradesPercent() < 0 ? 'text-red': 'text-green']">
            <template v-if="todayTradesPercent()">
              ({{ todayTradesPercent() }}%)
            </template>
          </span>
        </small>
        <br>
        {{ todayVolume.trades }}
      </h4>
      <h4>
        <small class="text-grey-second">
          Ownership renouncement
        </small>
        <br>
        <span :class="[ownershipRenouncement ? 'text-green' : 'text-red']">
          {{ ownershipRenouncement ? 'Yes' : 'No' }}
        </span>
      </h4>
      <h4>
        <small class="text-grey-second">
          Liquidity ({{ currentPool.name }})
          <span class="text-red">
            ({{ formattedBurnedLiquidity }}% burned)
          </span>
        </small>
        <br>
        <a target="_blank" :href="`${currentChain.explorer}/token/${tokenData.lp}`">
          ${{ formattedLiquidity }}
        </a>
      </h4>
      <h4>
        <small class="text-grey-second">
          Locked liquidity DexSale + UniCrypt ({{ currentPool.name }})
        </small>
        <br>
        <span :class="[formattedLockedLiquidity >= 50 ? 'text-green' : 'text-red']">
          {{ formattedLockedLiquidity.toFixed(0) }}%
        </span>
      </h4>
      <h4>
        <small class="text-grey-second">
          Market Cap
        </small>
        <br>
        ${{ marketCap }}
      </h4>
      <h4>
        <small class="text-grey-second">
          Total supply
          <span class="text-red">
            ({{ formattedBurnedSupply }} burned)
          </span>
        </small>
        <br>
        {{ formattedTotalSupply }}
      </h4>
      <h4>
        <small class="text-grey-second">
          Locked supply DexSale + UniCrypt ({{ currentPool.name }})
        </small>
        <br>
        {{ formattedLockedSupply }}
      </h4>
      <h4>
        <small class="text-grey-second">
          Circulating supply
        </small>
        <br>
        {{ formattedCirculatedSupply }}
      </h4>
    </perfect-scrollbar>
  </div>
</template>

<script lang="ts" src="./src/token.ts">
</script>
<style scoped lang="stylus">
  @import 'assets/css/components/token.styl'
</style>

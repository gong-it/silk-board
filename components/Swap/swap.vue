<template>
  <div>
    <div>
      <div class="current-balance">
        {{ fromBalance }} {{  from.symbol }}
        <template v-if="fromBalance !== 0">
          <button-component v-if="from.amount !== fromBalance" type="primary" size="small" classes="btn--link" @click="max">
            Add max
          </button-component>
          <button-component v-else type="primary" size="small" classes="btn--link" @click="reset">
            Reset
          </button-component>
        </template>
      </div>
      <input-component
        id="from-bar"
        name="from"
        placeholder="from"
        type="number"
        :value="from.amount"
        :min="1"
        :readonly="calculating.from"
        @input="setFromAmountDelayed($event)"
      >
        <template v-slot:right>
          <div class="token-logo-container">
            <img v-if="from.address !== ''" :src="getTokenLogo(from.address)">
          </div>
          <div class="token-symbol-container">
            {{ from.symbol }}
          </div>
          <button-component v-if="from.main" classes="btn--link" @click="dropdown">
            <arrow-partial :class="{'arrow--active': active}" />
          </button-component>
        </template>
        <template v-slot:bottom>
          <div class="dropdown" :class="{'dropdown--active': from.main && active}">
            <ul>
              <li v-for="currency in currencies" :key="`currency-${currency.symbol.toLowerCase()}`" @click="chooseFromCurrency(currency)">
                <div class="dropdown__left">
                  <div class="token-logo-container">
                    <img :src="getTokenLogo(currency.address)">
                  </div>
                  {{ currency.symbol }}
                </div>
                <div class="dropdown__right">
                  {{ balanceOf(currency.symbol) }}
                </div>
              </li>
            </ul>
          </div>
        </template>
      </input-component>
      <button-component id="swap-button" type="circle" @click="swap">
        <arrow></arrow>
      </button-component>
      <input-component
        id="to-bar"
        name="to"
        placeholder="to"
        type="number"
        :value="to.amount"
        :min="1"
        :readonly="calculating.to"
        @input="setToAmountDelayed($event)"
      >
        <template v-slot:right>
          <div class="token-logo-container">
            <img v-if="to.address !== ''" :src="getTokenLogo(to.address)">
          </div>
          <div class="token-symbol-container">
            {{ to.symbol }}
          </div>
          <button-component v-if="to.main" classes="btn--link" @click="dropdown">
            <arrow-partial :class="{'arrow--active': active}" />
          </button-component>
        </template>
        <template v-slot:bottom>
          <div class="dropdown" :class="{'dropdown--active': to.main && active}">
            <ul>
              <li v-for="currency in currencies" :key="`currency-${currency.symbol.toLowerCase()}`" @click="chooseFromCurrency(currency)">
                <div class="dropdown__left">
                  <div class="token-logo-container">
                    <img :src="getTokenLogo(currency.address)">
                  </div>
                  {{ currency.symbol }}
                </div>
                <div class="dropdown__right">
                  {{ balanceOf(currency.symbol) }}
                </div>
              </li>
            </ul>
          </div>
        </template>
      </input-component>
      <input-component
        id="slippage-bar"
        classes="text-center"
        v-model="slippage"
        label="Slippage percent"
        name="slippage"
        placeholder="slippage"
        type="number"
        loading-text="Adjusting"
        :min="1"
        :loading="slippageLoading"
      >
        <template v-slot:left>
          <button-component classes="btn--link" type="secondary" @click="slippage--">
            -
          </button-component>
        </template>
        <template v-slot:right>
          <button-component classes="btn--link" type="secondary" @click="slippage++">
            +
          </button-component>
        </template>
      </input-component>
      <button-component classes="w-100" type="success" :disabled="!user.auth">
        {{ user.auth ? 'Buy' : 'Please, connect wallet' }}
      </button-component>
    </div>
  </div>
</template>

<script lang="ts" src="./src/swap.ts">
</script>
<style scoped lang="stylus">
@import 'assets/css/components/swap.styl'
</style>

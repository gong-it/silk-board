/* eslint-disable camelcase */

import { BigNumber } from 'bignumber.js'

export interface IBarCurrency {
  address: string
}

export interface IBarIntervalMinute {
  minute: string
}

export interface IBarIntervalDay {
  day: string
}

export interface ISubscriptionBar {
  time: number
  price: BigNumber,
  tradeAmount: number
}

export interface IBigNumberBar {
  time: number,
  open: BigNumber,
  close: BigNumber,
  low: BigNumber,
  high: BigNumber,
  volume: number,
  tradeAmount: number
}

export interface IFormattedBar {
  time: number,
  open: number,
  close: number,
  low: number,
  high: number,
  volume: number,
  tradeAmount: number
}

export interface IBar {
  baseCurrency: IBarCurrency,
  close_price: string,
  maximum_price: number,
  minimum_price: number,
  open_price: string,
  quoteCurrency: IBarCurrency,
  timeInterval: IBarIntervalMinute,
  tradeAmount: number,
  trades: number
}

export interface IDailyVolume {
  baseCurrency: IBarCurrency,
  quoteCurrency: IBarCurrency,
  quotePrice: number,
  tradeAmount: number,
  trades: number,
  timeInterval: IBarIntervalDay
}

export interface IBarResponse {
  data: {
    ethereum: {
      dailyVolume: IDailyVolume[]
      dexTrades: IBar[]
    }
  }
}

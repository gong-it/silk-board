// https://0x.org/docs/api#introduction

export type RouterUrl = 'https://api.0x.org/' | 'https://bsc.api.0x.org/' | 'https://ropsten.api.0x.org/' | 'https://polygon.api.0x.org/'

interface IRouterQuote {
  sellToken: string,
  buyToken: string,
  slippagePercentage: number
}

export interface IRouterSellQuote extends IRouterQuote {
  sellAmount: string
}

export interface IRouterBuyQuote extends IRouterQuote {
  buyAmount: string
}

export interface IRouter {
}

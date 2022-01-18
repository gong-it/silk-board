export interface IBalance {
  balance: number,
  decimals: number
}

export interface IBalanceList {
  [key: string]: IBalance
}

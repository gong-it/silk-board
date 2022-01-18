import { pcsV1, pcsV2, uniV2 } from '~/src/chain/pools'
import { IExchange } from '~/src/interfaces/IChain'

export const pcs: IExchange = {
  name: 'pcs',
  desc: 'PancakeSwap',
  value: 'pcs',
  pools: {
    pcsV1,
    pcsV2
  },
  additionalCurrencies: {
    BNB: {
      symbol: 'BNB',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18
    },
    USDT: {
      symbol: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18
    },
    BTCB: {
      symbol: 'BTCB',
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      decimals: 18
    }
  }
}

export const uni: IExchange = {
  name: 'uni',
  desc: 'UniSwap',
  value: 'uni',
  pools: {
    uniV2
  }
}

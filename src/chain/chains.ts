import {
  bscHttpDataSeed,
  bscWsDataSeed,
  ercHttpDataSeed,
  ercWsDataSeed,
  multicallBsc,
  multicallMainnet
} from '~/src/constants'
import { pcs, uni } from '~/src/chain/exchanges'
import { IChain } from '~/src/interfaces/IChain'

export const bsc: IChain = {
  id: 56,
  name: 'bsc',
  fullName: 'Binance Smart Chain',
  dataSeed: bscHttpDataSeed,
  wsDataSeed: bscWsDataSeed,
  multiCall: multicallBsc,
  routerUrl: 'https://bsc.api.0x.org/',
  explorer: 'https://bscscan.com',
  exchanges: {
    pcs
  }
}

export const mainNet: IChain = {
  id: 1,
  name: 'ethereum',
  fullName: 'Ethereum Mainnet',
  dataSeed: ercHttpDataSeed,
  wsDataSeed: ercWsDataSeed,
  multiCall: multicallMainnet,
  routerUrl: 'https://api.0x.org/',
  explorer: 'https://etherscan.io',
  exchanges: {
    uni
  }
}

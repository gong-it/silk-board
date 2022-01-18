import { IPresetConfig } from '@wonderwall/multicall'
import { AbiItem } from 'web3-utils'
import { IAbiList, IChain, IChainList, IExchange, IPool } from '~/src/interfaces/IChain'
import pcsV1Abi from '~/assets/abi/pcsV1.json'
import pcsV2Abi from '~/assets/abi/pcsV2.json'
import pcsLPAbi from '~/assets/abi/pcsLP.json'
import uniV2Abi from '~/assets/abi/uniV2.json'
import uniLPAbi from '~/assets/abi/uniLP.json'
import uniCryptTokenLockerAbi from '~/assets/abi/uniCryptTokenLocker.json'
import { bsc, mainNet } from '~/src/chain/chains'

export default class ChainState {
  list: IChainList = {
    [mainNet.id]: mainNet,
    [bsc.id]: bsc
  }

  currentChain!: IChain
  currentExchange!: IExchange
  currentPool!: IPool

  abiList: IAbiList = {
    pcsV1: pcsV1Abi as AbiItem[],
    pcsV2: pcsV2Abi as AbiItem[],
    pcsLP: pcsLPAbi as AbiItem[],
    uniV2: uniV2Abi as AbiItem[],
    uniLP: uniLPAbi as AbiItem[],
    uniCryptTokenLockerAbi: uniCryptTokenLockerAbi as AbiItem[]
  }

  multiCallConfig: IPresetConfig = { preset: bsc.name }
}

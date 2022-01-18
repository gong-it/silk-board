import { IPool } from '~/src/interfaces/IChain'

export const pcsV1: IPool = {
  name: 'pcsV1',
  address: '0xBCfCcbde45cE874adCB698cC183deBcF17952812',
  router: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F',
  lpAbi: 'pcsLP',
  baseCurrency: {
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    alias: 'BNB'
  },
  quoteCurrency: {
    symbol: 'BUSD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    alias: 'USD'
  },
  dexSaleAddress: '0x9c55c9E02295B3E8C00501358E8289afc8b39edF',
  uniCryptAddress: '0xc8B839b9226965caf1d9fC1551588AaF553a7BE6',
  uniCryptTokenAddress: '0xeaEd594B5926A7D5FBBC61985390BaAf936a6b8d'
}

export const pcsV2: IPool = {
  name: 'pcsV2',
  address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  lpAbi: 'pcsLP',
  baseCurrency: {
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    alias: 'BNB'
  },
  quoteCurrency: {
    symbol: 'BUSD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    alias: 'USD'
  },
  dexSaleAddress: '0xeb3a9c56d963b971d320f889be2fb8b59853e449',
  dexSaleTokenAddress: '0x2D045410f002A95EFcEE67759A92518fA3FcE677',
  uniCryptAddress: '0xc765bddb93b0d1c1a88282ba0fa6b2d00e3e0c83',
  uniCryptTokenAddress: '0xeaEd594B5926A7D5FBBC61985390BaAf936a6b8d'
}

export const uniV2: IPool = {
  name: 'uniV2',
  address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  lpAbi: 'uniLP',
  baseCurrency: {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    alias: 'ETH'
  },
  quoteCurrency: {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    alias: 'USD'
  },
  dexSaleAddress: '',
  uniCryptAddress: '0x663A5C229c09b049E36dCc11a9B0d4a8Eb9db214',
  uniCryptTokenAddress: '0xDba68f07d1b7Ca219f78ae8582C213d975c25cAf'
}

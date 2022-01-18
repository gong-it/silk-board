import { LibrarySymbolInfo } from '~/plugins/tradingview/charting_library'
import { IChainCurrency, IPool } from '~/src/interfaces/IChain'

export interface ISymbolInfoExt extends LibrarySymbolInfo {
  factories: IPool['address'][],
  baseCurrency: IChainCurrency,
  usdCurrency: IChainCurrency
}

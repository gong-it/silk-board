import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { ISymbolInfoExt } from '~/src/interfaces/ISymbolInfoExt'
import { IPool } from '~/src/interfaces/IChain'

export interface IHistoryProvider {
  network: string,
  info: ISymbolInfoExt,
  since: number,
  till: number,
  interval: number,
  axios: NuxtAxiosInstance,
  pool: IPool
}

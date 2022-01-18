import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { IRouterBuyQuote, IRouterSellQuote, RouterUrl } from '~/src/interfaces/IRouter'

export default class Router {
  private url!: RouterUrl
  private axios!: NuxtAxiosInstance

  constructor (url: RouterUrl, axios: NuxtAxiosInstance) {
    this.url = url
    this.axios = axios
  }

  quote (routerQuote: IRouterSellQuote | IRouterBuyQuote) {
    return this.axios.get(`${this.url}swap/v1/quote`, { params: routerQuote })
  }
}

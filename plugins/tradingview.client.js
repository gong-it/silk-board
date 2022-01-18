import { widget } from './tradingview/charting_library'

export default ({ _ }, inject) => {
  inject('TradingView', widget)
}

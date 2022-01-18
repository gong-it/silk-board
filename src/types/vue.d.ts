import { ChartingLibraryWidgetConstructor } from '~/plugins/tradingview/charting_library'

declare module 'vue/types/vue' {
  interface Vue {
    $TradingView: ChartingLibraryWidgetConstructor
  }
}

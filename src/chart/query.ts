export default `
    query GetChartsData(
        $network: EthereumNetwork!,
        $since: ISO8601DateTime!,
        $till: ISO8601DateTime!,
        $dailySince: ISO8601DateTime!,
        $dailyTill: ISO8601DateTime!,
        $baseCurrency: String!,
        $quoteCurrency: String!,
        $usdCurrency: String!,
        $exchangeAddresses: [String!],
        $tradeAmountUsd: Float!,
        $interval: Int
    ) {
      ethereum(network: $network) {
        dailyVolume: dexTrades(
          date: {since: $dailySince, till: $dailyTill}
          exchangeAddress: {in: $exchangeAddresses}
          tradeAmountUsd: {gt: $tradeAmountUsd}
          any: [
            {
                baseCurrency: {is: $baseCurrency}
                quoteCurrency: {is: $quoteCurrency}
            }
            {
                baseCurrency: {is: $quoteCurrency}
                quoteCurrency: {is: $usdCurrency}
            }
          ]
        ) {
          timeInterval {
            day(count: 1, format: "%Y-%m-%dT%H:%M:%SZ")
          }
          baseCurrency {
            address
          }
          quoteCurrency {
            address
          }
          tradeAmount(in: USD)
          trades: count
          quotePrice
        }
        dexTrades(
          options: {asc: "timeInterval.minute"}
          date: {since: $since, till: $till}
          exchangeAddress: {in: $exchangeAddresses}
          tradeAmountUsd: {gt: $tradeAmountUsd}
          any: [
            {
                baseCurrency: {is: $baseCurrency}
                quoteCurrency: {is: $quoteCurrency}
            }
            {
                baseCurrency: {is: $quoteCurrency}
                quoteCurrency: {is: $usdCurrency}
            }
          ]
        ) {
          timeInterval {
            minute(count: $interval, format: "%Y-%m-%dT%H:%M:%SZ")
          }
          baseCurrency {
            address
          }
          quoteCurrency {
            address
          }
          tradeAmount(in: USD)
          trades: count
          maximum_price: quotePrice(calculate: maximum)
          minimum_price: quotePrice(calculate: minimum)
          open_price: minimum(of: block, get: quote_price)
          close_price: maximum(of: block, get: quote_price)
        }
      }
    }
`

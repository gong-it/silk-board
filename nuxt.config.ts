import { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'SilkBoard',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  server: {
    port: 1234
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'normalize.css',
    '@/assets/css/global.styl'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/tradingview.client.js',
    '~/plugins/toast.client.ts',
    '~/plugins/perfectScrollbar.client.ts'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '@nuxtjs/dayjs',
    '~/modules/svgLoader.ts'
  ],

  proxy: {
    '/api/': {
      target: process.env.BACKEND_URL || '',
      pathRewrite: { '^/api/': '' },
      ws: false
    }
  },

  env: {
    WEBSOCKET_BSC_NODE: process.env.WEBSOCKET_BSC_NODE || '',
    HTTP_BSC_NODE: process.env.HTTP_BSC_NODE || '',
    WEBSOCKET_ERC_NODE: process.env.WEBSOCKET_ERC_NODE || '',
    HTTP_ERC_NODE: process.env.HTTP_ERC_NODE || ''
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    proxy: true
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      'lodash-es'
    ]
  },
  dayjs: {
    plugins: ['isToday']
  }
}

export default config

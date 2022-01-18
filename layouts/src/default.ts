
import { Vue, Component } from 'nuxt-property-decorator'

import loader from '~/components/loader.vue'
import header from '~/components/header.vue'

@Component({
  components: {
    loader,
    headerComponent: header
  }
})
export default class DefaultLayout extends Vue {
  loading: boolean = true
  async mounted () {
    const WebFont = require('webfontloader')
    await WebFont.load({
      google: {
        families: ['Red Hat Display:400,700,800']
      },
      active: () => {
        this.loading = false
      }
    })
  }
}

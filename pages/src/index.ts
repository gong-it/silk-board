import { Vue, Component } from 'nuxt-property-decorator'

import Chart from '~/components/dashboard/chart.vue'
import Token from '~/components/Token/token.vue'
import Swap from '~/components/Swap/swap.vue'

@Component({
  components: {
    Chart,
    Token,
    Swap
  }
})
export default class IndexPage extends Vue {
}

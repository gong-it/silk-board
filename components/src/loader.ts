import { Vue, Component, Prop } from 'nuxt-property-decorator'

import oasis from '~/assets/images/Loader/oasis.svg'

@Component({
  components: {
    oasis
  }
})
export default class LoaderComponent extends Vue {
  @Prop({ type: Boolean, default: false }) readonly fitHeight!: boolean
}

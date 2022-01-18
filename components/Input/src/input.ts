
import { Vue, Component, Prop, Emit, Watch } from 'nuxt-property-decorator'

@Component
export default class InputComponent extends Vue {
  @Prop({ type: String }) readonly error!: string
  @Prop({ type: String, required: false }) readonly label!: string
  @Prop({ type: String, required: true }) readonly name!: HTMLInputElement['name']
  @Prop({ type: String, required: true }) readonly placeholder!: HTMLInputElement['placeholder']
  @Prop({ required: true }) readonly value!: HTMLInputElement['value']
  @Prop({ type: String, default: 'text' }) readonly type!: HTMLInputElement['type']
  @Prop({ type: Boolean, default: false }) readonly required!: HTMLInputElement['required']
  @Prop({ type: Boolean, default: false }) readonly readonly!: boolean
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: String, default: 'Loading' }) readonly loadingText!: string
  @Prop({ type: Number }) readonly minlength!: HTMLInputElement['minLength']
  @Prop({ type: Number }) readonly maxlength!: HTMLInputElement['maxLength']
  @Prop({ type: String }) readonly pattern!: HTMLInputElement['pattern']
  @Prop({ type: String }) readonly classes!: string

  localType: HTMLInputElement['type'] = this.type
  localValue = '' // The property has to have a value assigned to it to be reactive

  created () {
    if (this.localType === 'date') {
      this.localValue = this.$dayjs(this.value, 'DD.MM.YYYY').format('YYYY-MM-DD')
    }
  }

  @Emit('input')
  input (value: HTMLInputElement['value']) {
    return value
  }

  @Watch('value', { immediate: true })
  onValueChanged (val: string) {
    this.localValue = val
  }
}

import { Vue, Component, Prop, Emit } from 'nuxt-property-decorator'

export enum Buttons {
  Primary = 'primary',
  Secondary = 'secondary',
  Single = 'single',
  Danger = 'danger',
  Success = 'success',
  Circle = 'circle'
}

export enum ButtonSizes {
  Small = 'small',
  Medium = 'medium'
}

@Component
export default class ButtonComponent extends Vue {
  @Prop({ type: String, default: Buttons.Primary }) readonly type!: Buttons
  @Prop({ type: String, default: ButtonSizes.Medium }) readonly size!: ButtonSizes
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Boolean, default: false }) readonly disabled!: boolean
  @Prop({ type: Boolean, default: false }) readonly submit!: boolean
  @Prop({ type: String }) readonly classes!: string

  get loadingClass () {
    return this.loading ? 'btn--loading' : ''
  }

  get buttonClass () {
    return `btn--${this.type}`
  }

  get buttonSize () {
    return `btn--${this.size}`
  }

  get nativeType () {
    return this.submit ? 'submit' : 'button'
  }

  get hasIcon () {
    return !!this.$slots.icon
  }

  @Emit('click')
  click (e: MouseEvent) {
    return e
  }
}

import { defineComponent } from 'vue'
import { Slider as ASlider, type SliderProps } from 'ant-design-vue/es'
import './slider.less'

export const Slider = defineComponent({
  setup (props: SliderProps, { slots }) {
    return (): JSX.Element => <ASlider class='cube-slider' {...props} v-slots={slots} />
  }
})

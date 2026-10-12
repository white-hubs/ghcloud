import { type PropType, computed, defineComponent, reactive } from 'vue'
import { avueEchartText } from './text-box'
import { avueEchartImg } from './img-box'
import { avueEchartQr } from './qrcode-box'
import type { DesignConfig, Layer } from '../../types/qrcode-type'

export const PreView = defineComponent({
  components: { avueEchartText, avueEchartImg, avueEchartQr },
  props: {
    designConfig: {
      type: Object as PropType<DesignConfig>,
      default: () => {
        return {}
      }
    }
  },
  setup: (props) => {
    const designConfig = reactive<DesignConfig>(typeof props.designConfig === 'string' ? JSON.parse(props.designConfig) : props.designConfig)

    const panelStyle = computed(() => {
      return {
        width: props.designConfig?.width + 'px',
        height: props.designConfig?.height + 'px',
        backgroundColor: props.designConfig?.backgroundColor,
        backgroundImage: `url(${props.designConfig?.backgroundImage})`,
        backgroundSize: '100% 100%',
        position: 'relative'
      }
    })
    return () => (
      <>
        <div
          class='panel' style={panelStyle.value}
          id='qrcodepanel'
        >
          {
           designConfig.layers.map((item: Layer, index: number) => {
             return (
               <div key={index}>
                 <avueEchartText itemOption={item} />
                 <avueEchartImg itemOption={item} />
                 <avueEchartQr itemOption={item} />
               </div>
             )
           })
          }
        </div>
      </>
    )
  }
})

import { computed, defineComponent, type CSSProperties, type PropType } from 'vue'
import { avueEchartText } from './text-box'
import { avueEchartImg } from './img-box'
import { avueEchartQr } from './qrcode-box'
export interface Component {
  top: number;
  left: number;
  name: string;
  width: number;
  height: number;
}

export interface Layer {
  component: Component;
  imgId: string;
  index: string;
  id: string;
  type: string;
  url: string;
}

export interface DesignConfig {
  backgroundColor: string;
  imgId: string;
  backgroundImage: string;
  name: string;
  width: string;
  layers: Layer[];
  height: string;
}

export const PreView = defineComponent({
  components: { avueEchartText, avueEchartImg, avueEchartQr },
  props: {
    designConfig: {
      type: Object as PropType<DesignConfig>,
      default: ''
    }
  },
  setup: (props) => {
    const designConfig = props.designConfig
    const panelStyle = computed(() => {
      return {
        width: props.designConfig.width + 'px',
        height: props.designConfig.height + 'px',
        backgroundColor: props.designConfig.backgroundColor,
        backgroundImage: `url(${props.designConfig.backgroundImage})`,
        backgroundSize: '100% 100%',
        position: 'relative'
      }
    })
    return (): JSX.Element => (
      <>
        <div
          class='panel' style={panelStyle.value as CSSProperties}
          id='qrcodepanel'
        >
          {
            designConfig.layers.map((item, index) => {
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

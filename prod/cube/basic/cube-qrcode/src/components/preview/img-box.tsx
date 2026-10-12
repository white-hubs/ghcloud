import { type PropType, computed, defineComponent } from 'vue'

export interface Component {
  top: number;
  left: number;
  name: string;
  width: number;
  height: number;
}

export interface Layer {
  option: {
    color: string;
    backgroundColor: string;
    fontSize: number;
    textAlign: string;
    fontWeight: string;
  };
  text: string;
  component: Component;
  imgId: string;
  index: string;
  id: string;
  type: string;
  url: string;
}

export const avueEchartImg = defineComponent({
  props: {
    itemOption: {
      type: Object as PropType<Layer>,
      default: () => {
        return {}
      }
    }
  },
  setup: (props) => {
    const itemOption = props.itemOption
    const itemStyle = computed(() => {
      return {
        width: props.itemOption.component.width + 'px',
        height: props.itemOption.component.height + 'px',
        position: 'absolute',
        top: props.itemOption.component.top + 'px',
        left: props.itemOption.component.left + 'px',
      }
    })
    return () => (
      <>
        <img class={itemOption.component.name} v-show={itemOption.component.name === 'img'} src={itemOption.url} style={itemStyle.value} />
      </>
    )
  }
})

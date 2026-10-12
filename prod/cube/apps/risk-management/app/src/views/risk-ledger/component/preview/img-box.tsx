import { computed, defineComponent, type CSSProperties } from 'vue'

export const avueEchartImg = defineComponent({
  props: {
    itemOption: {
      type: Object,
      default: ''
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
    return (): JSX.Element => (
      <>
        <img class={itemOption.component.name} v-show={itemOption.component.name === 'img'} src={itemOption.url} style={itemStyle.value as CSSProperties} />
      </>
    )
  }
})

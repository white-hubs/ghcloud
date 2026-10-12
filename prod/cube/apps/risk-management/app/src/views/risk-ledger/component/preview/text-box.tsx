import { computed, defineComponent, type CSSProperties } from 'vue'

export const avueEchartText = defineComponent({
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
        color: props.itemOption.option.color,
        backgroundColor: props.itemOption.option.backgroundColor,
        'font-size': props.itemOption.option.fontSize + 'px',
        textAlign: props.itemOption.option.textAlign,
        fontWeight: props.itemOption.option.fontWeight,
        fontFamily: 'SourceHanSansSC-Bold',
        overflowWrap: 'break-word'
      }
    })
    return (): JSX.Element => (
      <>
        <div class={itemOption.component.name} v-show={itemOption.component.name === 'text'} style={itemStyle.value as CSSProperties}>{itemOption.text}</div>
      </>
    )
  }
})

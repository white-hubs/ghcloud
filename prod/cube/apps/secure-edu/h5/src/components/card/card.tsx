import { defineComponent, type PropType } from 'vue'
import { Image } from 'vant'
import './card.less'

/** 卡片 */
interface ContentTye {
  label?: string;
  text?: string;
  textColor?: string;
}
export const Card = defineComponent({
  emits: ['click'],
  props: {
    url: {
      type: String,
      default: () => ''
    },
    title: {
      type: Object as PropType<ContentTye>,
      default: () => {
        return { label: '', text: '', textColor: '' }
      }
    },
    content: {
      type: Array as PropType<ContentTye[]>,
      default: () => {
        return [{ label: '', text: '' }]
      }
    },
  },
  setup (props, { slots, emit }) {
    const handleClick = (): void => {
      emit('click')
    }
    return (): JSX.Element =>
      <div class='card' onClick={handleClick}>
        <div class='card-left'>
          {slots.left?.()}
          <Image width='60' height='60' style={{ flexShrink: 0 }} round src='https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' />
        </div>
        <div class='card-right'>
          <div class='card-title'>
            {slots.title?.()}
            <span class='title-name'>{props.title?.label}</span>
            <span class='title-status' style={{ color: props.title?.textColor }}>{props.title?.text}</span>
          </div>
          <div class='card-content'>
            {slots.content?.()}
            {props.content.map((item: { label?: string; text?: string; }, index: number) =>
              <div key={index} class='content-item'>
                <span>{item.label}</span>
                <span>{item.text}</span>
              </div>)}
          </div>
        </div>
      </div>
  }
})

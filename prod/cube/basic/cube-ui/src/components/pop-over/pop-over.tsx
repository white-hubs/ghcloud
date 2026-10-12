import { type CSSProperties, defineComponent } from 'vue'
import { Popover } from 'ant-design-vue/es'
import type { TooltipPlacement } from 'ant-design-vue/es/tooltip'
interface Props {
  title?: string;
  content?: string;
  disabled?: boolean;
  trigger?: ('click' | 'hover' | 'contextmenu')[];
  placement?: TooltipPlacement;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  color?: string;
}

export default defineComponent({
  props: ['title', 'content', 'trigger', 'placement', 'overlayClassName', 'overlayStyle', 'disabled', 'color'],
  emits: ['visibleChange', 'openChange'],
  setup (props: Props, { slots, emit }) {
    return (): JSX.Element => (
      <Popover
        v-slots={slots}
        {...props}
        onOpenChange={(open: boolean) => {
          emit('visibleChange', open)
          emit('openChange', open)
        }}
      />
    )
  },
})

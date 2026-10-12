import { defineComponent, type RendererElement, type RendererNode, type VNode } from 'vue'
import { Dropdown as ADropdown } from 'ant-design-vue'
interface Props {
  disabled?: boolean;
  trigger?: ('click' | 'hover' | 'contextmenu')[];
  overlay: () => JSX.Element;
  placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
}

export const DropDown = defineComponent({
  props: ['disabled', 'trigger', 'overlay', 'placement'],
  setup (props: Props, { slots }) {
    const slot = {
      default: (): JSX.Element => <a class='ant-dropdown-link'>{slots.default?.()}</a>,
      overlay: (): VNode<RendererNode, RendererElement, Record<string, unknown>>[] | undefined=> slots.overlay?.()
    }
    return (): JSX.Element=> <ADropdown v-slots={slot} disabled={props.disabled ?? false} trigger={props.trigger ?? 'hover'} />
  }
})

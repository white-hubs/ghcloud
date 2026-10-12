import { Menu as AMenu, MenuItem as AMenuItem, SubMenu as ASubMenu } from "ant-design-vue";
import type { MenuProps } from "ant-design-vue/es/menu";
import { defineComponent, getCurrentInstance } from "vue";

export const Menu = defineComponent({
  props: ["selectedKeys", "openKeys", "theme", "mode", "inlineCollapsed"],
  emits: ["update:selectedKeys"],
  setup(props: MenuProps, { slots, emit, attrs }) {
    return (): JSX.Element => (
      <AMenu
        {...props}
        {...attrs}
        onUpdate:selectedKeys={(value: string[]) => {
          emit("update:selectedKeys", value);
        }}
        theme={props.theme}
        mode={props.mode ?? "vertical"}
      >
        {slots}
      </AMenu>
    );
  },
});
interface Props {
  title?: string;
  icon?: unknown;
  key?: string;
  eventkey?: string;
  test?: string;
  disabled?: boolean;
}
export const MenuItem = defineComponent({
  props: ["title", "icon", "key", "disabled", "eventkey"],
  emits: ["click"],
  setup(props: Props, { slots, emit }) {
    const instance = getCurrentInstance();
    const vnodeKey = instance?.vnode.key as string | undefined;
    const itemKey = props.eventkey ?? vnodeKey;

    const onclick = (): void => {
      // emit 子组件向父组件传值
      emit("click");
    };
    return (): JSX.Element => (
      <AMenuItem disabled={props.disabled} title={props.title} icon={props.icon} key={itemKey} onClick={onclick}>
        {slots}
      </AMenuItem>
    );
  },
});
export const SubMenu = defineComponent({
  props: ["title", "icon", "key", "disabled", "eventkey"],
  setup(props: Props, { slots }) {
    return (): JSX.Element => (
      <ASubMenu {...props} disabled={props.disabled} title={props.title} icon={props.icon} key={props.eventkey}>
        {slots}
      </ASubMenu>
    );
  },
});

import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const Header = defineComponent({
  name: "Header",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="Header-stub">{slots.default?.()}</div>;
  },
});

export default Header;

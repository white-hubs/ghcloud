import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const Tabs = defineComponent({
  name: "Tabs",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="Tabs-stub">{slots.default?.()}</div>;
  },
});

export default Tabs;

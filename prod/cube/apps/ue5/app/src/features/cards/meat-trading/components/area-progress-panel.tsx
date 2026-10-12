import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const AreaProgressPanel = defineComponent({
  name: "AreaProgressPanel",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="AreaProgressPanel-stub">{slots.default?.()}</div>;
  },
});

export default AreaProgressPanel;

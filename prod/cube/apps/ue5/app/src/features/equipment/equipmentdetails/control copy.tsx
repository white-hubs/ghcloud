import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const ControlCopy = defineComponent({
  name: "ControlCopy",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="ControlCopy-stub">{slots.default?.()}</div>;
  },
});

export default ControlCopy;

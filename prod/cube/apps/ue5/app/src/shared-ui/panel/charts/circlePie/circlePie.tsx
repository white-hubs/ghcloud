import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const CirclePie = defineComponent({
  name: "CirclePie",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="CirclePie-stub">{slots.default?.()}</div>;
  },
});

export default CirclePie;

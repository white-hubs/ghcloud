import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const Pie = defineComponent({
  name: "Pie",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="Pie-stub">{slots.default?.()}</div>;
  },
});

export default Pie;

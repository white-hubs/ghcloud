import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const Pillar = defineComponent({
  name: "Pillar",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="Pillar-stub">{slots.default?.()}</div>;
  },
});

export default Pillar;

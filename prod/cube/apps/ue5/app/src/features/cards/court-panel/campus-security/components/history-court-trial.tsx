import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const HistoryCourtTrial = defineComponent({
  name: "HistoryCourtTrial",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="HistoryCourtTrial-stub">{slots.default?.()}</div>;
  },
});

export default HistoryCourtTrial;

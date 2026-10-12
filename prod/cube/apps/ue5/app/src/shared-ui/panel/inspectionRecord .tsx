import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const InspectionRecord = defineComponent({
  name: "InspectionRecord",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="InspectionRecord-stub">{slots.default?.()}</div>;
  },
});

export default InspectionRecord;

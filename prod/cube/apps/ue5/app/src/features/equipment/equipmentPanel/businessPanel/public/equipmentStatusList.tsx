import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const EquipmentStatusList = defineComponent({
  name: "EquipmentStatusList",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="EquipmentStatusList-stub">{slots.default?.()}</div>;
  },
});

export default EquipmentStatusList;

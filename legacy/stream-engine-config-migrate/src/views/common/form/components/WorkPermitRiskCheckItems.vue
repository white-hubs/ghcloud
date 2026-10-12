<template>
  <work-permit-associated-items
    v-model="_value"
    :mode="mode"
    :form-data="formData"
    :params="params"
    :params2="params2"
    item-type="RISK_CHECK"
    placeholder="请输入检查项内容"
  />
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import WorkPermitAssociatedItems from "./WorkPermitAssociatedItems.vue";

export default {
  mixins: [componentMinxins],
  name: "WorkPermitRiskCheckItems",
  components: { WorkPermitAssociatedItems },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    params: {
      type: String,
      default: null,
    },
    params2: {
      type: String,
      default: null,
    },
  },
  methods: {
    validate(call) {
      call(true);
    },
  },
};
</script>

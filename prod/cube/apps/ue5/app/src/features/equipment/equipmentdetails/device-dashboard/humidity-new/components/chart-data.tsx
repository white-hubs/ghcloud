import { defineComponent, reactive, toRefs, watch } from "vue";

import ElectricGaugeChart from "@/features/equipment/equipmentdetails/device-dashboard/components/electric-gauge-chart";

import styles from "./chart-data.module.less";

export default defineComponent({
  components: {
    ElectricGaugeChart,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    productPropVoList: {
      type: Object,
      default: [],
    },
    data: {
      type: Object,
      default: {},
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      attributeData: {},
      inputData: [],
    });
    watch(
      () => props.productPropVoList,
      (newVal) => {
        state.codeList = newVal;
      },
      { immediate: true, deep: true },
    );
    watch(
      () => props.data,
      (newVal) => {
        state.attributeData = newVal;
      },
      { immediate: true, deep: true },
    );
    const getCodeValue = (codeName) => {
      try {
        const iotCode = state.codeList.filter((item) => item.propCode === codeName)[0];
        const iotVal = state.attributeData[codeName] ?? "";
        const res = {
          code: iotCode.propCode,
          name: iotCode.propName,
          unit: iotCode.unitName,
          value: iotVal,
        };
        if (["enum", "boolean", "bool"].includes(iotCode.dataType)) {
          const enumCur = iotCode.dataConstraint.filter((e) => e.value === iotVal)[0];
          res.value = enumCur ? enumCur?.label : "";
        }
        return res.value;
      } catch (error) {
        return "";
      }
    };
    return {
      ...toRefs(state),
      getCodeValue,
    };
  },
});

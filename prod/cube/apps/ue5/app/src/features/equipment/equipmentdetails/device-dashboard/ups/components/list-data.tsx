import { defineComponent, reactive, toRefs, watch } from "vue";

import styles from "./list-data.module.less";
const UE5_UPS = "/resource/v1/ue5-migrate/components/equipmentdetails/device-dashboard/ups/assets";
const ups1 = `${UE5_UPS}/ups-1.png`;
const ups2 = `${UE5_UPS}/ups-2.png`;
const ups3 = `${UE5_UPS}/ups-3.png`;
const dc = `${UE5_UPS}/dc.png`;
const yd = `${UE5_UPS}/yd.png`;

export default defineComponent({
  components: {},
  props: {
    baseInfo: {
      type: Object,
      default: {
        fileVO: {
          path: "",
        },
      },
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
  setup(props) {
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      attributeData: {},
    });
    watch(
      () => props.baseInfo,
      (newVal) => {
        state.deviceData = newVal;
      },
      { immediate: true, deep: true },
    );
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
      data: props.data,
      img: {
        ups1,
        ups2,
        ups3,
        dc,
        yd,
      },
    };
  },
});

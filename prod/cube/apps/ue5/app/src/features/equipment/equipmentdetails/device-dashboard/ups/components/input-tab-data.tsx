import { defineComponent, reactive, ref, toRefs, watch } from "vue";

import GaugeChart from "@/features/equipment/equipmentdetails/device-dashboard/components/newGaugeChart";

import styles from "./input-tab-data.module.less";
const xh = "/resource/v1/ue5-migrate/components/equipmentdetails/device-dashboard/ups/assets/xh.png";
import { filterU, filterSame, convertSeconds } from "@/features/equipment/equipmentdetails/device-dashboard/hooks/device-info";

export default defineComponent({
  components: {
    GaugeChart,
  },
  props: {
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
    const activeKey = ref(0);
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
        const isone = filterU(newVal).inv.length > 0;
        const codeObj = {
          inv: filterSame(filterU(newVal, !isone).inv),
          outv: filterSame(filterU(newVal, !isone).outv),
        };
        state.inputData = codeObj.inv;
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
      activeKey,
      img: {
        xh,
      },
      filterU,
      filterSame,
      convertSeconds,
    };
  },
});

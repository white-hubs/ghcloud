import { defineComponent, reactive, toRefs, watch } from "vue";

import GaugeChart from "@/features/equipment/equipmentdetails/device-dashboard/components/newGaugeChart";

import styles from "./out-data.module.less";
const UE5_UPS = "/resource/v1/ue5-migrate/components/equipmentdetails/device-dashboard/ups/assets";
const ups1 = `${UE5_UPS}/ups-1.png`;
const ups2 = `${UE5_UPS}/ups-2.png`;
const ups3 = `${UE5_UPS}/ups-3.png`;
const dcrl1 = `${UE5_UPS}/dcrl-1.png`;
const dcrl2 = `${UE5_UPS}/dcrl-2.png`;
const dc = `${UE5_UPS}/dc.png`;
const yd = `${UE5_UPS}/yd.png`;
const xh = `${UE5_UPS}/xh.png`;
import { filterU, filterSame, convertSeconds } from "@/features/equipment/equipmentdetails/device-dashboard/hooks/device-info";

export default defineComponent({
  components: {
    GaugeChart,
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
  setup(props) {
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      attributeData: {},
      outData: [],
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
        state.outData = codeObj.outv[0];
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
      img: {
        ups1,
        ups2,
        ups3,
        dcrl1,
        dcrl2,
        dc,
        yd,
        xh,
      },
      filterU,
      filterSame,
      convertSeconds,
    };
  },
});

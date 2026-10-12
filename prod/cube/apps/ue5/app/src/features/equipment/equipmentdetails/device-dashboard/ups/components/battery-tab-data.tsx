import { defineComponent, reactive, ref, toRefs, watch } from "vue";

import GuideChart from "@/features/equipment/equipmentdetails/device-dashboard/components/guide-chart";

import styles from "./battery-tab-data.module.less";
const UE5_UPS = "/resource/v1/ue5-migrate/components/equipmentdetails/device-dashboard/ups/assets";
const ups1 = `${UE5_UPS}/ups-1.png`;
const ups2 = `${UE5_UPS}/ups-2.png`;
const ups3 = `${UE5_UPS}/ups-3.png`;
const dcrl1 = `${UE5_UPS}/dcrl-1.png`;
const dcrl2 = `${UE5_UPS}/dcrl-2.png`;
const dc = `${UE5_UPS}/dc.png`;
const yd = `${UE5_UPS}/yd.png`;
import {
  filterU,
  filterSame,
  convertSeconds,
  getUnit,
  groupArray,
  upsBatteryfilter,
} from "@/features/equipment/equipmentdetails/device-dashboard/hooks/device-info";

export default defineComponent({
  components: {
    GuideChart,
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
    const activeKey = ref(0);
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      batteryData: [],
      attributeData: {},
    });
    watch(
      () => props.productPropVoList,
      (newVal) => {
        state.codeList = newVal;
        state.batteryData = groupArray(upsBatteryfilter(newVal));
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
        if (state.codeList && state.codeList.length > 0) {
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
        } else {
          return "";
        }
      } catch (error) {
        return "";
      }
    };
    return {
      ...toRefs(state),
      activeKey,
      getCodeValue,
      filterU,
      filterSame,
      convertSeconds,
      getUnit,
      img: {
        ups1,
        ups2,
        ups3,
        dcrl1,
        dcrl2,
        dc,
        yd,
      },
    };
  },
});

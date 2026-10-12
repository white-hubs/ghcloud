import { defineComponent } from "vue";
import { reactive, toRefs, onMounted } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./assessment-indicators.module.less";

export const AssessmentIndicators = defineComponent({
  name: "AssessmentIndicators",
  props: {
    overPanelData: { type: Object, required: true },
  },
  setup(props, { expose }) {
    interface data {
      title: string;
      rate: number;
      total: number;
      valueData: {
        label: string;
        value: number;
      }[];
    }
    interface Props {
      overPanelData: data;
    }
    /**
     * 数据部分
     */
    const state = reactive({});
    onMounted(() => {});
    // 使用toRefs解构
    // let { } = { ...toRefs(state) }
    expose({
      ...toRefs(state),
    });

    return (): JSX.Element => (
      <>
        <div class="assessment-indicators">
          <img src={getAssetsImage("radio-icon.png")} alt></img>
          <div class="amount-stat">
            <div class="title"> {overPanelData?.title}</div>
            <div class="value"> {overPanelData?.total}</div>
            <div class="radio-box">
              <span> 同比</span>
              <img src={getAssetsImage("overView9.png")} alt srcset></img>
              <span class="radio-value">{overPanelData?.rate}%</span>
            </div>
          </div>
          <div class="line"></div>
          {overPanelData?.valueData.map((item) => (
            <div class="item">
              <div class="label"> {item.label}</div>
              <div class="value"> {item.value}</div>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default AssessmentIndicators;

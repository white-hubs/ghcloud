import styles from "./scanningChart.module.less";
import { defineComponent } from "vue";

export const ScanningChart = defineComponent({
  name: "ScanningChart",
  props: {

    result: { type: Number, required: true }
  },
  setup(props, ctx) {

    interface Props {
        result: number,
    }
    return (): JSX.Element => (
      <>
<div class="radar">
        <div class="radar1"></div>
        <div class="radar2"></div>
        <div class="radar3"></div>
        <div class="radar4"></div>
        <div class="radar5"></div>
        <div class="horizontal"></div>
        <div class="vertical"></div>
        <div class="content">
          <div class="top">
            <span style="font-size: 20px;">              {props.result}</span>
            分
          </div>
          <div class="bottom">            设备健康度</div>
        </div>
      </div>
      </>
    );
  },
});

export default ScanningChart;

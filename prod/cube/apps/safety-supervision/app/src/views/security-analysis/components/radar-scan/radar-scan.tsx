import style from "./radar-scan.module.less";
import { defineComponent } from "vue";
const analysisLoading = "/resource/v1/safety-supervision/analysis-loading.png";
export const RadarScan = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <div class={style["radar-scan"]}>
        <img src={analysisLoading} alt="" />
      </div>
    );
  },
});

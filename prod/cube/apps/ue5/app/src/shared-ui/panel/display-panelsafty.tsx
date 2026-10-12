import { defineComponent, type PropType } from "vue";

import CountTo from "./count-to/count-to";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./display-panelsafty.module.less";

type ContentItem = {
  name: string;
  value: number | string;
};

export const DisplayPanelsafty = defineComponent({
  name: "DisplayPanelsafty",
  props: {
    contentList: { type: Array as PropType<ContentItem[]>, required: true, default: () => [] },
    bgImg: { type: String, required: true, default: "" },
    showimg: { type: Boolean, required: false, default: true },
  },
  setup(props) {
    const classList = ["right", "mid", "left", "top", "bottom"];

    return (): JSX.Element => (
      <div class="showPanel">
        <div class="bg">
          <img style="width: 1.1614583333333333rem;height: 0.6875rem;" src={getAssetsImage("overView4.png")} alt="" />
          {props.showimg && props.bgImg ? <img class="rotate" src={getAssetsImage(props.bgImg)} alt="" /> : null}
        </div>
        {props.contentList.map((item, index) => (
          <div class={["blister", classList[index]]} key={`${item.name}-${index}`}>
            <div class="ball">
              <img style="width: 100%" src={getAssetsImage("overView15.png")} alt="" />
              {typeof item.value === "string" ? <span class="ball-value">{item.value}</span> : null}
              <CountTo startVal={0} endVal={Number(item.value) || 0} duration={2000} separator="" />
              {typeof item.value === "number" ? <span class="percentage"> %</span> : null}
            </div>
            <div class="blisterTitle">{item.name}</div>
          </div>
        ))}
      </div>
    );
  },
});

export default DisplayPanelsafty;

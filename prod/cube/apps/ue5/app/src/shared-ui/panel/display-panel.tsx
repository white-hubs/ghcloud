import { defineComponent, type PropType } from "vue";

import CountTo from "./count-to/count-to";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./display-panel.module.less";

type ContentItem = {
  name: string;
  value: number;
};

export const DisplayPanel = defineComponent({
  name: "DisplayPanel",
  props: {
    contentList: { type: Array as PropType<ContentItem[]>, required: true, default: () => [] },
    bgImg: { type: String, required: true, default: "" },
    showimg: { type: Boolean, required: false, default: true },
  },
  emits: ["itemClick"],
  setup(props, { emit }) {
    const classList = ["top", "right", "left", "bottom", "mid"];

    const onItemClick = (item: ContentItem): void => {
      emit("itemClick", item);
    };

    return (): JSX.Element => (
      <div class="showPanel">
        <div class="bg">
          <img width="223" height="132" src={getAssetsImage("overView4.png")} alt="" />
          {props.showimg && props.bgImg ? <img class="rotate" src={getAssetsImage(props.bgImg)} alt="" /> : null}
        </div>
        {props.contentList.map((item, index) => (
          <div class={["blister", classList[index]]} key={`${item.name}-${index}`} onClick={() => onItemClick(item)}>
            <div class="ball">
              <img style="width: 100%" src={getAssetsImage("overView15.png")} alt="" />
              <CountTo startVal={0} endVal={Number(item.value) || 0} duration={2000} separator="" />
            </div>
            <div class="blisterTitle">{item.name}</div>
          </div>
        ))}
      </div>
    );
  },
});

export default DisplayPanel;

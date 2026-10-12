import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./display-panel.module.less";

export const DisplayPanel = defineComponent({
  name: "DisplayPanel",
  props: {
    contentList: { type: Array, required: true },
    bgImg: { type: String, required: true },
  },
  emits: ["itemClick"],
  setup(props, { emit }) {
    const classList = ["topLeft", "topRight", "bottomLeft", "bottomRight", "mid"];

    interface list {
      name: string;
      value: number;
    }
    interface Props {
      contentList: list[];
      bgImg: string;
    }
    const emitEvent = (item) => {
      emit("itemClick", item);
    };

    return (): JSX.Element => (
      <>
        <div class="showPanel">
          <div class="bg">
            {" "}
            <img width="180" height="132" src={getAssetsImage("overView4.png")} alt />
          </div>
          {props.contentList.map((item, index) => (
            <div class="blister" class={classList[index]} onClick={emitEvent(item)}>
              <div class="ball">
                <img style="width: 100%" src={getAssetsImage("overView15.png")} alt />
                <count-to startVal={0} endVal={item.value} duration={2000} separator></count-to>
                <div class="blisterTitle"> {item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default DisplayPanel;

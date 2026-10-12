import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./work-situation.module.less";

export const WorkSituation = defineComponent({
  name: "WorkSituation",
  props: {
    contentList: { type: Array, required: true },
  },
  emits: ["handlecurrent"],
  setup(props, { emit }) {
    interface Props {
      contentList: {
        name: string;
        value: string;
      }[];
    }
    const handleCurrent = (item) => {
      emit("handlecurrent", item);
    };
    return (): JSX.Element => (
      <>
        <div class="situation_list">
          {contentList.map((item) => (
            <div class="situation_item" onClick={handleCurrent(item)}>
              <img src={getAssetsImage("overView75.png")} alt></img>
              <div class="situation_title"> {item.name}</div>
              <div class="situation_value"> {item.value}</div>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default WorkSituation;

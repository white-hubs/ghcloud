import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./data-overview-panel.module.less";

export const DataOverviewPanel = defineComponent({
  name: "DataOverviewPanel",
  props: {
    overviewData: { type: Array, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    interface data {
      imgPath: string;
      value: number;
      name: string;
      unit: string;
    }
    interface Props {
      overviewData: data[];
    }
    const handelClick = (item) => {
      emit("handelClickItemize", item);
    };

    return (): JSX.Element => (
      <>
        <div class="dataPanel-wrap">
          {overviewData.map((item) => (
            <div>
              <div class="dataPanel">
                <div class="dataPanel-left">
                  {" "}
                  <div class="bg">
                    {" "}
                    <img src={getAssetsImage(item.imgPath)} alt />
                  </div>
                </div>
                <div class="dataPanel-right">
                  <div class="monitorPanel-data">
                    <div class="monitorPanel-name"> {item.name}</div>
                    <div class="monitorPanel-num">
                      <CountTo class="count" onClick={handelClick} startVal={0} endVal={item.value} duration={2000} separator />
                      <span class="unit"> {item.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default DataOverviewPanel;

import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./noData.module.less";

export const NoData = defineComponent({
  name: "NoData",
  setup() {
    return (): JSX.Element => (
      <div class="ue5-no-data">
        <div class="ue5-no-data-inner">
          <img src={getAssetsImage("noData.png")} alt="暂无数据" />
          <div class="ue5-no-data-text">暂无数据</div>
        </div>
      </div>
    );
  },
});

export default NoData;

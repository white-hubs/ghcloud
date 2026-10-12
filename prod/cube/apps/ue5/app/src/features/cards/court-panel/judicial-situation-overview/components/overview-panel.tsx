import { defineComponent } from "vue";
import { ref } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./overview-panel.module.less";

export const OverviewPanel = defineComponent({
  name: "OverviewPanel",
  props: {
    overPanelData: { type: Object, required: true },
  },
  setup(props, ctx) {
    const chainRatio = ref(0);
    interface data {
      panelData1: string | number;
      panelRatio1: number;
      panelName1: string;
      rightNum1?: number;

      panelData2: string | number;
      panelRatio2: number;
      panelName2: string;
      rightNum2?: number;

      panelData3: string | number;
      panelRatio3: number;
      panelName3: string;
      rightNum3?: number;

      panelData4: string | number;
      panelRatio4: number;
      panelName4: string;
      rightNum4?: number;
    }
    interface Props {
      overPanelData: data;
    }
    return (): JSX.Element => (
      <>
        <div class="overViewList">
          <div class="overViewBox">
            <div class="overViewBox-left">
              <div class="overViewBox-name"> {overPanelData.panelName1}</div>
              <div class="overViewBox-line"></div>
              <div class="overViewBox-data">
                <span> {overPanelData.panelData1}</span>
                <div class="ringRatio">
                  {" "}
                  <div class={[overPanelData.panelRatio1 > 0 ? "up" : "down"]}> {overPanelData.panelRatio1 + "%"}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style="transform: rotateY(180deg);">
            <div class="overViewNest" style="transform: rotateY(180deg);">
              <div class="overViewBox-right right">
                <div class="overViewBox-name">
                  {overPanelData.panelName2}
                  {overPanelData.rightNum2 && <CountTo startVal={0} endVal={overPanelData.rightNum2} duration={2000} separator />}
                </div>
                <div class="overViewBox-line"></div>
                <div class="overViewBox-data">
                  <span> {overPanelData.panelData2}</span>
                  <div class="ringRatio">
                    <div class={[overPanelData.panelRatio2 > 0 ? "up" : "down"]}>{overPanelData.panelRatio2 + "%"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style="transform: rotateX(180deg)">
            <div class="overViewNest" style="transform: rotateX(180deg)">
              <div class="overViewBox-left">
                <div class="overViewBox-name">
                  {overPanelData.panelName3}
                  {overPanelData.rightNum3 && <CountTo startVal={0} endVal={overPanelData.rightNum3} duration={2000} separator />}
                </div>
                <div class="overViewBox-line"></div>
                <div class="overViewBox-data">
                  <span> {overPanelData.panelData3}</span>
                  <div class="ringRatio">
                    {" "}
                    <div class={[overPanelData.panelRatio3 > 0 ? "up" : "down"]}> {overPanelData.panelRatio3 + "%"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style="transform:rotate(180deg);">
            <div class="overViewNest" style="transform:rotate(180deg);">
              <div class="overViewBox-right right">
                <div class="overViewBox-name">
                  {overPanelData.panelName4}
                  {overPanelData.rightNum4 && <CountTo startVal={0} endVal={overPanelData.rightNum4} duration={2000} separator />}
                </div>
                <div class="overViewBox-line"></div>
                <div class="overViewBox-data">
                  <span> {overPanelData.panelData4}</span>
                  <div class="ringRatio">
                    <div class={[overPanelData.panelRatio4 > 0 ? "up" : "down"]}>{overPanelData.panelRatio4 + "%"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="contentPie"></div>
          <div class="contentPie1">
            <div class="contentPie-value"> 2560</div>
            <div class="contentPie-rate"> 同比-6.8%</div>
            <div class="contentPie-title"> 受理数</div>
          </div>
        </div>
      </>
    );
  },
});

export default OverviewPanel;

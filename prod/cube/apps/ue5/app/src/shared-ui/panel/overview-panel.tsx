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
      panelImg1: string;
      panelRatio1: number;
      panelName1: string;
      rightNum1?: number;

      panelData2: string | number;
      panelImg2: string;
      panelRatio2: number;
      panelName2: string;
      rightNum2?: number;

      panelData3: string | number;
      panelImg3: string;
      panelRatio3: number;
      panelName3: string;
      rightNum3?: number;

      panelData4: string | number;
      panelImg4: string;
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
              <div class="overViewBox-data">
                {typeof overPanelData.panelData1 == "number" && (
                  <CountTo startVal={0} endVal={overPanelData.panelData1} duration={2000} separator />
                )}
                <span> {overPanelData.panelData1}</span>
              </div>
              {overPanelData.panelRatio1 && (
                <div class="ringRatio">
                  <span> 环比</span>
                  <div class={["downtriangle", overPanelData.panelRatio1 > 0 && "uptriangle"]}></div>
                  <div class={[overPanelData.panelRatio1 > 0 ? "up" : "down"]}> {overPanelData.panelRatio1 + "%"}</div>
                </div>
              )}
              <div class="overViewBox-line"></div>
              <div class="overViewBox-name">
                {overPanelData.panelName1}
                {overPanelData.rightNum1 && <CountTo startVal={0} endVal={overPanelData.rightNum1} duration={2000} separator />}
              </div>
            </div>
            <div class="overViewBox-right">
              {" "}
              <img src={getAssetsImage(overPanelData.panelImg1)} alt></img>
            </div>
          </div>
          <div class="overViewBox" style="transform: rotateY(180deg);">
            <div class="overViewNest" style="transform: rotateY(180deg);">
              <div class="overViewBox-left">
                {" "}
                <img src={getAssetsImage(overPanelData.panelImg2)} alt></img>
              </div>
              <div class="overViewBox-right">
                <div class="overViewBox-data">
                  {typeof overPanelData.panelData2 == "number" && (
                    <CountTo startVal={0} endVal={overPanelData.panelData2} duration={2000} separator />
                  )}
                  <span> {overPanelData.panelData2}</span>
                </div>
                {overPanelData.panelRatio2 && (
                  <div class="ringRatio">
                    <span> 环比</span>
                    <div class={["downtriangle", overPanelData.panelRatio2 > 0 && "uptriangle"]}></div>
                    <div class={[overPanelData.panelRatio2 > 0 ? "up" : "down"]}> {overPanelData.panelRatio2 + "%"}</div>
                  </div>
                )}
                <div class="overViewBox-line"></div>
                <div class="overViewBox-name">
                  {overPanelData.panelName2}
                  {overPanelData.rightNum2 && <CountTo startVal={0} endVal={overPanelData.rightNum2} duration={2000} separator />}
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style="transform: rotateX(180deg)">
            <div class="overViewNest" style="transform: rotateX(180deg)">
              <div class="overViewBox-left">
                <div class="overViewBox-data">
                  {typeof overPanelData.panelData3 == "number" && (
                    <CountTo startVal={0} endVal={overPanelData.panelData3} duration={2000} separator />
                  )}
                  <span> {overPanelData.panelData3}</span>
                </div>
                {overPanelData.panelRatio3 && (
                  <div class="ringRatio">
                    <span> 环比</span>
                    <div class={["downtriangle", overPanelData.panelRatio3 > 0 && "uptriangle"]}></div>
                    <div class={[overPanelData.panelRatio3 > 0 ? "up" : "down"]}> {overPanelData.panelRatio3 + "%"}</div>
                  </div>
                )}
                <div class="overViewBox-line"></div>
                <div class="overViewBox-name">
                  {overPanelData.panelName3}
                  {overPanelData.rightNum3 && <CountTo startVal={0} endVal={overPanelData.rightNum3} duration={2000} separator />}
                </div>
              </div>
              <div class="overViewBox-right" style="align-self:flex-end">
                {" "}
                <img src={getAssetsImage(overPanelData.panelImg3)} alt></img>
              </div>
            </div>
          </div>
          <div class="overViewBox" style="transform:rotate(180deg);">
            <div class="overViewNest" style="transform:rotate(180deg);">
              <div class="overViewBox-left" style="align-self:flex-end">
                {" "}
                <img src={getAssetsImage(overPanelData.panelImg4)} alt></img>
              </div>
              <div class="overViewBox-right">
                <div class="overViewBox-data">
                  {typeof overPanelData.panelData4 == "number" && (
                    <CountTo startVal={0} endVal={overPanelData.panelData4} duration={2000} separator />
                  )}
                  <span> {overPanelData.panelData4}</span>
                </div>
                {overPanelData.panelRatio4 && (
                  <div class="ringRatio">
                    <span> 环比</span>
                    <div class={["downtriangle", overPanelData.panelRatio4 > 0 && "uptriangle"]}></div>
                    <div class={[overPanelData.panelRatio4 > 0 ? "up" : "down"]}> {overPanelData.panelRatio4 + "%"}</div>
                  </div>
                )}
                <div class="overViewBox-line"></div>
                <div class="overViewBox-name">
                  {overPanelData.panelName4}
                  {overPanelData.rightNum4 && <CountTo startVal={0} endVal={overPanelData.rightNum4} duration={2000} separator />}
                </div>
              </div>
            </div>
          </div>
          <div class="contentPie"></div>
          <div class="contentPie1"></div>
          <img class="bgImg aniamtion-rotate" src={getAssetsImage("overView23.png")} alt></img>
          <div class="central-circle">
            {" "}
            <slot></slot>
          </div>
        </div>
      </>
    );
  },
});

export default OverviewPanel;

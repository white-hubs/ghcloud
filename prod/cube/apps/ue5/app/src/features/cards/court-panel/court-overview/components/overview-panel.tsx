import { defineComponent, type PropType } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./overview-panel.module.less";

type OverviewPanelData = {
  tittle: string;
  rate: number;
  total: number;
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
};

export const OverviewPanel = defineComponent({
  name: "OverviewPanel",
  props: {
    overPanelData: { type: Object as PropType<OverviewPanelData>, required: true },
  },
  setup(props) {
    return (): JSX.Element => {
      const data = props.overPanelData;
      return (
        <div class="overViewList">
          <div class="overViewBox">
            <div class="overViewBox-left">
              <div class="overViewBox-name">{data.panelName1}</div>
              <div class="overViewBox-line"></div>
              <div class="overViewBox-data">
                <span>{data.panelData1}</span>
                <div class="ringRatio">
                  <div class={data.panelRatio1 > 0 ? "up" : "down"}>{data.panelRatio1}%</div>
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style={{ transform: "rotateY(180deg)" }}>
            <div class="overViewNest" style={{ transform: "rotateY(180deg)" }}>
              <div class="overViewBox-right right">
                <div class="overViewBox-name">
                  {data.panelName2}
                  {data.rightNum2 ? <CountTo startVal={0} endVal={data.rightNum2} duration={2000} separator="" /> : null}
                </div>
                <div class="overViewBox-line"></div>
                <div class="overViewBox-data">
                  <span>{data.panelData2}</span>
                  <div class="ringRatio">
                    <div class={data.panelRatio2 > 0 ? "up" : "down"}>{data.panelRatio2}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style={{ transform: "rotateX(180deg)" }}>
            <div class="overViewNest" style={{ transform: "rotateX(180deg)" }}>
              <div class="overViewBox-left">
                <div class="overViewBox-name">
                  {data.panelName3}
                  {data.rightNum3 ? <CountTo startVal={0} endVal={data.rightNum3} duration={2000} separator="" /> : null}
                </div>
                <div class="overViewBox-line"></div>
                <div class="overViewBox-data">
                  <span>{data.panelData3}</span>
                  <div class="ringRatio">
                    <div class={data.panelRatio3 > 0 ? "up" : "down"}>{data.panelRatio3}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="overViewBox" style={{ transform: "rotate(180deg)" }}>
            <div class="overViewNest" style={{ transform: "rotate(180deg)" }}>
              <div class="overViewBox-right right">
                <div class="overViewBox-name">
                  {data.panelName4}
                  {data.rightNum4 ? <CountTo startVal={0} endVal={data.rightNum4} duration={2000} separator="" /> : null}
                </div>
                <div class="overViewBox-line"></div>
                <div class="overViewBox-data">
                  <span>{data.panelData4}</span>
                  <div class="ringRatio">
                    <div class={data.panelRatio4 > 0 ? "up" : "down"}>{data.panelRatio4}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="contentPie"></div>
          <div class="contentPie1">
            <div class="contentPie-value">{data.total}</div>
            <div class="contentPie-rate">
              同比
              <span class={data.rate > 0 ? "up" : "down"}>{data.rate}%</span>
            </div>
            <div class="contentPie-title">{data.tittle}</div>
          </div>
        </div>
      );
    };
  },
});

export default OverviewPanel;

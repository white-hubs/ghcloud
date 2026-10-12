import { CaretRightOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./call-statistics-panel.module.less";

export const CallStatisticsPanel = defineComponent({
  name: "CallStatisticsPanel",
  setup(_props, ctx) {
    /**
     * 呼叫统计
     */
    const callStatisticsData = reactive({
      totalNum: 34563,
      list: [
        { time: "今日", value: 33, rate: 6.8 },
        { time: "本月", value: 1234, rate: -6.8 },
        { time: "本年", value: 34563, rate: 6.8 },
      ],
    });

    let timer = null;
    const fakeData = [
      {
        total: 34563,
        list: [
          { time: "今日", value: 33, rate: 6.8 },
          { time: "本月", value: 1234, rate: -6.8 },
          { time: "本年", value: 34563, rate: 6.8 },
        ],
      },
      {
        total: 34587,
        list: [
          { time: "今日", value: 50, rate: 6.8 },
          { time: "本月", value: 1251, rate: -6.8 },
          { time: "本年", value: 34587, rate: 6.8 },
        ],
      },
      {
        total: 34597,
        list: [
          { time: "今日", value: 83, rate: 6.8 },
          { time: "本月", value: 1267, rate: -6.8 },
          { time: "本年", value: 34597, rate: 6.8 },
        ],
      },
    ];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(
        () => {
          callStatisticsData.totalNum = fakeData[fakeIndex].total;
          callStatisticsData.list = fakeData[fakeIndex].list;
          fakeIndex++;
          if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0;
          }
        },
        (window as any).config.pageLoopRequestTime,
      );
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="呼叫统计" class="call-statistics">
          <div class="total-num">
            <img src={getAssetsImage("circel1.png")} class="img1 rotate" />
            <img src={getAssetsImage("circel-halo1.png")} class="img2 rotate reverse" />
            <a-progress
              stroke-color={{ "0%": "#2970FF", "100%": "#c3dffc" }}
              percent={30}
              type="circle"
              strokeLinecap="square"
              trailColor="rgba(255, 255, 255, 0.1)"
            />
            <img src={getAssetsImage("bubble.png")} class="img3 rotate" />
            <div class="value">
              <CountTo startVal={0} endVal={callStatisticsData.totalNum} duration={2000} separator />
              <span> 呼叫总数</span>
            </div>
          </div>
          <div class="list">
            {callStatisticsData.list.map((item) => (
              <div class="item">
                <div class="time"> {item.time}</div>
                <div class="datas">
                  <div class="value">
                    {" "}
                    <CountTo startVal={0} endVal={item.value} duration={2000} separator />
                  </div>
                  <span class="rate" style={{ color: item.rate > 0 ? "#F14545" : "#2AE8BD" }}>
                    <span class="text"> 环比</span>
                    <CaretRightOutlined
                      style={{ fontSize: "12px", color: item.rate > 0 ? "#FFCECE" : "#D2FFF3" }}
                      rotate={item.rate > 0 ? -90 : 90}
                    />
                    <count-to startVal={0} endVal={item.rate} duration={2000} separator decimals="2"></count-to>%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default CallStatisticsPanel;

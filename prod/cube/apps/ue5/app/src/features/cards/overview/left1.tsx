import { CaretUpOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getstatus, alarmStatistics, statisticsAreaTop } from "@/infrastructure/api/alarm";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import planPie from "@/shared-ui/panel/charts/pie/planePie";
import RatePie from "@/shared-ui/panel/charts/ratePie/ratePie";
import pieList from "@/shared-ui/panel/overviewlist";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left1.module.less";

export const Left1 = defineComponent({
  name: "Left1",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    onMounted(() => {
      getorder();
      getOrderStatistic();
    });
    /**
     * 2023-04-26临时添加为演示可以看到数据
     */
    const statisticData = reactive({
      alarmNum: 0,
      alarmStatusStatistics: [],
      chainRatio: 0,
    });
    const alarmProportion = ref({
      handle: 0,
      really: 0,
    });
    const controlledDataList = reactive({
      arr: [],
    });
    const periodTime = moment().startOf("years").format("YYYY-MM-DD HH:mm:ss") + "," + moment().format("YYYY-MM-DD HH:mm:ss");
    const getOrderStatistic = () => {
      getstatus({
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: periodTime,
        type: "THIS_YEAR",
      }).then((res) => {
        Object.assign(statisticData, res);
        getUserStatistic();
      });
    };
    const getorder = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: periodTime,
      };
      let res: any = await alarmStatistics(params);
      if (res.alarmNum && res.alarmNum !== 0) {
        alarmProportion.value.really = Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
        alarmProportion.value.handle = Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
      } else {
        alarmProportion.value.really = 0;
        alarmProportion.value.handle = 0;
      }
    };
    const getimg = (url) => {
      return new URL(`../../../assets/images/overview/${url}.png`, import.meta.url).href;
    };
    const getUserStatistic = () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: periodTime,
        type: "THIS_YEAR",
      };
      statisticsAreaTop(params).then((res) => {
        let color = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
        controlledDataList.arr = res.map((item, index) => {
          return {
            label: item.name,
            value: item.alarmNum,
            color: color[index],
            ratio: item.ratio,
          };
        });

        let allratio = res.reduce((a: any, b: any) => {
          return parseFloat(a) + parseFloat(b.ratio);
        }, 0);
        let allvalue = res.reduce((a: any, b: any) => {
          return parseFloat(a) + parseFloat(b.alarmNum);
        }, 0);

        controlledDataList.arr.push({
          label: "其他",
          value: statisticData.alarmNum - allvalue,
          color: "#655DD1",
          ratio: 100 - allratio,
        });
      });
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警统计">
            <div class="statistic-num">
              <div class="title"> 报警数</div>
              <div class="num">
                {statisticData.alarmNum}
                <span class="monthon">
                  环比
                  <CaretUpOutlined />
                  <span style="color:#2AE8BD">{statisticData.chainRatio}%</span>
                </span>
              </div>
            </div>
            <div class="statistic_list">
              {statisticData.alarmStatusStatistics.map((item) => (
                <div class="statistic_list_con">
                  <div>
                    {" "}
                    <img src={getimg(item.alarmStatus)} />
                  </div>
                  <div class="statistic_list_con_num">
                    <div class="alarmNum"> {item.alarmNum}</div>
                    <div class="alarmStatusName"> {item.alarmStatusName}</div>
                  </div>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理统计">
            <div class="rate-pie-chart">
              <RatePie value={alarmProportion.handle} title="报警处理占比" color="#5AD0EA" class="rate-pie" />
              <RatePie value={alarmProportion.really} title="报警真实占比" class="rate-pie" />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警区域统计">
            <div class="equipmentAlarm">
              <planPie pieData={controlledDataList.arr}>
                {" "}
                <div class="content">
                  {" "}
                  <img src={getAssetsImage("timeControl.png")} />
                </div>
              </planPie>
              <pieList roundPieData={controlledDataList.arr}></pieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left1;

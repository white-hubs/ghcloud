import moment from "moment";
import { defineComponent } from "vue";
import { computed, onMounted, reactive, ref } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, getstatus, recordStatus, statisticsEventTop } from "@/infrastructure/api/alarm";
import { hex2Rgba } from "@/infrastructure/utils/common";
import enumerateData from "@/infrastructure/utils/enumeratie";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import planPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/overviewlist";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right2.module.less";

export const Right2 = defineComponent({
  name: "Right2",
  setup(_props, ctx) {
    const { alarmLeaveOptions } = enumerateData();
    const controlledDataList = reactive({
      arr: [],
      list: [],
    });
    const { globalState } = useStateStore();
    onMounted(() => {
      getRevenueStatistic();
      getScoreList();
    });
    const periodTime = moment().startOf("years").format("YYYY-MM-DD HH:mm:ss") + "," + moment().format("YYYY-MM-DD HH:mm:ss");

    const getRevenueStatistic = async () => {
      let data = await getstatus({
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: periodTime,
        type: "THIS_YEAR",
      });
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: periodTime,
        type: "THIS_YEAR",
      };
      statisticsEventTop(params).then((res) => {
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
          value: data.alarmNum - allvalue,
          color: "#655DD1",
          ratio: 100 - allratio,
        });
      });
    };
    const alarmStyle = (item) => {
      const data = alarmLeaveOptions.value.find((element) => {
        if (item === element.value) {
          return element;
        }
      });

      return `color:${data.color};background:${hex2Rgba(data.color, 0.2)}`;
    };
    const columns = ref<any>([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        slots: {
          customRender: "alarmTime",
        },
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
        slots: {
          customRender: "alarmLevelName",
        },
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
    ]);
    const tabledata = ref([]);
    const getScoreList = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: periodTime,
        type: "THIS_YEAR",
        pageSize: 50,
        pageNumber: 1,
      };
      let res = await recordStatus(params);

      let unprocessed = {
        label: "未处理",
        value: res.alarmUnresolvedHandlerNum,
        color: "#FFAB10",
      };
      let timeout = {
        label: "超时未处理",
        value: res.alarmUnresolvedHandlerNum,
        color: "#00F27B",
      };

      controlledDataList.list = [unprocessed, timeout];
      let data = alarmStatisticsList(params);

      tabledata.value = (await data).records.map((item) => {
        item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
        return item;
      });
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警事件统计">
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
          <SubPanelTemplate title="实时报警">
            <div class="equipmentAlarmList">
              <planPie pieData={controlledDataList.list}>
                {" "}
                <div class="content">
                  {" "}
                  <img src={getAssetsImage("timeControl.png")} />
                </div>
              </planPie>
              <pieList roundPieData={controlledDataList.list}></pieList>
            </div>
            <div>
              <RollTable column={columns.value} data={tabledata.value}>
                <template>
                  {" "}
                  <span> {moment(record.alarmTime).format("YYYY-MM-DD HH:mm:ss")}</span>
                </template>
                <template>
                  <span style={alarmStyle(record.alarmLevelCode)}>
                    {record.alarmLevelName}
                    {}
                  </span>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right2;

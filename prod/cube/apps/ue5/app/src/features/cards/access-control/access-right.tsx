import moment from "moment";
import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationEvent } from "@/infrastructure/api/door";
import { abnormalPassage, accessType, trafficAnalysis } from "@/infrastructure/utils/requestData/accessControl";
import planPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import pieList from "@/shared-ui/panel/pieList";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./access-right.module.less";

export const AccessRight = defineComponent({
  name: "AccessRight",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    let through = ref();
    let throughType = ref();
    const throughNum = ref(0);
    const ecahrtsData = reactive({
      xData: [],
      yData: [],
    });
    let timer = ref<any>(null);
    let numberPasses = ref(0);
    const roundPieData = reactive({
      arr: [],
    });

    const columns = ref([
      {
        title: "时间",
        dataIndex: "eventTime",
        width: 120,
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
      },
      {
        title: "通行方式",
        dataIndex: "eventWay",
      },
    ]);
    const data = ref<any>([]);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );

    // 人流通行趋势
    const abnormalPassageInfo = async () => {
      let res = await abnormalPassage(through.value.timeType, "DO_PASS");
      ecahrtsData.xData = res.xdata;
      ecahrtsData.yData = res.series[0].value;
      numberPasses.value = 0;
      res.series[0].value.forEach((item) => {
        numberPasses.value += item;
      });
    };
    // 通行类型占比
    const accessTypeInfo = async () => {
      roundPieData.arr = await accessType(throughType.value.timeType);
    };
    // 通行分析
    const trafficAnalysisInfo = async () => {
      let res = await trafficAnalysis(throughType.value.timeType);
      throughNum.value = res.total;
      roundPieData.arr = res.arr;
    };
    // 实时通行数据
    const realTimeTrafficData = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageNumber: 1,
        pageSize: 50,
      };
      let res = await visualizationEvent(param);
      res.records.forEach((item) => {
        item.eventTime = moment(item.eventTime).format("YYYY-MM-DD HH:mm:ss");
      });
      data.value = res.records.filter((item) => {
        if (moment(item.eventTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
          return item;
        }
      });
    };
    const init = () => {
      // accessTypeInfo()
      realTimeTrafficData();
      trafficAnalysisInfo();
      abnormalPassageInfo();
    };
    onMounted(() => {
      init();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="人流通行趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={through.value}
                onUpdate:modelValue={(v) => {
                  through.value = v;
                }}
                onSearch={abnormalPassageInfo}
              ></DateInlineForm>
            </template>
            <OperateDays value={numberPasses.value} title="通行总次数"></OperateDays>
            <div class="chart">
              <LineChart
                x-data={ecahrtsData.xData}
                series={[
                  {
                    data: ecahrtsData.yData,
                    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="通行分析" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={throughType.value}
                onUpdate:modelValue={(v) => {
                  throughType.value = v;
                }}
                onSearch={trafficAnalysisInfo}
              ></DateInlineForm>
            </template>
            <div class="equipmentAlarm">
              <planPie pie-data={roundPieData.arr}>
                <div class="content">
                  <div class="pie-center"> {throughNum.value}</div>
                  <div> 通行总数</div>
                </div>
              </planPie>
              <pieList roundPieData={roundPieData.arr}></pieList>
            </div>
            <div class="equipmentAlarm">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="实时通行数据" class="alarm-event">
            {" "}
            <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default AccessRight;

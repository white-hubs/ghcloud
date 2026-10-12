import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";
import { CountTo } from "vue3-count-to";

import modalBroadcastTable from "./component/modal-broadcast-table";
import SituationAnalysis from "./situation-analysis";
import modalEquipmentTable from "@/features/equipment/modal-table/modal-equipment-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { arrangeTodayStat, getRiskSource } from "@/infrastructure/api/attendance";
import { getMonitorSituation } from "@/infrastructure/api/device";
import { getFlowNumberStatistic } from "@/infrastructure/api/flow";
import { getStateTotal } from "@/infrastructure/api/personnel";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import Radar from "@/shared-ui/panel/charts/radar/radar";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import noData from "@/shared-ui/panel/noData";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    interface Itemize {
      color: string;
      value: number;
      label: string;
      ratio: number;
      name: string;
      // applicationCode: string;
    }
    const handleTime = ref<ModelValueItf>();
    const deviceSituationPieData = ref<Itemize[]>([]);
    const deviceSituationAnalysis = reactive({
      title: "设备总数",
      total: 0,
      itemize: [
        {
          label: "在线",
          value: 0,
          color: "#35D93D",
          key: "NORMAL",
        },
        {
          label: "离线",
          value: 0,
          color: "#D0DEEE",
          key: "OFFLINE",
        },
        {
          label: "故障",
          value: 0,
          color: "#FFC700",
          key: "TROUBLE",
        },
        {
          label: "报警",
          value: 0,
          color: "#F14545",
          key: "ALARM",
        },
      ],
    });
    const handelClickDeviceItemize = (value) => {
      Parameter.value.typeId = value.typeId;
      ModalShow.value = true;
    };
    const workOrderTime = ref<ModelValueItf>();
    const monitorSituationAnalysis = reactive({
      title: "设备总数",
      total: 0,
      itemize: [
        {
          label: "在线",
          value: 0,
          color: "#35D93D",
          key: "NORMAL",
        },
        {
          label: "离线",
          value: 0,
          color: "#D0DEEE",
          key: "OFFLINE",
        },
        {
          label: "故障",
          value: 0,
          color: "#FFC700",
          key: "TROUBLE",
        },
        {
          label: "报警",
          value: 0,
          color: "#F14545",
          key: "ALARM",
        },
      ],
    });
    const monitorSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
    const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
    const personStatistic = reactive({
      total: 0,
      onDutyNum: 0,
      leaveNum: 0,
    });
    const workOrderStatustic = reactive({
      total: 38,
      maxData: [12, 12, 12, 12, 12],
      workerData: [6, 4, 7, 12, 9],
      workerTitles: ["考勤管理", "行政管理", "人事管理", "资产管理", "工作汇报"],
    });
    const deviceModalShow = ref(false);
    const ModalShow = ref(false);
    const deviceParameter = ref<Record<string, any>>({
      applicationCode: "SECURITY_MONITORING",
    });
    const Parameter = ref({
      typeId: "",
    });
    const closeModal = () => {
      deviceModalShow.value = false;
    };
    const requestMonitorSituation = async () => {
      const res = await getMonitorSituation();
      monitorSituationAnalysis.total = res.deviceNum;
      monitorSituationAnalysis.itemize.map((item) => {
        let ele = res.deviceStatusNums.find((element) => element.name === item.key);
        item.value = ele.num;
      });
      monitorSituationPieData.value = res.deviceAreaNum.map((item, index) => {
        let areaName = item.areaName.split("/");
        if (areaName.length === 3) {
          areaName = areaName[1] + "/" + areaName[2];
        } else {
          areaName = item.areaName;
        }
        return {
          label: `${areaName}(${Math.round(item.proportion * 10000) / 100}%)`,
          value: item.num,
          color: monitorSituationColors.value[index % 4],
          areaId: item.areaId,
        };
      });
    };
    const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);

    const riskData = reactive<{
      totalNum: number;
    }>({
      totalNum: 0,
    });
    const getRisk = async () => {
      const res = await getRiskSource({
        period: workOrderTime.value.dateRange.join(","),
        dimension: "",
        eventResult: "",
        typeNames: [],
      });
      deviceSituationPieData.value = res.typeVOList.map((item, index) => {});
      Object.assign(riskData, res);
    };
    const requestStateTotal = async () => {
      const res = await arrangeTodayStat();
      personStatistic.onDutyNum = 0;
      personStatistic.leaveNum = 0;
      personStatistic.total = 0;
      personStatistic.onDutyNum = res.workCount;
      personStatistic.leaveNum = res.totalCount - res.workCount;
      personStatistic.total = res.totalCount;
    };
    const handleClickItemize = (item: any) => {
      deviceParameter.value = {
        areaId: item.areaId,
        applicationCode: "SECURITY_MONITORING",
      };
      deviceModalShow.value = true;
    };
    const requestFlowNumberStatistic = async () => {
      const res = await getFlowNumberStatistic({
        period: workOrderTime.value.dateRange.join(","),
      });
      workOrderStatustic.total = res.map((item) => item.count).reduce((m, n) => m + n);
      workOrderStatustic.workerData = res.map((item) => item.count);
      workOrderStatustic.workerTitles = res.map((item) => item.applicationId.applicationName);
      const maxValue = Math.max(...res.map((item) => item.count));
      workOrderStatustic.maxData = Array.from({ length: workOrderStatustic.workerData.length }, () => maxValue);
    };
    const showDeviceTable = (item: any) => {
      deviceParameter.value = {
        status: item.key,
        applicationCode: "SECURITY_MONITORING",
      };
      deviceModalShow.value = true;
    };
    const changeHandleworkOrderTime = () => {
      getRisk();
    };
    onMounted(() => {
      requestMonitorSituation();
      requestStateTotal();
    });

    return (): JSX.Element => (
      <>
        <div class="panel">
          <SubPanelTemplate title="监控态势">
            <div class="monitor-statistic">
              <SituationAnalysis
                imgPath="overView5.png"
                statistic={monitorSituationAnalysis}
                onClickNum={showDeviceTable}
              ></SituationAnalysis>
              <div class="flex-between">
                <PlanPie pieData={monitorSituationPieData.value}>
                  <div class="content">
                    <div class="total-num"> {monitorSituationAnalysis.total}</div>
                    <div> 设备总数</div>
                  </div>
                </PlanPie>
                <PieList roundPieData={monitorSituationPieData.value} onHandelClickItemize={handleClickItemize}></PieList>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="监控人员统计">
            <div class="person-statistic">
              <div class="total">
                <span> 人员总数</span>
                <count-to startVal={0} endVal={personStatistic.total} duration={4000} class="scroll-number"></count-to>
              </div>
              <div class="view-statistic flex-center">
                <div class="bg">
                  <img src={getAssetsImage("overView4.png")} />
                  <img class="rotate" src={getAssetsImage("overView13.png")} alt />
                </div>
                <div class="view-content view-left flex-center">
                  <div class="icon">
                    {" "}
                    <img src={getAssetsImage("overView9.png")} alt />
                  </div>
                  <div class="content">
                    <count-to startVal={0} endVal={personStatistic.onDutyNum} duration={4000} class="scroll-number"></count-to>
                    <div class="title"> 在岗人员</div>
                  </div>
                </div>
                <div class="view-content view-right flex-center">
                  <div class="content">
                    <count-to startVal={0} endVal={personStatistic.leaveNum} duration={4000} class="scroll-number"></count-to>
                    <div class="title"> 离岗人员</div>
                  </div>
                  <div class="icon">
                    {" "}
                    <img src={getAssetsImage("overView11.png")} alt />
                  </div>
                </div>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="管理态势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                onSearch={changeHandleworkOrderTime}
              ></DateInlineForm>
            </template>
            <div class="risk">
              {deviceSituationPieData.map((item) => (
                <div>
                  <div>
                    <div>
                      {item.name}
                      (个)
                    </div>
                    <div style="font-size:18px"> {item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div class="flex-between">
              <PlanPie pieData={deviceSituationPieData.value} class="device-total-pie" pie-class="device-total-pie-chart">
                <div class="content">
                  <div class="total-num"> {riskData.totalNum}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList
                roundPieData={deviceSituationPieData.value}
                onHandelClickItemize={handelClickDeviceItemize}
                class="device-total-list"
              ></PieList>
            </div>
          </SubPanelTemplate>
          <modal-equipment-table
            show-modal={deviceModalShow.value}
            parameter={deviceParameter}
            onClose={closeModal}
          ></modal-equipment-table>
          <modal-broadcast-table
            show-modal={ModalShow.value}
            parameter={Parameter.value}
            onClose={() => {
              ModalShow.value = false;
            }}
          ></modal-broadcast-table>
        </div>
      </>
    );
  },
});

export default Right;

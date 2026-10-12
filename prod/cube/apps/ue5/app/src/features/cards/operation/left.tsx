import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted, onUnmounted } from "vue";

import monitorPanel from "../hospital/monitor-panel";
import LightingRound from "../intelligent-lighting/components/lighting-round";
import DeviceStatistics from "../triage-queue/components/device-statistics";
import PublicOfflineRateEquipment from "@/features/cards/security-overview/cards/public-offline-rate-equipment";
import modalEquipmentTable from "@/features/equipment/modal-table/modal-equipment-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { deviceStatusNum } from "@/infrastructure/api/securitymanagement";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const deviceParameter = ref<Record<string, any>>({
      status: "",
    });
    const { globalState } = useStateStore();
    const deviceModalShow = ref<boolean>(false);
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2AE8BD", "#2989FF", "#FFC700", "#EF424A"];
    const deviceStatisticsData = reactive({
      title: "设备数",
      total: 0,
      itemize: [
        {
          name: "离线率",
          label: "离线",
          value: 0,
          key: "OFFLINE",
        },
      ],
    });
    const monitorPanelData = ref([
      {
        imgPath: "overView5.png",
        value: 0,
        name: "系统总量",
      },
      {
        imgPath: "overView29.png",
        value: 0,
        name: "设备总量",
      },
    ]);
    const faultData = ref([
      {
        color: "#2989FF",
        name: "设备数",
        value: 0,
      },
      {
        color: "#FFC700",
        name: "故障数",
        value: 0,
      },
    ]);
    const pieData = ref([
      {
        name: "正常",
        value: 0,
        color: "#2AE8BD",
      },
      {
        name: "离线",
        value: 0,
        color: "#2989FF",
      },
      {
        name: "故障",
        value: 0,
        color: "#FFC700",
      },
      {
        name: "告警",
        value: 0,
        color: "#F14545",
      },
    ]);
    const roundData = reactive([
      {
        statistic: { title: "故障率", total: " 0%" },
      },
    ]);
    const product = reactive({
      column: [
        {
          title: "系统名称",
          dataIndex: "applicationName",
        },
        {
          title: "在线",
          dataIndex: "normalNum",
          slots: {
            customRender: "normalNum",
          },
        },
        {
          title: "离线",
          dataIndex: "offLineNum",
          slots: {
            customRender: "offLineNum",
          },
        },
      ],
      tableData: [
        {
          applicationName: "给排水",
          offline: 6,
          onLine: 0,
        },
        {
          applicationName: "送排风",
          offline: 9,
          onLine: 1,
        },
        {
          applicationName: "空调管理",
          offline: 8,
          onLine: 1,
        },
        {
          applicationName: "智能照明",
          offline: 12,
          onLine: 0,
        },
      ],
    });
    let alarmTotal = ref<number>(0);
    const { getEquipmentNumber } = useCommon();
    const handelClickDeviceItemize = (item?: any) => {
      if (item !== 0) {
        deviceModalShow.value = true;
      }
    };
    const closeModal = () => {
      deviceModalShow.value = false;
    };
    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();

      //   if (!res.deviceNum) {
      //     return;
      //   }
      deviceStatisticsData.total = res.deviceNum;
      faultData.value[0].value = res.deviceNum;
      pieData.value.length = 0;
      res.deviceStatusNums.forEach((item, index) => {
        if (item.name === "OFFLINE") {
          deviceStatisticsData.itemize[0].value = item.num;
        } else if (item.name === "TROUBLE") {
          faultData.value[1].value = item.num;
        }
        pieData.value.push({
          name: deviceStatusType[item.name],
          value: item.num,
          color: colorList[index],
        });
      });
      roundData[0].statistic.total = faultData.value[1].value
        ? ((faultData.value[1].value / faultData.value[0].value) * 100).toFixed(2)
        : "0%";
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      monitorPanelData.value[0].value = res.equipmentOverview;
      monitorPanelData.value[1].value = res.deviceNum;
      alarmTotal.value = res.deviceNum;
      product.tableData = await deviceStatusNum(params);
    };
    onMounted(() => {
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备情况总览">
            <div class="monitorPanelBox">
              {monitorPanelData.map((item, index) => (
                <monitorPanel onHandelClickItemize={handelClickDeviceItemize(index)} key={item.name} monitorPanelData={item}></monitorPanel>
              ))}
            </div>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={pieData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {alarmTotal.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 总量</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList contentList={pieData.value} class="analysisList"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线情况" class="product-table">
            <DeviceStatistics
              onHandelClickItemize={handelClickDeviceItemize}
              imgPath="overView21.png"
              statistic={deviceStatisticsData}
            ></DeviceStatistics>
            <RollTable column={product.column} data={product.tableData}>
              <template>
                <div style="display: flex;align-items: center;justify-content: center;">
                  <span class="offlineBox" style="background-color: #35D93D;"></span>
                  <span class="os1"> {record.offLineNum}</span>
                </div>
              </template>
              <template>
                <div style="display: flex;align-items: center;justify-content: center;">
                  <span class="offlineBox"></span>
                  <span class="os1"> {record.normalNum}</span>
                </div>
              </template>
            </RollTable>
          </SubPanelTemplate>
          <PublicOfflineRateEquipment></PublicOfflineRateEquipment>
        </div>
        {deviceModalShow && (
          <modal-equipment-table
            show-modal={deviceModalShow.value}
            onClose={closeModal}
            parameter={deviceParameter}
          ></modal-equipment-table>
        )}
      </>
    );
  },
});

export default Left;

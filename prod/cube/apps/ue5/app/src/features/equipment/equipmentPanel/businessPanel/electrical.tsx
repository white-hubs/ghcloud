import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsStatus } from "@/infrastructure/api/alarm";
import { getDeviceInfo, deviceNewSubscribe } from "@/infrastructure/api/equipment";
import { EquipmentInfoType } from "@/infrastructure/api/models/equipment";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import equipmentInfo from "@/shared-ui/panel/equipmentInfo";
import { storeArea } from "@/visualization-core/stores/area";
import { useSubscribeStore } from "@/visualization-core/stores/socketSubscribe";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./electrical.module.less";

export const Electrical = defineComponent({
  name: "Electrical",
  setup(_props, ctx) {
    const piniaStoreArea = storeArea();
    const { globalState } = useStateStore();

    let timer: any = ref(null);

    const typeList = {
      0: "maintain.png",
      1: "Troubleshooting.png",
      2: "Inspection.png",
      3: "hitch.png",
      4: "equipmentAlarm.png",
    };
    const piniaUseSubscribeStore = useSubscribeStore();

    const roundPieData = ref([]);
    const colorList = ["#FFC700", "#74AEE7", "#29C2FF", "#00F27B"];

    const eventNum = ref<number>(0);
    const attributeData = ref([]);
    const equipmentInfoData = ref<EquipmentInfoType>({
      id: "",
      name: "",
      modelName: "",
      modelId: "",
      areaName: "",
      areaIdList: [],
      areaId: "",
      deviceStatus: "",
      communicationStatus: "",
      images: [],
      genreName: "",
      genreId: "",
      code: "",
      deviceNumber: 0,
      status: "",
      identify: "",
    });
    watch(
      () => piniaUseSubscribeStore.subscribeData,
      (nreValue: any) => {
        let obj = {};
        nreValue.subscribedDevices.forEach((item) => {
          // obj[item.attributeCode]=item.attributeValue
          attributeData.value.forEach((data) => {
            if (item.attributeCode === data.attributeCode) {
              data.value = item.attributeValue;
            }
          });
        });
      },
    );
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
    // 获取设备报警状态
    const getEquipmentStatus = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: "2023-01-01 00:00:00,2023-12-31 23:59:59",
        type: "THIS_YEAR",
        pageSize: 50,
        pageNumber: 1,
      };
      let status = await statisticsStatus(params);
      roundPieData.value = status.alarmStatusStatistics.map((item, index) => {
        return {
          label: item.alarmStatusName,
          color: colorList[index],
          value: item.alarmNum,
        };
      });
      eventNum.value = status.alarmNum;
    };
    const getEquipmentInfo = async () => {
      let res = await getDeviceInfo(piniaStoreArea.equipmentId as any);
      equipmentInfoData.value = res.detail;
      attributeData.value.length = 0;
      let param = {
        subscribeId: "electrical_rightPlate",
        subscribedDevices: res.deviceAttributes.map((item) => {
          attributeData.value.push({
            name: item.attributeName,
            value: "未知",
            attributeCode: item.attributeCode,
          });
          return {
            deviceInstanceId: res.detail.id,
            attributeCode: item.attributeCode,
          };
        }),
      };
      let data = await deviceNewSubscribe(param);
    };
    const init = () => {
      getEquipmentStatus();
      getEquipmentInfo();
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
          <SubPanelTemplate title="设备信息">
            <equipmentInfo equipment-info={equipmentInfoData.value}></equipmentInfo>
            <div class="attributeList">
              {attributeData.map((item) => (
                <div class="attributeBox">
                  <div class="attributeBox-left"> {item.name}</div>
                  <div class="attributeBox-right"> {item.value}</div>
                </div>
              ))}
            </div>
            <OperateDays value={eventNum.value} title="设备事件" unit={"个"} class="fatalism" />
            <div class="equipmentAlarm">
              <RoundPie eventNum={eventNum.value} data={roundPieData.value}>
                <div class="content">
                  <span> {eventNum.value}</span>
                  <br />
                  报警事件
                </div>
              </RoundPie>
              <div class="policeList">
                {roundPieData.map((item) => (
                  <div class="thePolice" key={item.color}>
                    <div>
                      <span style={{ background: item.color }}></span>
                      {item.label}
                    </div>
                    <span> {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Electrical;

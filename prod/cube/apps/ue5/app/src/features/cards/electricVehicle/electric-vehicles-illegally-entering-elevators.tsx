import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DeviceStatistics from "@/features/cards/small-engineering/components/device-statistics";
import Alarm from "@/features/equipment/alarmdetails/equipmentMode";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmRecordsCommonPage, recordStatus } from "@/infrastructure/api/alarm";
import { getVideoFilePaths } from "@/infrastructure/api/linkage";
import { isHttpUrl } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./electric-vehicles-illegally-entering-elevators.module.less";

export const ElectricVehiclesIllegallyEnteringElevators = defineComponent({
  name: "ElectricVehiclesIllegallyEnteringElevators",
  setup(_props, ctx) {
    const alarmTimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const deviceStatisticsData = reactive({
      title: "违规入电梯数",
      total: 0,
      ratio: 0,
    });
    const alarmDetailData = ref({});

    const serveIp = window.location.protocol;
    const show = ref(false);
    const lists = ref([]);
    const getAlarmData = async (id) => {
      return new Promise(async (resolve, reject) => {
        try {
          const alarmData = await getVideoFilePaths(id);
          resolve(alarmData);
        } catch (error) {
          reject();
        }
      });
    };
    const changeDate = async () => {
      const res = await recordStatus({ applicationCode: "ELECTRlC_VEHICLE", alarmEventTypeId: "electricVehucle_wgrt" });
      deviceStatisticsData.total = res.alarmNum;
      deviceStatisticsData.ratio = res.chainRatio;

      const { records } = await alarmRecordsCommonPage({
        period: alarmTimeType.value.dateRange.join(","),
        pageSize: 20,
        pageNumber: 1,
        applicationCode: "ELECTRlC_VEHICLE",
        alarmEventTypeId: "electricVehucle_wgrt",
      });
      for (let i = 0; i < records.length; i++) {
        records[i].alarmTime = dayjs(records[i].alarmTime).format("YYYY-MM-DD HH:mm:ss");
        try {
          const res: any = await getAlarmData(records[i].businessKey);
          const imageList = res.alarmData
            .filter((item) => item.type === "PHOTOGRAPH")
            .map((item) => {
              if (item.intranetFilePath && !isHttpUrl(item.intranetFilePath)) {
                item.intranetFilePath = res.baseUrl + item.intranetFilePath;
              }
              if (item.extranetFilePath && !isHttpUrl(item.extranetFilePath)) {
                item.extranetFilePath = res.baseUrl + item.extranetFilePath;
              }
              item.intranetFilePath = item.intranetFilePath + "?session=" + res.sessionData.session;
              item.extranetFilePath = item.extranetFilePath + "?session=" + res.sessionData.session;
              return item;
            });
          records[i].intranetFilePath = imageList[0].intranetFilePath;
          records[i].extranetFilePath = imageList[0].extranetFilePath;
        } catch (error) {}
      }
      lists.value = records;
    };
    const openAlarm = (item) => {
      alarmDetailData.value = item;
      show.value = true;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="电动车违规入电梯统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmTimeType.value}
              onUpdate:modelValue={(v) => {
                alarmTimeType.value = v;
              }}
              onSearch={changeDate}
            ></DateInlineForm>
          </template>
          <div class="content">
            <DeviceStatistics style="height: 50px;" imgPath="overView121.png" statistic={deviceStatisticsData}></DeviceStatistics>
            <div class="stat-list">
              {lists.map((item) => (
                <div class="list-item" onClick={openAlarm(item)} key={item.id}>
                  {item.intranetFilePath && item.extranetFilePath && (
                    <img src={serveIp === "http" ? item.intranetFilePath : item.extranetFilePath} alt></img>
                  )}
                  <img src={getAssetsImage("alarm-default.png")} alt srcset></img>
                  <div class="item-content">
                    <div class="alarm-name">
                      <div class="name"> {item.alarmEventTypeName}</div>
                      <div class={["alarm-item-left-content-desc", item.alarmLevelCode]} class="alarm-level">
                        {item.alarmLevelName}
                        报警
                      </div>
                    </div>
                    <div class="time"> {item.alarmTime}</div>
                  </div>
                  <div class={["alarm-item-right", item.alarmStatus]}> {item.alarmStatusName}</div>
                </div>
              ))}
            </div>
          </div>
        </SubPanelTemplate>
        {show && (
          <Alarm
            alarmDetailData={alarmDetailData.value}
            onClose={() => {
              show.value = false;
            }}
            isalarm={true}
          ></Alarm>
        )}
      </>
    );
  },
});

export default ElectricVehiclesIllegallyEnteringElevators;

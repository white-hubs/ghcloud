import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyPhone, telephoneTrends } from "@/infrastructure/api/securitymanagement";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { getEquipmentNumber } = useCommon();
    const column = [
      {
        title: "设备编号",
        dataIndex: "deviceCode",
        width: 100,
      },
      {
        title: "设备区域",
        dataIndex: "areaName",
        width: 120,
      },
      {
        title: "紧急电话内容",
        dataIndex: "fileUrl",
        slots: {
          customRender: "fileUrl",
        },
      },
    ];
    const listData = ref<{ label: string; value: number; color?: string }[]>([]);
    const audio = ref();
    const through = ref();
    const faultRate = ref(10);
    const charsData = reactive({
      xData: [],
      yData: [],
    });
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "设备总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "离线总数",
        value: 0,
        ringRatio: true,
        label: 0,
        unit: "%",
      },
    ]);
    const abnormalPassageInfo = async () => {};
    const getEmergencyPhone = async () => {
      const res = await emergencyPhone({ pageSize: 10, pageNumber: 1 });
      listData.value = res.records;
    };
    const getTelephoneTrends = async () => {
      const params = {
        type: through.value.timeType,
        period: through.value.dateRange.join(","),
      };
      const res = await telephoneTrends(params);
      charsData.xData = res.xtitle.map((item) => {
        if (through.value.timeType === "TODAY") {
          return (item += "时");
        } else if (through.value.timeType === "THIS_YEAR") {
          return (item += "月");
        } else {
          return item;
        }
      });
      charsData.yData = res.xtitle.map((xItem) => {
        return res.telephoneUsageTrends.find((item) => item.timeFlag === xItem)
          ? res.telephoneUsageTrends.find((item) => item.timeFlag === xItem).num
          : 0;
      });
    };
    const play = (data) => {
      audio.value = new Audio(data.fileUrl);
      audio.value.play();
    };
    const cease = () => {
      audio.value.pause();
    };
    /**
     * 设备类型分布
     */
    const equipmentStatistic = async () => {
      const res = await getEquipmentNumber();
      faultRate.value = 0;
      if (JSON.stringify(res) === "{}") {
        return;
      }
      res.deviceStatusNums.forEach((item) => {
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
          dataList[0].value = res.deviceNum;
          dataList[1].value = item.num;
          dataList[1].label = faultRate.value;
        }
      });
    };
    onMounted(() => {
      equipmentStatistic();
      getEmergencyPhone();
      getTelephoneTrends();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="最新紧急电话">
            <div class="footer">
              <RollTable column={column} data={listData.value} showLength={5}>
                <template>
                  <div class="operate">
                    <span onClick={play(record)}> 播放</span>
                    <span onClick={cease}> 停止</span>
                  </div>
                </template>
              </RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="电话使用趋势" class="alarm-event">
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
            <div class="chart">
              <LineChart
                x-data={charsData.xData}
                series={[
                  {
                    data: charsData.yData,
                    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFAF2A" color="#FFAF2A"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;

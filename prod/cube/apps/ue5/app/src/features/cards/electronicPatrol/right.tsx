import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import abnormalEvents from "./components/abnormal-events";
import inspectionEquipmentStatus from "./components/inspection-equipment-status";
import modalTable from "@/features/equipment/modal-table/modal";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statusStat, leakStat, alarmPage } from "@/infrastructure/api/maintain";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import RingChart from "@/shared-ui/panel/charts/ring/ring";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const deviceTotal = ref(0);
    const pieData = ref([]);
    const hiddenDangerTime = ref<ModelValueItf>();
    const showAbnormalModal = ref(false);
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: colors[index % colors.length],
      };
    });
    const statisticStyle = computed(() => {
      return {
        fontSize: "16px",
        color: "#FFFFFF",
        paddingLeft: "16px",
      };
    });
    const column = [
      {
        title: "报警地点",
        dataIndex: "alarmPoint",
        width: 120,
      },
      {
        title: "报警时间",
        dataIndex: "alarmTime",
      },
      {
        title: "处理结果",
        dataIndex: "alarmResult",
        width: 140,
      },
    ];
    const listData = ref([]);
    const getDeviceStatus = async () => {
      const res = await statusStat();
      pieData.value.length = 0;
      deviceTotal.value = 0;
      pieData.value = res.map((item, index) => {
        deviceTotal.value += item.num;
        return {
          name: item.name,
          value: item.num,
          color: colors[index],
        };
      });
    };
    const changeHandleHiddenDangerTime = async () => {
      const res = await leakStat({ period: hiddenDangerTime.value.dateRange.join(",") });
      xData.value.length = 0;
      yData.value.length = 0;
      res.forEach((item) => {
        xData.value.push(item.locationName);
        yData.value.push(item.omitNum);
      });
    };
    const getAlarmPage = async () => {
      const { records } = await alarmPage({ pageSize: 10, pageNumber: 1, keyword: "" });
      listData.value = records;
    };
    onMounted(() => {
      getDeviceStatus();
      getAlarmPage();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态统计">
            <OperateDays title="设备总数" value={deviceTotal.value} />
            <div class="chart">
              {" "}
              <RingChart pieData={pieData.value} seriesName="设备类型统计" total={deviceTotal.value}></RingChart>
            </div>
            <div class="statistic">
              {pieData.map((item, index) => (
                <div class="statistic-item">
                  <a-statistic value={item.value} valueStyle={statisticStyle.value}>
                    <template>
                      <div class="title flex-start">
                        <div class="box" style={statisticValueStyle(index)}></div>
                        <span> {item.name}</span>
                      </div>
                    </template>
                    <template>
                      {" "}
                      <span> {item.ratio}</span>
                    </template>
                  </a-statistic>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更点漏巡点位统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={hiddenDangerTime.value}
                onUpdate:modelValue={(v) => {
                  hiddenDangerTime.value = v;
                }}
                onSearch={changeHandleHiddenDangerTime}
              ></DateInlineForm>
            </template>
            <div class="lineChart">
              {" "}
              <barChart title={""} unit={""} x-data={xData.value} data={[{ color: "#1890FF", name: "", data: yData }]} />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更异常事件统计">
            <template>
              {" "}
              <div
                class="details"
                onClick={() => {
                  showAbnormalModal.value = true;
                }}
              >
                {" "}
                查看详情
              </div>
            </template>
            <div class="footer">
              {" "}
              <RollTable column={column} data={listData.value} limitScrollNum={4}></RollTable>
            </div>
          </SubPanelTemplate>
        </div>
        {showAbnormalModal && (
          <modal-table
            show={showAbnormalModal.value}
            title="异常事件列表"
            onClose={() => {
              showAbnormalModal.value = false;
            }}
          >
            {" "}
            <abnormalEvents></abnormalEvents>
          </modal-table>
        )}
      </>
    );
  },
});

export default Right;

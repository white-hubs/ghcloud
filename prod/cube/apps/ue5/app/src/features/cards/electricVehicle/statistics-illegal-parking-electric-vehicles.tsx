import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DeviceStatistics from "@/features/cards/small-engineering/components/device-statistics";
import inspect from "@/features/cards/small-engineering/components/inspect-detail/index";
import inspectRecord from "@/features/cards/small-engineering/components/inspect-record";
import modalTable from "@/features/equipment/modal-table/modal";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { inspectElectronMobileParkingPage, inspectElectronMobileParkingStat } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./statistics-illegal-parking-electric-vehicles.module.less";

export const StatisticsIllegalParkingElectricVehicles = defineComponent({
  name: "StatisticsIllegalParkingElectricVehicles",
  setup(_props, ctx) {
    const deviceStatisticsData = reactive({
      title: "违规查处总数",
      total: 0,
      ratio: 0,
    });
    const inspectParameter = ref({
      id: "",
    });
    const inspectionRecordShow = ref(false);
    const inspectListParameter = ref({
      period: [],
      title: "电动车违规停放记录",
    });
    const alarmModalShow = ref(false);
    const alarmTimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const data = ref<any>([]);
    const columns = ref([
      {
        title: "巡检对象",
        dataIndex: "targetName",
      },
      {
        title: "所属巡检任务",
        dataIndex: "taskName",
      },
      {
        title: "巡查时间",
        dataIndex: "time",
      },
      {
        title: "巡查人",
        dataIndex: "nickname",
      },
    ]);
    const handelClickItemize = () => {
      inspectListParameter.value.period = alarmTimeType.value.dateRange;
      inspectionRecordShow.value = true;
    };
    const close = () => {
      alarmModalShow.value = false;
    };
    const clickRow = (value) => {
      inspectParameter.value.id = value.id;
      alarmModalShow.value = true;
    };
    const changeDate = async (val: ModelValueItf) => {
      const res = await inspectElectronMobileParkingStat({ period: alarmTimeType.value.dateRange.join(",") });
      deviceStatisticsData.total = res.total;
      deviceStatisticsData.ratio = Number(res.chainRatio);
      const park = await inspectElectronMobileParkingPage({
        period: alarmTimeType.value.dateRange.join(","),
        pageNumber: 1,
        pageSize: 20,
      });
      data.value = park.records.map((e) => {
        return {
          ...e,
          time: dayjs(e.time).format("YYYY-MM-DD HH:mm:ss"),
          taskName: e.taskName || "临时巡检",
        };
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="电动车违规停放统计">
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
          <DeviceStatistics
            onHandelClickItemize={handelClickItemize}
            style="height: 50px;"
            imgPath="overView121.png"
            statistic={deviceStatisticsData}
          ></DeviceStatistics>
          <div class="table-concent">
            {" "}
            <RollTable onClickRow={clickRow} column={columns.value} data={data.value} showLength={8}></RollTable>
          </div>
        </SubPanelTemplate>
        {alarmModalShow && <inspect ref="inspectRef" title={"巡查记录详情"} parameter={inspectParameter.value} onClose={close}></inspect>}
        {inspectionRecordShow && (
          <modal-table
            modalStyle={{ width: "900px" }}
            show={inspectionRecordShow.value}
            title="电动车违规停放记录"
            onClose={() => {
              inspectionRecordShow.value = false;
            }}
          >
            {" "}
            <inspect-record parameter={inspectListParameter.value}></inspect-record>
          </modal-table>
        )}
      </>
    );
  },
});

export default StatisticsIllegalParkingElectricVehicles;

import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import PatrolContent from "@/features/cards/electronicPatrol-new/components/patrol-content";
import DeviceStatistics from "@/features/cards/security-monitoring-safty/device-statistics";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TaskStatistics } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

export const PatrolTaskStatistics = defineComponent({
  name: "PatrolTaskStatistics",
  setup(_props, ctx) {
    const deviceStatisticsData = reactive({
      title: "巡更任务",
      total: 0,
      itemize: [
        {
          name: "待接收",
          label: "执行中",
          value: 0,
          offline: 0,
          key: "OFFLINE",
        },
        {
          name: "已结束",
          label: "异常结束",
          value: 0,
          offline: 0,
          key: "OFFLINE",
        },
      ],
    });
    const patrolData = ref([
      {
        title: "包含巡更路线",
        value: 20,
      },
      {
        title: "涉及巡更点",
        value: 21,
      },
      {
        title: "巡更覆盖率",
        value: 22,
      },
    ]);
    const alarmTimeTypeS = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const changeDates = async () => {
      const data = await TaskStatistics({
        period: alarmTimeTypeS.value.dateRange.join(","),
        type: alarmTimeTypeS.value.timeType,
      });
      deviceStatisticsData.total = data.taskNumberStatistics.totalNumber;

      deviceStatisticsData.itemize = [
        {
          name: "待接收",
          label: "执行中",
          value: data.taskStatusStatistics.inExecutionNumber,
          offline: data.taskStatusStatistics.toBeReceivedNumber,
          key: "OFFLINE",
        },
        {
          name: "已结束",
          label: "异常结束",
          value: data.taskStatusStatistics.abnormalFinishedNumber,
          offline: data.taskStatusStatistics.finishedNumber,

          key: "OFFLINE",
        },
      ];
      patrolData.value = [
        {
          title: "包含巡更路线",
          value: data.taskLineStatistics.totalNumber,
        },
        {
          title: "涉及巡更点",
          value: data.taskLineStatistics.locationNumber,
        },
        {
          title: "巡更覆盖率",
          value: data.taskLineStatistics.locationCoverageRate,
        },
      ];
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="监控设备统计" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmTimeTypeS.value}
              onUpdate:modelValue={(v) => {
                alarmTimeTypeS.value = v;
              }}
              onSearch={changeDates}
            ></DateInlineForm>
          </template>
          <DeviceStatistics imgPath="business-icon/triage-queue/7.png" statistic={deviceStatisticsData}></DeviceStatistics>
          <PatrolContent patrol={patrolData.value}></PatrolContent>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PatrolTaskStatistics;

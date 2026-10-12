import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import DeviceStatistics from "./components/device-statistics";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeSmallEngineeringService } from "@/infrastructure/api/service";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./engineering-rectification-statistics.module.less";

export const EngineeringRectificationStatistics = defineComponent({
  name: "EngineeringRectificationStatistics",
  setup(_props, ctx) {
    const deviceStatisticsData = reactive({
      title: "工单总量",
      total: 284,
      ratio: 0,
    });
    const data = ref<any>([]);
    const columns = ref([
      {
        title: "工程整改名称",
        dataIndex: "processInsName",
      },
      {
        title: "整改对象",
        dataIndex: "projectName",
      },
      {
        title: "状态",
        dataIndex: "status",
      },
    ]);
    let timeFrame = ref<ModelValueItf>();
    const getAlarmLevel = async () => {
      const res = await cubeSmallEngineeringService.getProjectReformAnalysis({
        period: timeFrame.value.dateRange.join(","),
        pageNumber: 1,
        pageSize: 10,
      });
      deviceStatisticsData.total = res.reformNum;
      deviceStatisticsData.ratio = res.reformChainRatio;
      const statusMap = {
        PASS: "已完成",
        UNDO: "撤销",
        REJECT: "驳回",
        ACTIVE: "处理中",
      };
      data.value = res.reformRankList.map((item: any) => {
        return {
          ...item,
          projectName: item.projectName,
          status: statusMap[item.status] || "--",
        };
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="工程整改统计">
          <template>
            {" "}
            <div class="flex-align">
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={getAlarmLevel}
              />
            </div>
          </template>
          <DeviceStatistics style="height: 50px;" imgPath="overView120.png" statistic={deviceStatisticsData}></DeviceStatistics>
          <div class="table-concent">
            {" "}
            <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default EngineeringRectificationStatistics;

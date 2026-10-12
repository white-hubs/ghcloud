import moment from "moment";
import { defineComponent } from "vue";
import { reactive, ref, onMounted } from "vue";

import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { tidyUpRecordTrend } from "@/infrastructure/api/library-management";
import { px2rem } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const MonthStatistics = defineComponent({
  name: "MonthStatistics",
  setup(_props, ctx) {
    const chartHeight = 220;
    const month = reactive({
      xData: [],
      yData: [
        {
          data: [],
        },
      ],
    });
    const getTidyUpRecordTrend = async () => {
      const res = await tidyUpRecordTrend({
        period: [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      month.xData = res.map((e) => e.key);
      month.yData[0].data = res.map((e) => e.value);
    };
    onMounted(() => {
      getTidyUpRecordTrend();
    });

    return (): JSX.Element => (
      <SubPanelTemplate title="月度编目工作量统计">
        {" "}
        <div style={{ height: px2rem(chartHeight + "px") }}>
          {" "}
          <overviewChartBar title={"人次"} xData={month.xData} yData={month.yData} x-font-size={10.5}></overviewChartBar>
        </div>
      </SubPanelTemplate>
    );
  },
});

export default MonthStatistics;

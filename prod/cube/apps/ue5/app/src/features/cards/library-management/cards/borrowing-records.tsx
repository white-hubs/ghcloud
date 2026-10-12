import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { borrowRecordTrend } from "@/infrastructure/api/library-management";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./borrowing-records.module.less";

export const BorrowingRecords = defineComponent({
  name: "BorrowingRecords",
  setup(_props, ctx) {
    const xData = ref<string[]>([]);
    const series = reactive([
      {
        name: "借书",
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
      {
        name: "还书",
        data: [],
        linearGradientColor: ["rgb(104, 189, 0)", "rgb(104, 189, 0,0)"],
      },
    ]);
    onMounted(async () => {
      const period = [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")].join(
        ",",
      );
      const borrow = await borrowRecordTrend({ period });
      const still = await borrowRecordTrend({ period, status: 1 });
      xData.value = borrow.map((e) => e.key);
      series[0].data = borrow.map((e) => e.value);
      series[1].data = still.map((e) => e.value);
    });

    return (): JSX.Element => (
      <SubPanelTemplate>
        {" "}
        <div class="chart">
          {" "}
          <LineChart titles={["借书", "还书"]} unit={{ x: "", y: "" }} gridTop={"5"} x-data={xData.value} series={series} />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default BorrowingRecords;

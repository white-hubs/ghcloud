import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RoundPie from "@/features/cards/medical-gas/components/round-pie";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { environmentalStatPieGraph } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import noData from "@/shared-ui/panel/noData";

import styles from "./air-quality-statistics.module.less";

export const AirQualityStatistics = defineComponent({
  name: "AirQualityStatistics",
  props: {
    title: { type: String, required: false, default: "空气质量统计" },
  },
  setup(props, ctx) {
    const colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
    const pieData = ref([
      {
        name: "优",
        value: 10,
        color: "#328BF7",
      },
      {
        name: "良",
        value: 10,
        color: "#19F8F7",
      },
      {
        name: "轻度污染",
        value: 10,
        color: "#FFC700",
      },
      {
        name: "中度污染",
        value: 10,
        color: "#FF7A00",
      },
      {
        name: "重度污染",
        value: 10,
        color: "#EF424A",
      },
      {
        name: "严重污染",
        value: 10,
        color: "#FF0000",
      },
    ]);

    const changeTopTimeFrame = async () => {
      const res = await environmentalStatPieGraph({ periodType: topTimeFrame.value.timeType });
      pieData.value = res.map((e) => {
        return {
          name: e.describe,
          value: e.number,
        };
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title={props.title}>
          <template>
            {" "}
            <div>
              {" "}
              <DateInlineForm
                modelValue={topTimeFrame}
                onUpdate:modelValue={(v) => {
                  topTimeFrame.value = v;
                }}
                onSearch={changeTopTimeFrame}
              ></DateInlineForm>
            </div>
          </template>
          {pieData.length && (
            <div class="chart">
              {" "}
              <RoundPie pieData={pieData.value} unit={"天"} />
            </div>
          )}
          <noData class="chart"></noData>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AirQualityStatistics;

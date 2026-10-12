import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { criminalStatisticsGroup } from "@/infrastructure/api/lingchuanhik";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";

import styles from "./proportion-risk-level-correction-object.module.less";

export const ProportionRiskLevelCorrectionObject = defineComponent({
  name: "ProportionRiskLevelCorrectionObject",
  setup(_props, ctx) {
    const colors = ["#306CCA", "#3590FF", "#19F8F7", "#2AE8BD", "#FFC700", "#FF6E23"];
    const pieData = ref([]);
    const getDataTotal = () => {
      return pieData.value.reduce((sum, item) => sum + item.value, 0);
    };
    const getCriminalStatisticsGroup = async () => {
      const res = await criminalStatisticsGroup();
      pieData.value = res.map((item, index) => {
        return {
          name: item.riskLevel || "其他",
          value: item.total,
          color: colors[index],
        };
      });
    };
    onMounted(() => {
      getCriminalStatisticsGroup();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="学生风险等级占比">
          <div class="elevator-analysis">
            <div class="chart">
              <elevator-analysis-pie pieData={pieData.value}>
                <div style="color: #fff;text-align: center;font-size: 14px;"> {getDataTotal()}</div>
                <div style="color: #fff;text-align: center;font-size: 14px;"> 风险总数</div>
              </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList contentList={pieData.value}></elevatorAnalysisList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ProportionRiskLevelCorrectionObject;

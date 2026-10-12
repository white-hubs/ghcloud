import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import AnnualEnergyConsumptionTrend from "./components/annual-energy-consumption-trend"; //年度用能趋势图
import CarbonEmissionRatio from "./components/carbon-emission-ratio"; //碳排量分类占比
import CarbonRankingTop5 from "./components/carbon-ranking-top5"; //区域综合能耗排名Top5
import CarbonRankingTop10 from "./components/carbon-ranking-top10"; //区域综合能耗排名Top10
import CarbonTrends from "./components/carbon-trends"; //碳排量趋势图
import EnergyConsumptionProportion from "./components/energy-consumption-proportion"; //综合能耗分类占比
import EnergyConsumptionTrend from "./components/energy-consumption-trend"; //能耗用能趋势图
import EnergyOverview from "./components/energy-overview"; //全年能耗概览
import EnergyRankingTop5 from "./components/energy-ranking-top5"; //区域用能排名Top5
import EnergyRankingTop10 from "./components/energy-ranking-top10"; //区域用能排名Top10
import EnergyStatistics from "./components/energy-statistics"; //能耗用能统计
import EnergyTrend from "./components/energy-trend"; //综合能耗趋势图
import RankingComprehensiveConsumptionTop5 from "./components/ranking-comprehensive-consumption-top5"; //区域碳排量排名Top5
import RankingComprehensiveConsumptionTop10 from "./components/ranking-comprehensive-consumption-top10"; //区域碳排量排名Top10
import SubProportion from "./components/sub-proportion"; //分项用能占比

import "./energy-panel.module.less";

export const EnergyPanel = defineComponent({
  name: "EnergyPanel",
  props: {
    universalPanelVo: { type: Object, required: true },
  },
  setup(props, ctx) {
    interface Props {
      universalPanelVo: {
        tableOneName: string;
        tableOne: string;
        tableTwoName: string;
        tableTwo: string;
        tableThreeName: string;
        tableThree: string;
      };
    }
    const componentObj = {
      CarbonEmissionRatio,
      CarbonRankingTop10,
      CarbonRankingTop5,
      CarbonTrends,
      EnergyConsumptionProportion,
      EnergyConsumptionTrend,
      EnergyOverview,
      EnergyRankingTop10,
      EnergyRankingTop5,
      EnergyStatistics,
      EnergyTrend,
      RankingComprehensiveConsumptionTop10,
      RankingComprehensiveConsumptionTop5,
      SubProportion,
      AnnualEnergyConsumptionTrend,
    };
    const universalData = ref([
      {
        value: componentObj["SubProportion"],
        label: "分项用能占比",
      },
      {
        value: componentObj["EnergyStatistics"],
        label: "能耗用能统计",
      },
      {
        value: componentObj["AnnualEnergyConsumptionTrend"],
        label: "年度用能趋势图",
      },
    ]);

    onMounted(() => {
      if (props.universalPanelVo) {
        universalData.value = [
          {
            label: props.universalPanelVo.tableOneName,
            value: componentObj[props.universalPanelVo.tableOne],
          },
          {
            label: props.universalPanelVo.tableTwoName,
            value: componentObj[props.universalPanelVo.tableTwo],
          },
          {
            label: props.universalPanelVo.tableThreeName,
            value: componentObj[props.universalPanelVo.tableThree],
          },
        ];
      }
    });

    return (): JSX.Element => (
      <div class="energy-v2-stack-root energy-panel-v2-root">
        {universalData.value.map((item) => (
          <component is={item.value} title={item.label} key={item.label} />
        ))}
      </div>
    );
  },
});

export default EnergyPanel;

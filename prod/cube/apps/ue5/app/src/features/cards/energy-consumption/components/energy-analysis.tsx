import { computed, defineComponent, onMounted, ref } from "vue";

import EnergyAnalysisBody from "./energy-analysis-body";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { projectStatCategory } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./energy-analysis.module.less";

const titleIcon = getThemeImage("energy-consumption-statistics.png");
const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];

interface AnalysisItem {
  label: string;
  value: number;
  color: string;
}

interface AnalysisCategory {
  data: AnalysisItem[];
  title: string;
  unit: string;
}

export const EnergyAnalysis = defineComponent({
  name: "EnergyAnalysis",
  props: {
    title: { type: String, default: "用能分析" },
  },
  setup(props) {
    const energyUsageTime = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: [] });
    const energyAnalysis = ref<AnalysisCategory[]>([
      { data: [], title: "电力", unit: "kWh" },
      { data: [], title: "水", unit: "m³" },
      { data: [], title: "燃气", unit: "m³" },
    ]);
    const hasAnalysisData = computed(() => energyAnalysis.value.some((category) => category.data.some((item) => Number(item.value) !== 0)));

    const changeAppointmentTime = async (): Promise<void> => {
      energyAnalysis.value.forEach((category) => {
        category.data = [];
      });
      const params = {
        period: energyUsageTime.value.dateRange.join(","),
        type: energyUsageTime.value.timeType,
        projectCategory: "ITEM",
      };
      const [electricity, water, gasMeter] = await Promise.all([
        projectStatCategory({ ...params, instrumentType: "electricity_meter" }),
        projectStatCategory({ ...params, instrumentType: "water_meter" }),
        projectStatCategory({ ...params, instrumentType: "gas_meter" }),
      ]);
      energyAnalysis.value[0].data = electricity.map((item, index) => ({
        label: item.name,
        value: Number(item.value) || 0,
        color: colorList[index % colorList.length],
      }));
      energyAnalysis.value[1].data = water.map((item, index) => ({
        label: item.name,
        value: Number(item.value) || 0,
        color: colorList[index % colorList.length],
      }));
      energyAnalysis.value[2].data = gasMeter.map((item, index) => ({
        label: item.name,
        value: Number(item.value) || 0,
        color: colorList[index % colorList.length],
      }));
    };

    onMounted(() => {
      void changeAppointmentTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", "energy-analysis-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasAnalysisData.value ? <EnergyAnalysisBody categories={energyAnalysis.value} isZoom={isZoom} expandAll={isZoom} /> : <NoData />}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-analysis-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel energy-analysis-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <DateInlineForm
                modelValue={energyUsageTime.value}
                onUpdate:modelValue={(value) => {
                  energyUsageTime.value = value;
                }}
                data-no-zoom
                onSearch={changeAppointmentTime}
              />
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EnergyAnalysis;

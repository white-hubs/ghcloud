import { defineComponent, onMounted, ref } from "vue";

import { EnergyRankList } from "../_shared/energy-rank-list";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { projectStatCategory } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";

import "./carbon-ranking-top5.module.less";

const titleIcon = getThemeImage("regional-pedestrian-flow-ranking.png");

type RankItem = { name: string; value: number };

export const CarbonRankingTop5 = defineComponent({
  name: "CarbonRankingTop5",
  props: {
    title: { type: String, required: true, default: "区域综合能耗排名Top5" },
  },
  setup(props) {
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: [] });
    const rankList = ref<RankItem[]>([]);

    const fetchData = async (): Promise<void> => {
      const params = {
        type: timeFrame.value.timeType,
        period: timeFrame.value.dateRange?.join(",") ?? "",
        projectCategory: "AREA",
      };
      try {
        const res = await projectStatCategory(params);
        const list = Array.isArray(res) ? [...res] : [];
        list.sort((a, b) => Number(b.zhValue) - Number(a.zhValue));
        rankList.value = list.slice(0, 5).map((item) => ({
          name: item.name,
          value: Number(item.zhValue) || 0,
        }));
      } catch {
        rankList.value = [];
      }
    };

    onMounted(() => {
      void fetchData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <EnergyRankList list={rankList.value} isZoom={isZoom} />
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root carbon-ranking-top5-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel carbon-ranking-top5-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="energy-v2-filter-group" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = {
                      timeType: v?.timeType || "THIS_MONTH",
                      dateRange: [...(v?.dateRange ?? [])],
                    };
                  }}
                  onSearch={fetchData}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default CarbonRankingTop5;

import { computed, defineComponent, onMounted, reactive } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { areasAllGraph } from "@/infrastructure/api/merchant";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import NoData from "@/shared-ui/panel/noData";

import "./merchant-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel";
const COLORS = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#7C5CFF", "#45E8B2"];

export const AreaGearCount = defineComponent({
  name: "AreaGearCount",
  setup() {
    const roundPieData = reactive({
      arr: [] as Array<{ label: string; value: number; color: string }>,
      throughNum: 0,
    });
    const hasStructure = computed(() => roundPieData.arr.length > 0);

    const changeProportionTime = async (): Promise<void> => {
      try {
        // 对齐旧版接口参数
        const res = await areasAllGraph({ projectId: "1323555902002921473" });
        const list = Array.isArray(res) ? res : [];
        let sum = 0;
        roundPieData.arr = list.map((item: any, index: number) => {
          const value = Number(item?.spaceNum) || 0;
          sum += value;
          return {
            label: item?.name || "--",
            value,
            color: COLORS[index % COLORS.length],
          };
        });
        roundPieData.throughNum = sum;
      } catch {
        roundPieData.arr = [];
        roundPieData.throughNum = 0;
      }
    };

    onMounted(() => {
      void changeProportionTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasStructure.value ? (
          <div class={["merchant-v2-pie-layout", isZoom ? "is-zoom" : ""]}>
            <div class="merchant-v2-pie-wrap">
              <PlanPie pie-data={roundPieData.arr} showZeroAsEmptyRing>
                <div class="merchant-v2-pie-center">
                  <strong>
                    {roundPieData.throughNum}
                    <small>个</small>
                  </strong>
                  <span>档位总数</span>
                </div>
              </PlanPie>
            </div>
            <div class="merchant-v2-legend-list">
              {roundPieData.arr.map((item) => (
                <div class="merchant-v2-legend-row" key={item.label}>
                  <span class="merchant-v2-legend-name" title={item.label}>
                    <i style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span class="merchant-v2-legend-value">
                    {item.value}
                    <small>个</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div class={["merchant-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="merchant-v2-root">
        <SubPanelTemplate
          title="区域档位数"
          class={PANEL_CLASS}
          zoomable
          zoom-title="区域档位数详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="merchant-area" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default AreaGearCount;

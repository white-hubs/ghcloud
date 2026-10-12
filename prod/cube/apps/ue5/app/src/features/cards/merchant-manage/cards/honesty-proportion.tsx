import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationProportion } from "@/infrastructure/api/merchant";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import NoData from "@/shared-ui/panel/noData";

import "./merchant-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel";
const COLORS = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#7C5CFF"];

export const HonestyProportion = defineComponent({
  name: "HonestyProportion",
  setup() {
    const secureType = ref("honesty_score");
    const typeList = [
      { label: "诚信经营", value: "honesty_score" },
      { label: "商品质量", value: "z_score" },
      { label: "诚实守信", value: "s_score" },
      { label: "服务态度", value: "t_score" },
      { label: "环境卫生", value: "w_score" },
    ];
    const proportionData = reactive({
      arr: [] as any[],
      throughNum: 0,
    });
    const hasData = computed(() => proportionData.arr.some((item) => Number(item.value || 0) > 0));

    const changeSecureTime = async () => {
      const res = await visualizationProportion({ code: secureType.value });
      const list = Array.isArray(res) ? res : [];
      proportionData.throughNum = 0;
      proportionData.arr = list.map((item: any, index: number) => {
        const value = Number(item?.value || 0);
        proportionData.throughNum += value;
        return {
          label: item?.name || "--",
          value,
          color: COLORS[index % COLORS.length],
        };
      });
    };

    onMounted(() => {
      changeSecureTime();
    });

    const renderExtra = (): JSX.Element => (
      <a-select
        class="merchant-v2-select"
        value={secureType.value}
        onUpdate:value={(v) => {
          secureType.value = v;
          changeSecureTime();
        }}
      >
        {typeList.map((item) => (
          <a-select-option value={item.value} key={item.value}>
            {item.label}
          </a-select-option>
        ))}
      </a-select>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["merchant-v2-pie-layout", isZoom ? "is-zoom" : ""]}>
            <div class="merchant-v2-pie-wrap">
              <PlanPie pie-data={proportionData.arr} showZeroAsEmptyRing>
                <div class="merchant-v2-pie-center">
                  <strong>
                    {proportionData.throughNum}
                    <small>次</small>
                  </strong>
                  <span>评价次数总数</span>
                </div>
              </PlanPie>
            </div>
            <div class="merchant-v2-legend-list">
              {proportionData.arr.map((item) => (
                <div class="merchant-v2-legend-row" key={item.label}>
                  <span class="merchant-v2-legend-name" title={item.label}>
                    <i style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span class="merchant-v2-legend-value">
                    {item.value}
                    <small>次</small>
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
          title="诚信经营占比"
          class={PANEL_CLASS}
          zoomable
          zoom-title="诚信经营占比详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="merchant-honesty" />,
            extra: renderExtra,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default HonestyProportion;

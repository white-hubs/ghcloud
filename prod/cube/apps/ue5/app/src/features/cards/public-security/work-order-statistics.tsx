import moment from "moment";
import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getFaultyEquipmentTop } from "@/infrastructure/api/merchant";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./work-order-statistics.module.less";
import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";

interface WorkOrderRankItem {
  name: string;
  value: number;
}

/** 默认态最多展示 4 条，超出自动滚动 */
const VISIBLE_ROWS = 4;
/** 行高 40 = 内容区约 32 + margin-bottom 8，需与 CSS 一致 */
const ROW_HEIGHT = 40;

export const WorkOrderStatistics = defineComponent({
  name: "WorkOrderStatistics",
  setup() {
    const workOrderTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")],
    });
    const rankData = ref<WorkOrderRankItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const total = computed(() => rankData.value.reduce((sum, item) => sum + Number(item.value || 0), 0));
    const maxValue = computed(() => Math.max(...rankData.value.map((item) => Number(item.value || 0)), 0));
    const hasData = computed(() => rankData.value.length > 0);
    const scrollStep = computed(() => (rankData.value.length > VISIBLE_ROWS ? 0.5 : 0));
    const viewportHeight = computed(() => VISIBLE_ROWS * ROW_HEIGHT);

    const resolvePeriod = (): string => {
      const range = workOrderTime.value?.dateRange;
      if (range?.[0] && range?.[1]) return `${range[0]},${range[1]}`;
      return `${moment().startOf("year").format("YYYY-MM-DD 00:00:00")},${moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")}`;
    };

    /** 对齐 legacy：getFaultyEquipmentTop({ period }) */
    const changeHandleworkOrderTime = async (): Promise<void> => {
      loaded.value = false;
      try {
        const res = await getFaultyEquipmentTop({ period: resolvePeriod() });
        const list = Array.isArray(res) ? res : [];
        rankData.value = list.map((item) => ({
          name: item.name || "--",
          value: Number(item.value || 0),
        }));
      } catch {
        rankData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeHandleworkOrderTime();
    });

    const renderRows = (): JSX.Element[] =>
      rankData.value.map((item, index) => {
        const percent = maxValue.value > 0 ? Math.max((item.value / maxValue.value) * 100, item.value > 0 ? 4 : 0) : 0;
        return (
          <div class="work-order-v2-rank-item" key={`${item.name}-${index}`}>
            <div class={["work-order-v2-rank-index", index < 3 ? "is-top" : ""]}>{index + 1}</div>
            <div class="work-order-v2-rank-main">
              <div class="work-order-v2-rank-meta">
                <span class="work-order-v2-rank-name" title={item.name}>
                  {item.name}
                </span>
                <span class="work-order-v2-rank-value">{item.value}</span>
              </div>
              <div class="work-order-v2-rank-track">
                <span class="work-order-v2-rank-bar" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
        );
      });

    const renderRank = (isZoom: boolean): JSX.Element => (
      <div class={["work-order-v2-rank-viewport", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {isZoom ? (
          <div class="work-order-v2-rank-list is-zoom">{renderRows()}</div>
        ) : (
          <div class="work-order-v2-rank-scroll" style={{ height: `${viewportHeight.value}px` }}>
            <Vue3SeamlessScroll list={rankData.value} step={scrollStep.value} hover singleHeight={ROW_HEIGHT} waitTime={1200}>
              {renderRows()}
            </Vue3SeamlessScroll>
          </div>
        )}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }

      return (
        <div class={["work-order-v2-body", isZoom ? "is-zoom" : ""]}>
          <div class="work-order-v2-summary" data-no-zoom>
            <div class="work-order-v2-summary-main">
              <span class="work-order-v2-summary-label">工单总数</span>
              <span class="work-order-v2-summary-value">
                <CountTo startVal={0} endVal={total.value} separator="" duration={1200} />
              </span>
            </div>
            <div class="work-order-v2-summary-sub">
              <span>统计对象</span>
              <strong>{rankData.value.length}</strong>
            </div>
          </div>
          {hasData.value ? (
            renderRank(isZoom)
          ) : (
            <div class={["work-order-v2-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="v2-panel-root work-order-v2-root">
        <SubPanelTemplate
          title="报修工单统计"
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme work-order-v2-panel"
          zoomable
          zoom-title="报修工单统计详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-work-order" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={workOrderTime.value}
                  onUpdate:modelValue={(value) => {
                    workOrderTime.value = value;
                  }}
                  onSearch={changeHandleworkOrderTime}
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

export default WorkOrderStatistics;

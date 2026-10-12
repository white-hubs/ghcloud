import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeThirdConnectionService } from "@/infrastructure/api/service";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "../educational-situation-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card educational-v2-panel";

export const projectNumberStatistics = defineComponent({
  name: "projectNumberStatistics",
  setup() {
    const statsData = ref([
      { title: "立项数量", value: 0 },
      { title: "未立项数量", value: 0 },
      { title: "结项数量", value: 0 },
      { title: "未结项数量", value: 0 },
    ]);

    const getData = async (): Promise<void> => {
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview();
        if (!res) return;
        const { lx, wlx, jx, wjx } = res;
        statsData.value = [
          { title: "立项数量", value: lx ?? 0 },
          { title: "未立项数量", value: wlx ?? 0 },
          { title: "结项数量", value: jx ?? 0 },
          { title: "未结项数量", value: wjx ?? 0 },
        ];
      } catch {
        // 接口失败时保留 0 值结构，避免指标卡塌成空态。
      }
    };
    onMounted(() => {
      getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["educational-card-body", isZoom ? "is-zoom" : ""]}>
        <div class="educational-stat-grid is-project">
          {statsData.value.map((item) => (
            <div class="educational-stat-card" key={item.title}>
              <span class="educational-stat-label">{item.title}</span>
              <span class="educational-stat-value-row">
                <span class="educational-stat-value">
                  <CountTo startVal={0} endVal={Number(item.value) || 0} duration={1600} separator="," />
                </span>
                <span class="educational-stat-unit">项</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="educational-v2-root v2-panel-root">
        <SubPanelTemplate
          title="项目数量统计"
          class={PANEL_CLASS}
          zoomable
          zoom-title="项目数量统计详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-work-order" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

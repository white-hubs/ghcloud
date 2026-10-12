import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeThirdConnectionService } from "@/infrastructure/api/service";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "../educational-situation-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card educational-v2-panel";

export const dataOverview = defineComponent({
  name: "dataOverview",
  setup() {
    const statsData = ref([
      { title: "在校人数", value: 0, unit: "人" },
      { title: "教职工人数", value: 0, unit: "人" },
      { title: "累计培训人数", value: 0, unit: "人" },
      { title: "组织机构数量", value: 0, unit: "个" },
      { title: "委托办班数量", value: 0, unit: "次" },
      { title: "委托办班人数", value: 0, unit: "人" },
    ]);
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeThirdConnectionService.getEducationalDataOverview();
        if (res) {
          const { zx_xy_num, jzg_num, lj_xy_num, jg_num, wtbb_num, wtbb_xy_num } = res;
          statsData.value = [
            { title: "在校人数", value: zx_xy_num ?? 0, unit: "人" },
            { title: "教职工人数", value: jzg_num ?? 0, unit: "人" },
            { title: "累计培训人数", value: lj_xy_num ?? 0, unit: "人" },
            { title: "组织机构数量", value: jg_num ?? 0, unit: "个" },
            { title: "委托办班数量", value: wtbb_num ?? 0, unit: "次" },
            { title: "委托办班人数", value: wtbb_xy_num ?? 0, unit: "人" },
          ];
        }
      } catch {}
    };
    onMounted(() => {
      getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["educational-card-body", isZoom ? "is-zoom" : ""]}>
        <div class="educational-stat-grid">
          {statsData.value.map((item) => (
            <div class="educational-stat-card" key={item.title}>
              <span class="educational-stat-value-row">
                <span class="educational-stat-value">
                  <CountTo startVal={0} endVal={Number(item.value) || 0} duration={1600} separator="," />
                </span>
                <span class="educational-stat-unit">{item.unit}</span>
              </span>
              <span class="educational-stat-label">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="educational-v2-root v2-panel-root">
        <SubPanelTemplate
          title="数据总览"
          class={PANEL_CLASS}
          zoomable
          zoom-title="数据总览详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-management" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

import moment from "moment";
import { computed, defineComponent, inject } from "vue";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import type { CardSlotDensity } from "@/features/cards/base-panel-render/card-slot-density";
import { panelCardDensityKey } from "@/features/cards/base-panel-render/panel-card-density-context";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationEvent } from "@/infrastructure/api/door";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/access-control-v2-shared.module.less";

import styles from "./real-time-passage-data.module.less";

export const RealTimePassageData = defineComponent({
  name: "RealTimePassageData",
  setup(_props, ctx) {
    const density = inject(panelCardDensityKey, ref<CardSlotDensity>("comfortable"));
    const visibleRows = computed(() => (density.value === "compact" ? 4 : 8));
    const { globalState } = useStateStore();
    const columns = ref([
      {
        title: "时间",
        dataIndex: "eventTime",
        width: 120,
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
      },
      {
        title: "通行方式",
        dataIndex: "eventWay",
      },
    ]);
    const data = ref<any>([]);
    let timer = ref<any>(null);

    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );

    // 实时通行数据
    const realTimeTrafficData = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageNumber: 1,
        pageSize: 50,
      };
      let res = await visualizationEvent(param);
      res.records.forEach((item) => {
        item.eventTime = moment(item.eventTime).format("YYYY-MM-DD HH:mm:ss");
      });
      data.value = res.records.filter((item) => {
        if (moment(item.eventTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
          return item;
        }
      });
    };

    const init = () => {
      realTimeTrafficData();
    };

    onMounted(() => {
      init();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.body,
          "access-control-card-body",
          "access-control-table-surface",
          "access-control-surface",
          isZoom ? [styles.zoomBody, "access-control-v2-panel", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <RollTable column={columns.value} data={data.value} showLength={isZoom ? 8 : visibleRows.value} rowHeight={30} />
      </div>
    );

    return (): JSX.Element => (
      <div class="access-control-v2-root v2-panel-root">
        <SubPanelTemplate
          title="实时通行数据"
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme"
          zoomable
          zoom-title="实时通行数据详情"
          zoom-width={1000}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="access-control-records" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default RealTimePassageData;

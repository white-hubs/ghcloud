import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAreaList } from "@/infrastructure/api/mdata";
import { parkFloors } from "@/infrastructure/api/park";
import StackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./park-management-v2-shared.module.less";

type AreaOption = { id: string; name: string };

export const ParkFloorLeasingRatio = defineComponent({
  name: "ParkFloorLeasingRatio",
  props: {
    title: { type: String, required: false, default: "园区楼层租赁比情况" },
  },
  setup(props) {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const areaList = ref<AreaOption[]>([]);
    const areaData = ref<string | undefined>();
    const buildUtilization = reactive({
      xData: [] as string[],
      yData: [
        { name: "已租赁", data: [] as number[] },
        { name: "未租赁", data: [] as number[] },
      ],
    });

    const hasChartData = computed(() => buildUtilization.xData.length > 0);

    const getAreaListData = async (): Promise<void> => {
      const res = await getAreaList();
      areaList.value = (res?.[0]?.children ?? []) as AreaOption[];
      areaData.value = areaList.value[0]?.id;
    };

    const getParkFloors = async (): Promise<void> => {
      if (!areaData.value) {
        buildUtilization.xData = [];
        buildUtilization.yData[0].data = [];
        buildUtilization.yData[1].data = [];
        loaded.value = true;
        return;
      }
      try {
        const res = await parkFloors(areaData.value);
        const list = Array.isArray(res) ? res : [];
        buildUtilization.xData = list.map((item) => item.areaName || "--");
        buildUtilization.yData[0].data = list.map((item) => Number(item.rentedAreaRate) || 0);
        buildUtilization.yData[1].data = list.map((item) => Number(item.unleasedAreaRate) || 0);
      } catch {
        buildUtilization.xData = [];
        buildUtilization.yData[0].data = [];
        buildUtilization.yData[1].data = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(async () => {
      try {
        await getAreaListData();
        await getParkFloors();
      } catch {
        loaded.value = true;
      }
    });

    const onAreaChange = (value: string): void => {
      areaData.value = value;
      loaded.value = false;
      void getParkFloors();
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="park-manage-chart-surface" data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasChartData.value ? (
            <div class="park-manage-chart">
              <StackedColumn unit="%" xData={buildUtilization.xData} yData={buildUtilization.yData} />
            </div>
          ) : (
            <div class={["park-manage-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    const renderAreaSelect = (): JSX.Element => (
      <div class="park-manage-card-extra" data-no-zoom>
        <a-select
          value={areaData.value}
          placeholder="选择区域"
          popupClassName="visual-data-modal-dropdown"
          dropdownClassName="visual-data-modal-dropdown"
          onUpdate:value={onAreaChange}
        >
          {areaList.value.map((item) => (
            <a-select-option value={item.id} key={item.id}>
              {item.name}
            </a-select-option>
          ))}
        </a-select>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-department" />,
            extra: () => renderAreaSelect(),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ParkFloorLeasingRatio;

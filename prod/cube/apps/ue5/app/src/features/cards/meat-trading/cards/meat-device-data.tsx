import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { classification } from "@/infrastructure/api/device";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

interface DeviceCategoryData {
  type?: string;
  name?: string;
  categoryCode?: string;
  productCategoryCode?: string;
  code?: string;
  num?: number;
  onLineNum?: number;
  offLineNum?: number;
}

export const MeatDeviceData = defineComponent({
  name: "MeatDeviceData",
  setup() {
    const deviceData = ref<DeviceCategoryData[]>([]);
    const { globalState } = useStateStore();
    const deviceModalShow = ref(false);
    const deviceParameter = ref<Record<string, unknown>>({});

    const hasData = computed(() => deviceData.value.length > 0);

    const formatNumber = (value: unknown): string => {
      const numericValue = Number(value ?? 0);
      if (!Number.isFinite(numericValue)) return "0";
      return numericValue.toLocaleString();
    };

    const getDevice = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      const data = await classification(params);
      deviceData.value = Array.isArray(data) ? data : [];
    };

    onMounted(() => {
      getDevice();
    });

    const openDeviceList = (item?: DeviceCategoryData, deviceState?: boolean): void => {
      const categoryCode = item?.categoryCode ?? item?.productCategoryCode ?? item?.code;
      deviceParameter.value = {
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaId: globalState.business.currentAreaId,
        ...(categoryCode ? { categoryCode } : {}),
        ...(typeof deviceState === "boolean" ? { deviceState } : {}),
      };
      deviceModalShow.value = true;
    };

    const closeDeviceList = (): void => {
      deviceModalShow.value = false;
    };

    const renderDeviceStat = (
      item: DeviceCategoryData,
      label: string,
      value: unknown,
      className?: string,
      deviceState?: boolean,
    ): JSX.Element => (
      <button
        type="button"
        class={["meat-v2-device-stat", "meat-v2-stat-button", className ?? ""]}
        onClick={() => openDeviceList(item, deviceState)}
        aria-label={`查看${item.type || item.name || ""}${label}设备列表`}
      >
        <span class="meat-v2-dot" aria-hidden="true" />
        {label}
        <strong>{formatNumber(value)}</strong>
      </button>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["meat-v2-device-list", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            {deviceData.value.map((item, index) => (
              <div class="meat-v2-device-row" key={`${item.type ?? item.name ?? "device"}-${index}`}>
                <span class="meat-v2-device-name" title={item.type || item.name || "-"}>
                  {item.type || item.name || "-"}
                </span>
                {renderDeviceStat(item, "总数", item.num)}
                {renderDeviceStat(item, "在线", item.onLineNum, "is-online", true)}
                {renderDeviceStat(item, "离线", item.offLineNum, "is-offline", false)}
              </div>
            ))}
          </div>
        ) : (
          <div class={["meat-v2-empty", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="meat-v2-root">
          <SubPanelTemplate
            title="设备数据"
            class={PANEL_CLASS}
            zoomable
            zoom-title="设备数据详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="meat-device" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable showModal={deviceModalShow.value} onClose={closeDeviceList} parameter={deviceParameter.value} />
      </>
    );
  },
});

export default MeatDeviceData;

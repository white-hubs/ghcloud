import { CaretDownOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { Input, Select } from "ant-design-vue";
import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { parkingStore } from "../../store/parking";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import MonitorGridsModal from "@/shared-ui/modals/monitor-grids-modal/monitor-grids-modal";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./parking-car-device-list.module.less";

const deviceSituationIcon = getThemeImage("device-situation.png");
const SCROLL_PAGE_SIZE = 200;

export const ParkingCarDeviceList = defineComponent({
  name: "ParkingCarDeviceList",
  setup() {
    const store = parkingStore();
    const { globalState } = useStateStore();

    const deviceQuery = reactive({
      status: null as string | null,
      keyword: "",
      pageSize: SCROLL_PAGE_SIZE,
      pageNumber: 1,
      total: 0,
      pages: 0,
    });

    const loopInterval = ref<ReturnType<typeof setInterval>>();
    const cameraList = ref<any[]>([]);
    const visible = ref(false);

    const rollColumns = [
      { title: "设备名称", dataIndex: "name", flex: 1, align: "left" as const },
      { title: "状态", dataIndex: "status", width: 70, slots: { customRender: "deviceStatus" } },
      { title: "操作", dataIndex: "operate", width: 70, slots: { customRender: "deviceOperate" } },
    ];

    const tableData = ref<any[]>([]);

    const getPopupContainer = (): HTMLElement => (document.querySelector(".view") as HTMLElement) || document.body;

    const getData = async (): Promise<void> => {
      const query: Record<string, any> = {
        pageNumber: 1,
        pageSize: SCROLL_PAGE_SIZE,
        keyword: deviceQuery.keyword,
      };
      if (deviceQuery.status !== null) {
        query.deviceState = deviceQuery.status === "ONLINE";
      }
      if (store.currentParking) {
        const res = await cubeParkingLotService.getParkingDevicesById(store.currentParking?.id, query);
        tableData.value = res.records ?? [];
        deviceQuery.total = res.total ?? 0;
        deviceQuery.pages = res.pages ?? 0;
      } else {
        const res = await cubeParkingLotService.getParkingMonitorDevices();
        tableData.value = [];
        res?.forEach((item) => {
          tableData.value.push(...(item.devices ?? []));
        });
      }
      tableData.value.forEach((e) => {
        e.status = e.status?.onlineState ? "NORMAL" : "OFFLINE";
      });
    };

    const detailsRow = (tr: any): void => {
      globalState.panel.rightPanelName = "";
      globalState.panel.leftPanelName = "deviceDetailsPanel";
      globalState.panel.universalPanelVo.left = null;
      globalState.panel.universalPanelVo.right = null;
      globalState.business.panelCurrentDeviceId = tr.id;
    };

    const clickTableRowFromRoll = async (data: any): Promise<void> => {
      bus.emit("closeDevicePanel");
      await UeClient.getInstance().saveNowViewPoint();
      visible.value = true;
      cameraList.value = [data];
    };

    onMounted(() => {
      getData();
    });

    onBeforeUnmount(() => {
      clearInterval(loopInterval.value);
    });

    const renderSearchBar = (isZoom: boolean): JSX.Element | null =>
      store.currentParking ? (
        <div class={["search-bar", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <Select
            value={deviceQuery.status}
            placeholder="设备状态"
            class="panel-filter-select status-select"
            popupClassName="date-inline-dropdown"
            getPopupContainer={getPopupContainer}
            allowClear
            dropdownMatchSelectWidth={false}
            onChange={(value: string) => {
              deviceQuery.status = value ?? null;
              getData();
            }}
            v-slots={{
              suffixIcon: () => <CaretDownOutlined class="filter-arrow" />,
            }}
          >
            <Select.Option value="ONLINE">在线</Select.Option>
            <Select.Option value="OFFLINE">离线</Select.Option>
          </Select>
          <div class="keyword-search">
            <Input
              value={deviceQuery.keyword}
              class="keyword-input"
              allowClear
              placeholder="按设备名称搜索"
              onUpdate:value={(value: string) => {
                deviceQuery.keyword = value;
              }}
              onPressEnter={getData}
            />
            <button type="button" class="keyword-search-btn" aria-label="搜索" onClick={getData}>
              <SearchOutlined />
            </button>
          </div>
        </div>
      ) : null;

    const rollTableSlots = {
      deviceStatus: ({ record }: { record: any }) =>
        record.status === "NORMAL" ? (
          <span class="status-online">在线</span>
        ) : record.status === "OFFLINE" ? (
          <span class="status-offline">离线</span>
        ) : null,
      deviceOperate: ({ record }: { record: any }) => (
        <span
          class="operate-link"
          onClick={(e: Event) => {
            e.stopPropagation();
            detailsRow(record);
          }}
        >
          详情
        </span>
      ),
    };

    const renderTable = (isZoom: boolean): JSX.Element => (
      <div class={["device-table", "device-roll-table", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {isZoom ? (
          <div class="zoom-table-viewport">
            <RollTable
              column={rollColumns}
              data={tableData.value}
              showLength={9999}
              onClickRow={clickTableRowFromRoll}
              v-slots={rollTableSlots}
            />
          </div>
        ) : (
          <RollTable
            column={rollColumns}
            data={tableData.value}
            showLength={5}
            onClickRow={clickTableRowFromRoll}
            v-slots={rollTableSlots}
          />
        )}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["device-list-v2", "parking-car-device-list-v2-panel", isZoom ? "is-zoom parking-device-list-zoom" : ""]}>
        {renderSearchBar(isZoom)}
        {renderTable(isZoom)}
      </div>
    );

    return () => (
      <div class="parking-car-device-list-v2-root v2-panel-root">
        <SubPanelTemplate
          title="设备数据"
          class="visual-v2-sub-panel v2-panel-card parking-car-device-list-v2-panel"
          zoomable
          zoom-title="设备数据详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={deviceSituationIcon} alt="" class="title-card-icon" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
        <MonitorGridsModal v-model:visible={visible.value} cameraList={cameraList.value} />
      </div>
    );
  },
});

export default ParkingCarDeviceList;

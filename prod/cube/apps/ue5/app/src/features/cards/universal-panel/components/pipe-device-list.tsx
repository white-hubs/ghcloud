import { CaretDownOutlined, EnvironmentOutlined, ProfileOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { Input, Select } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS } from "../_shared/universal-panel-v2";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import { getNorthDeviceDetail } from "@/infrastructure/api/iot";
import bus from "@/infrastructure/utils/bus";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { storeMarket } from "@/visualization-core/stores/other";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./pipe-device-list.module.less";

export const PipeDeviceList = defineComponent({
  name: "PipeDeviceList",
  setup() {
    const ueClient = UeClient.getInstance();
    const { globalState } = useStateStore();
    const deviceQuery = reactive({
      status: null as string | null,
      keyword: "",
      pageSize: 20,
      pageNumber: 1,
      total: 0,
    });

    const piniaStoreMarket = storeMarket();
    const modal = reactive({
      visible: false,
      name: "设备名称",
      status: "NORMAL",
      code: "",
      areaName: "",
    });

    const rollColumns = [
      { title: "设备名称", dataIndex: "name", flex: 1, align: "left" as const, slots: { customRender: "deviceName" } },
      { title: "状态", dataIndex: "status", width: 70, slots: { customRender: "deviceStatus" } },
      { title: "操作", dataIndex: "operate", width: 110, slots: { customRender: "deviceOperate" } },
    ];

    const tableData = ref<any[]>([]);

    const getPopupContainer = (): HTMLElement => (document.querySelector(".view") as HTMLElement) || document.body;

    const positioning = async (data: any): Promise<void> => {
      const obj = {
        alarmTargetCode: data.code,
        alarmTargetKey: data.id,
        viewLocation: true,
        prodCategory: data.prodCategory.name,
        modalType: "EquipmentAbbreviationsPanel",
      };
      setSpecialCamera(data.prodCategory.name, data.code);
      bus.emit("openDevicePopup", obj);
    };

    watch(
      () => piniaStoreMarket.selectDevice,
      () => {
        getData();
      },
    );

    const getData = async (): Promise<void> => {
      const query = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageNumber: deviceQuery.pageNumber,
        pageSize: deviceQuery.pageSize,
        status: deviceQuery.status,
        keyword: deviceQuery.keyword,
      };
      const DEVICE = await getDeviceListBuyScene(query);
      tableData.value = DEVICE.records;
      tableData.value.forEach((e) => {
        e.status = e.status.onlineState ? "NORMAL" : "OFFLINE";
      });
      deviceQuery.total = DEVICE.total;
      handleLampStatus();
    };

    const handleLampStatus = (): void => {
      if (tableData.value.length) {
        const deviceInfoData: Promise<any>[] = [];
        for (let i = 0; i < tableData.value.length; i++) {
          deviceInfoData.push(
            new Promise(async (resolve) => {
              try {
                const params = { deviceId: tableData.value[i].id, withPropertySpec: true, withSnapShot: true };
                const result = await getNorthDeviceDetail(params);
                result.productPropVoList.forEach((e: { propCode: string }) => {
                  result.snapshots.forEach((item: { key: string; preValue: string }) => {
                    if (e.propCode === item.key && e.propCode === "status") {
                      result.preValue = item.preValue;
                    }
                  });
                });
                resolve(result);
              } catch {
                resolve(null);
              }
            }),
          );
        }
        Promise.all(deviceInfoData).then((res) => {
          const colorType: Record<string, { color: number; flash: boolean }> = {
            "0": { color: 4, flash: true },
            "1": { color: 1, flash: false },
            "2": { color: 2, flash: false },
            "3": { color: 4, flash: true },
            "4": { color: 4, flash: true },
          };
          const turnOnTheLight = res.filter(Boolean).map((e: any) => ({
            id: e.deviceNumber,
            on: true,
            color: colorType[e.preValue]?.color ?? 4,
            flash: colorType[e.preValue]?.flash ?? true,
          }));
          ueClient.send("switchLight", turnOnTheLight.filter(Boolean));
        });
      }
    };

    const detailsRow = (tr: any): void => {
      modal.visible = false;
      const obj = {
        alarmTargetCode: tr.code,
        alarmTargetKey: tr.id,
        viewLocation: true,
      };
      ueClient.saveNowViewPoint();
      ueClient.send("removeActorPoi", { targetActorId: tr.code });
      bus.emit("openDevicePopup", obj);
    };

    const clickTableRow = async (data: any): Promise<void> => {
      bus.emit("closeDevicePanel");
      await ueClient.saveNowViewPoint();
      Object.assign(modal, data);
      modal.visible = true;
    };

    onMounted(() => {
      getData();
    });

    const formatDeviceName = (name: string): string => (name?.length > 15 ? `${name.substring(0, 12)}...` : name);

    const rollTableSlots = {
      deviceName: ({ record }: { record: any }) => (
        <span class="device-name-text" title={record.name}>
          {formatDeviceName(record.name)}
        </span>
      ),
      deviceStatus: ({ record }: { record: any }) =>
        record.status === "NORMAL" ? (
          <span class="status-online">在线</span>
        ) : record.status === "OFFLINE" ? (
          <span class="status-offline">离线</span>
        ) : null,
      deviceOperate: ({ record }: { record: any }) => (
        <div class="operate-actions flex-between">
          <span
            class="operate-link"
            onClick={(e: Event) => {
              e.stopPropagation();
              void positioning(record);
            }}
          >
            <EnvironmentOutlined />
            <span>定位</span>
          </span>
          <span
            class="operate-link"
            onClick={(e: Event) => {
              e.stopPropagation();
              detailsRow(record);
            }}
          >
            <ProfileOutlined />
            <span>详情</span>
          </span>
        </div>
      ),
    };

    const renderSearchBar = (isZoom: boolean): JSX.Element => (
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
            deviceQuery.pageNumber = 1;
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
            onPressEnter={() => {
              deviceQuery.pageNumber = 1;
              getData();
            }}
          />
          <button
            type="button"
            class="keyword-search-btn"
            aria-label="搜索"
            onClick={() => {
              deviceQuery.pageNumber = 1;
              getData();
            }}
          >
            <SearchOutlined />
          </button>
        </div>
      </div>
    );

    const renderTable = (isZoom: boolean): JSX.Element => (
      <div class={["device-table", "device-roll-table", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {isZoom ? (
          <div class="zoom-table-viewport">
            <RollTable
              column={rollColumns}
              data={tableData.value}
              showLength={9999}
              autoScroll={false}
              onClickRow={clickTableRow}
              v-slots={rollTableSlots}
            />
          </div>
        ) : (
          <RollTable
            column={rollColumns}
            data={tableData.value}
            showLength={5}
            autoScroll={false}
            onClickRow={clickTableRow}
            v-slots={rollTableSlots}
          />
        )}
      </div>
    );

    const renderPagination = (): JSX.Element | null =>
      tableData.value.length > 0 ? (
        <a-pagination
          class="device-pagination"
          onChange={getData}
          current={deviceQuery.pageNumber}
          onUpdate:current={(v: number) => {
            deviceQuery.pageNumber = v;
          }}
          pageSize={deviceQuery.pageSize}
          onUpdate:pageSize={(v: number) => {
            deviceQuery.pageSize = v;
          }}
          total={deviceQuery.total}
          show-less-items
          showSizeChanger={false}
        />
      ) : null;

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["device-list-v2", "pipe-device-list-v2-panel", isZoom ? "is-zoom pipe-device-list-zoom" : ""]}>
        {renderSearchBar(isZoom)}
        {renderTable(isZoom)}
        {renderPagination()}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root pipe-device-list-v2-root">
        <SubPanelTemplate
          title="设备数据"
          class={`${UNIVERSAL_PANEL_V2_CLASS} pipe-device-list-v2-panel`}
          zoomable
          zoom-title="设备数据详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="device" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default PipeDeviceList;

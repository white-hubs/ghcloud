import { Button, Empty, List, Popup, Radio, RadioGroup, Search, showToast } from "vant";
import { defineComponent, ref, watch } from "vue";

import type { DeviceInstancePage } from "@ghcloud/cube-iot-center-service";

import type { DeviceOption } from "./state";
import { cubeDeviceCenterService } from "@/api/server";

const PAGE_SIZE = 20;

const toDeviceOption = (item: DeviceInstancePage): DeviceOption => {
  const id = String(item.id ?? item.deviceId ?? "").trim();
  const code = String(item.code ?? id).trim();
  const name = String(item.name ?? code ?? id).trim();
  return {
    id,
    code,
    name,
    warehouseId: "",
    locationName: item.area?.pathName ?? item.areaName ?? undefined,
  };
};

export const DeviceSelectPopup = defineComponent({
  name: "DeviceSelectPopup",
  props: {
    show: { type: Boolean, required: true },
    selectedId: { type: String, default: "" },
  },
  emits: ["update:show", "confirm"],
  setup: (props, { emit }) => {
    const keyword = ref("");
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(0);
    const deviceList = ref<DeviceOption[]>([]);
    const draftId = ref("");
    const selectedDeviceMap = ref<Record<string, DeviceOption>>({});

    const resetList = (): void => {
      pageNumber.value = 0;
      finished.value = false;
      deviceList.value = [];
    };

    const cacheDevices = (records: DeviceOption[]): void => {
      const next = { ...selectedDeviceMap.value };
      records.forEach((device) => {
        next[device.id] = device;
      });
      selectedDeviceMap.value = next;
    };

    const loadPage = async (): Promise<void> => {
      if (loading.value || finished.value) {
        return;
      }
      loading.value = true;
      try {
        pageNumber.value += 1;
        const resp = await cubeDeviceCenterService.getDeviceInstancePageAll({
          pageNumber: pageNumber.value,
          pageSize: PAGE_SIZE,
          keyword: keyword.value.trim(),
        });
        const records = (resp.records ?? []).map((item) => toDeviceOption(item as DeviceInstancePage));
        cacheDevices(records);
        deviceList.value = pageNumber.value === 1 ? records : [...deviceList.value, ...records];
        finished.value = deviceList.value.length >= Number(resp.total ?? 0) || records.length < PAGE_SIZE;
      } catch (error) {
        finished.value = true;
        if (pageNumber.value === 1) {
          deviceList.value = [];
        }
        showToast({ type: "fail", message: (error as Error).message || "获取设备列表失败" });
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.show,
      (visible) => {
        if (!visible) {
          return;
        }
        keyword.value = "";
        draftId.value = props.selectedId;
        resetList();
        void loadPage();
      },
    );

    const onSearch = (): void => {
      resetList();
      void loadPage();
    };

    const handleConfirm = (): void => {
      const selected = selectedDeviceMap.value[draftId.value] ?? deviceList.value.find((item) => item.id === draftId.value);
      if (selected == null || selected.id === "") {
        showToast({ type: "fail", message: "请选择关联设备" });
        return;
      }
      emit("confirm", selected);
      emit("update:show", false);
    };

    return (): JSX.Element => (
      <Popup
        show={props.show}
        position="bottom"
        round
        style={{ height: "72vh" }}
        onUpdate:show={(value: boolean) => {
          emit("update:show", value);
        }}
      >
        <div class="fz-h5-picker-popup">
          <div class="fz-h5-picker-popup__head">
            <strong>选择关联设备</strong>
            <span>物联中心设备</span>
          </div>
          <Search v-model={keyword.value} placeholder="搜索设备名称、编号" shape="round" onSearch={onSearch} onClear={onSearch} />
          <div class="fz-h5-picker-popup__body">
            <List
              class="fz-h5-picker-popup__scroll"
              v-model:loading={loading.value}
              finished={finished.value}
              finishedText={deviceList.value.length ? "没有更多了" : ""}
              immediateCheck={false}
              onLoad={() => void loadPage()}
            >
              {deviceList.value.length === 0 && !loading.value ? (
                <Empty image-size={72} description="暂无可选设备" />
              ) : (
                <RadioGroup v-model={draftId.value}>
                  {deviceList.value.map((device) => (
                    <div
                      class="fz-h5-picker-item"
                      key={device.id}
                      onClick={() => {
                        draftId.value = device.id;
                      }}
                    >
                      <div class="fz-h5-picker-item__main">
                        <strong>{device.name || device.code || device.id}</strong>
                        <span>
                          {device.code ? `编号 ${device.code}` : ""}
                          {device.locationName ? ` · ${device.locationName}` : ""}
                        </span>
                      </div>
                      <Radio
                        name={device.id}
                        onClick={(event: Event) => {
                          event.stopPropagation();
                        }}
                      />
                    </div>
                  ))}
                </RadioGroup>
              )}
            </List>
          </div>
          <div class="fz-h5-picker-popup__foot">
            <span>{draftId.value === "" ? "未选择" : "已选 1 台"}</span>
            <div class="fz-h5-picker-popup__actions">
              <Button
                size="small"
                onClick={() => {
                  emit("update:show", false);
                }}
              >
                取消
              </Button>
              <Button size="small" type="primary" onClick={handleConfirm}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </Popup>
    );
  },
});

import { computed, defineComponent, nextTick, onMounted, reactive, ref, type PropType, watch } from "vue";

import { UserSelect } from "@ghcloud/cube-app-design";
import type { ColdStore, ColdStoreCamera, ColdStoreDevice, ColdStoreSavePayload } from "@ghcloud/cube-service-interface/cold-storage";
import type { Area } from "@ghcloud/cube-service-interface/metadata";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreDetail, saveColdStore } from "@ghcloud/cube-services-client/cold-storage.client";
import { listAllArea } from "@ghcloud/cube-services-client/metadata.client";
import { Button, DatePicker, Empty, Input, message, Select, Spin, Table, Tag, TreeSelect } from "@ghcloud/cube-ui";
import { DeviceModalTable } from "@ghcloud/generic-component/src/device-modal-table/device-modal-table";

import { formatDate } from "../../../shared/time";
import { deviceOnlineColor, deviceOnlineText } from "../../cold-storage-options";
import { useAppDeviceTag } from "../../composables/use-app-device-tag";
import { ColdStoreType, coldStoreTypeOptions, RefrigerationMethod, refrigerationMethodOptions, type EnumOption } from "@/constants";
import { APPLICATION_CODE } from "@/constants/env";

type DeviceModalRecord = {
  id?: string | number;
  code?: string;
  name?: string;
  deviceName?: string;
  thirdPartyId?: string;
  productInfo?: {
    name?: string;
    productCategory?: { code?: string; name?: string };
  };
  area?: { id?: string; name?: string; pathName?: string };
  areaName?: string;
  status?: { onlineState?: boolean; communicationTime?: string };
};

type DeviceModalTableExpose = { openModal: () => void };

type DeviceDraftOption = { id: string; name: string };

import "./index.less";

interface ColdStoreFormState {
  code: string;
  name: string;
  type: string;
  area: string;
  designTemp: string;
  method: string;
  mainDevice: string;
  insulation: string;
  building?: string;
  location: string;
  builtDate: string;
  builtTime?: string;
  responsible: string;
  responsibleId?: string;
  deviceIds: string[];
  deviceCodes: string[];
  cameraCodes: string[];
  cameraDeviceIds: string[];
}

type FormKey = keyof Pick<
  ColdStoreFormState,
  "code" | "name" | "type" | "area" | "designTemp" | "method" | "mainDevice" | "insulation" | "location" | "builtDate" | "responsible"
>;

const insulationOptions = ["聚氨酯板", "岩棉板", "挤塑板"];

const emptyForm = (): ColdStoreFormState => ({
  code: "",
  name: "",
  type: ColdStoreType.FIXED,
  area: "",
  designTemp: "",
  method: RefrigerationMethod.AMMONIA,
  mainDevice: "",
  insulation: "聚氨酯板",
  building: undefined,
  location: "",
  builtDate: "",
  builtTime: "",
  responsible: "",
  responsibleId: "",
  deviceIds: [],
  deviceCodes: [],
  cameraCodes: [],
  cameraDeviceIds: [],
});

const storeToFormState = (store: ColdStore): ColdStoreFormState => ({
  ...emptyForm(),
  code: store.code,
  name: store.name,
  type: store.type,
  area: store.area,
  designTemp: store.designTemp,
  method: store.method,
  mainDevice: store.mainDevice?.id ?? "",
  insulation: store.insulation,
  building: store.building == null ? undefined : String(store.building),
  location: store.location ?? "",
  builtDate: formatDate(store.builtTime, ""),
  builtTime: store.builtTime,
  responsible: store.responsibleName ?? "",
  responsibleId: store.responsibleId ?? "",
  deviceIds: store.devices.map((device) => device.id),
  deviceCodes: store.devices.map((device) => device.deviceCode).filter(Boolean),
  cameraCodes: store.cameras.map((camera) => camera.deviceCode).filter(Boolean),
  cameraDeviceIds: store.cameras.map((camera) => camera.id),
});

const toColdStoreSavePayload = (form: ColdStoreFormState): ColdStoreSavePayload => ({
  code: form.code,
  name: form.name,
  type: form.type,
  area: form.area,
  designTemp: form.designTemp,
  method: form.method,
  mainDevice: form.mainDevice,
  insulation: form.insulation,
  building: form.building,
  location: form.location,
  builtTime: form.builtDate ? `${form.builtDate} 00:00:00` : undefined,
  responsibleId: form.responsibleId || undefined,
  deviceIds: form.deviceIds,
  cameraDeviceIds: form.cameraDeviceIds,
});

const normalizeAreaTree = (value: unknown): Area[] => {
  if (Array.isArray(value)) {
    return value as Area[];
  }
  if (value && typeof value === "object") {
    const record = value as { records?: Area[]; data?: Area[] };
    return record.records ?? record.data ?? [];
  }
  return [];
};

const getSubmitErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const text = record.errorMessage ?? record.message;
    if (typeof text === "string" && text.trim()) {
      return text.trim();
    }
  }
  return "保存失败";
};

const getDeviceModalId = (device: DeviceModalRecord): string => String(device.id ?? device.code ?? "");

const getColdStoreDeviceKey = (device: ColdStoreDevice): string => String(device.id);

const getDeviceDisplayName = (device: ColdStoreDevice): string => {
  const code = device.deviceCode ?? "";
  const name = device.deviceName ?? "";
  if (code && name) {
    return `${code} · ${name}`;
  }
  return code || name;
};

const toDeviceDraft = (device: Pick<ColdStoreDevice, "id" | "deviceCode" | "deviceName">): DeviceDraftOption => ({
  id: String(device.id),
  name: device.deviceName || device.deviceCode || String(device.id),
});

const toColdStoreDeviceFromModal = (device: DeviceModalRecord): ColdStoreDevice => ({
  id: getDeviceModalId(device),
  deviceCode: device.code ?? "",
  deviceName: device.name ?? device.deviceName ?? "",
  productCategoryName: device.productInfo?.productCategory?.name ?? device.productInfo?.name ?? "",
  productCategoryCode: device.productInfo?.productCategory?.code ?? "",
  areaId: device.area?.id,
  areaName: device.area?.pathName || device.area?.name || device.areaName,
  deviceState: device.status?.onlineState,
  communicationTime: device.status?.communicationTime,
  thirdPartyId: device.thirdPartyId,
});

const toColdStoreCameraFromModal = (device: DeviceModalRecord): ColdStoreCamera => ({
  id: getDeviceModalId(device),
  deviceCode: device.code ?? getDeviceModalId(device),
  deviceName: device.name ?? device.deviceName ?? "",
  locationDes: device.area?.pathName || device.area?.name || "",
  areaId: device.area?.id,
  areaName: device.area?.pathName || device.area?.name,
  deviceState: device.status?.onlineState ?? true,
  communicationTime: device.status?.communicationTime,
  thirdPartyId: device.thirdPartyId,
});

export const ColdStorageForm = defineComponent({
  name: "ColdStorageForm",
  props: {
    editingId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  emits: ["success"],
  setup: (props, { emit, expose }) => {
    const { tagCode } = useAppDeviceTag();
    const loading = ref(false);
    const submitting = ref(false);
    const buildingTreeLoading = ref(false);
    const buildingTreeData = ref<Area[]>([]);
    const form = reactive<ColdStoreFormState>(emptyForm());
    const detail = ref<ColdStore | null>(null);
    const mainDeviceModalRef = ref<DeviceModalTableExpose | null>(null);
    const equipmentModalRef = ref<DeviceModalTableExpose | null>(null);
    const cameraModalRef = ref<DeviceModalTableExpose | null>(null);
    const mainDeviceDraft = ref<DeviceDraftOption[]>([]);
    const equipmentDraft = ref<DeviceDraftOption[]>([]);
    const cameraDraft = ref<DeviceDraftOption[]>([]);
    const mainDeviceRow = ref<ColdStoreDevice | null>(null);
    const associatedDeviceRows = ref<ColdStoreDevice[]>([]);
    const associatedCameraRows = ref<ColdStoreCamera[]>([]);
    let requestSeq = 0;

    const assignForm = (payload: ColdStoreFormState): void => {
      Object.assign(form, emptyForm(), payload);
    };

    const loadBuildingTreeData = async (): Promise<void> => {
      if (buildingTreeData.value.length > 0 || buildingTreeLoading.value) {
        return;
      }
      buildingTreeLoading.value = true;
      try {
        buildingTreeData.value = normalizeAreaTree(await useAuthRequest(() => listAllArea()));
      } catch {
        message.error("关联建筑数据加载失败");
      } finally {
        buildingTreeLoading.value = false;
      }
    };

    const resetDraft = (): void => {
      detail.value = null;
      assignForm(emptyForm());
      mainDeviceRow.value = null;
      associatedDeviceRows.value = [];
      associatedCameraRows.value = [];
      mainDeviceDraft.value = [];
      equipmentDraft.value = [];
      cameraDraft.value = [];
    };

    const selectedDevices = computed(() => associatedDeviceRows.value);

    const mainDeviceName = computed(() => {
      const device = mainDeviceRow.value;
      return device ? getDeviceDisplayName(device) : "";
    });

    const boundCameras = computed(() => associatedCameraRows.value);

    const loadDetail = async (): Promise<void> => {
      const seq = ++requestSeq;
      resetDraft();
      if (!props.editingId) {
        return;
      }
      loading.value = true;
      try {
        const storeDetail = await useAuthRequest(() => getColdStoreDetail(props.editingId as string));
        if (seq !== requestSeq) {
          return;
        }
        detail.value = storeDetail;
        assignForm(storeToFormState(storeDetail));
        associatedDeviceRows.value = [...storeDetail.devices];
        associatedCameraRows.value = [...storeDetail.cameras];
        if (storeDetail.mainDevice) {
          const matched = storeDetail.devices.find((device) => String(device.id) === String(storeDetail.mainDevice?.id));
          mainDeviceRow.value = matched ?? storeDetail.mainDevice;
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
        }
      }
    };

    const submit = async (): Promise<void> => {
      submitting.value = true;
      try {
        await useAuthRequest(() => saveColdStore(toColdStoreSavePayload(form), props.editingId));
        message.success(props.editingId == null ? "冷库创建成功" : "冷库编辑成功");
        emit("success");
      } catch (error) {
        message.error(getSubmitErrorMessage(error));
      } finally {
        submitting.value = false;
      }
    };

    expose({
      submit,
    });

    const syncDeviceCodes = (): void => {
      form.deviceCodes = associatedDeviceRows.value.map((device) => device.deviceCode).filter(Boolean);
    };

    const openMainDevicePicker = (): void => {
      mainDeviceDraft.value = mainDeviceRow.value ? [toDeviceDraft(mainDeviceRow.value)] : [];
      void nextTick(() => {
        mainDeviceModalRef.value?.openModal();
      });
    };

    const openEquipmentPicker = (): void => {
      equipmentDraft.value = associatedDeviceRows.value.map(toDeviceDraft);
      void nextTick(() => {
        equipmentModalRef.value?.openModal();
      });
    };

    const openCameraPicker = (): void => {
      cameraDraft.value = associatedCameraRows.value.map(toDeviceDraft);
      void nextTick(() => {
        cameraModalRef.value?.openModal();
      });
    };

    const handleMainDeviceSelect = (rows: DeviceModalRecord[]): void => {
      const device = rows[0] ? toColdStoreDeviceFromModal(rows[0]) : null;
      mainDeviceRow.value = device;
      form.mainDevice = device ? String(device.id) : "";
    };

    const handleEquipmentSelect = (rows: DeviceModalRecord[]): void => {
      const devices = rows.map(toColdStoreDeviceFromModal).filter((device) => device.id);
      associatedDeviceRows.value = devices;
      form.deviceIds = devices.map((device) => String(device.id));
      syncDeviceCodes();
    };

    const clearMainDevice = (): void => {
      mainDeviceRow.value = null;
      form.mainDevice = "";
      mainDeviceDraft.value = [];
    };

    const unlinkDevice = (deviceId: string): void => {
      associatedDeviceRows.value = associatedDeviceRows.value.filter((device) => String(device.id) !== String(deviceId));
      form.deviceIds = associatedDeviceRows.value.map((device) => String(device.id));
      syncDeviceCodes();
    };

    const handleCameraSelect = (rows: DeviceModalRecord[]): void => {
      const cameras = rows.map(toColdStoreCameraFromModal).filter((camera) => camera.id);
      associatedCameraRows.value = cameras;
      form.cameraDeviceIds = cameras.map((camera) => String(camera.id));
      form.cameraCodes = cameras.map((camera) => camera.deviceCode).filter(Boolean);
    };

    const removeCamera = (identifier: string): void => {
      associatedCameraRows.value = associatedCameraRows.value.filter(
        (camera) => String(camera.id) !== identifier && camera.deviceCode !== identifier,
      );
      form.cameraDeviceIds = associatedCameraRows.value.map((camera) => String(camera.id));
      form.cameraCodes = associatedCameraRows.value.map((camera) => camera.deviceCode).filter(Boolean);
    };

    watch(
      () => props.editingId,
      () => {
        void loadDetail();
      },
    );

    onMounted(() => {
      void loadBuildingTreeData();
      void loadDetail();
    });

    const renderLabel = (label: string, required = true): JSX.Element => (
      <span class="storage-form-label">
        {required && <i>*</i>}
        {label}
      </span>
    );

    const renderInput = (label: string, key: FormKey, placeholder: string, required = true): JSX.Element => (
      <label class="storage-form-item">
        {renderLabel(label, required)}
        <Input
          value={String(form[key] ?? "")}
          placeholder={placeholder}
          showCount={false}
          onUpdate:value={(value: string) => {
            form[key] = value;
          }}
        />
      </label>
    );

    const renderMainDevicePicker = (): JSX.Element => (
      <label class="storage-form-item">
        {renderLabel("关联主设备")}
        <div class="storage-main-device-picker">
          <Input
            class="storage-main-device-picker__input"
            value={mainDeviceName.value || String(form.mainDevice || "")}
            placeholder="请选择主监控设备"
            disabled
            showCount={false}
          />
          <Button onClick={openMainDevicePicker}>选择</Button>
          {form.mainDevice ? <Button onClick={clearMainDevice}>移除</Button> : null}
        </div>
      </label>
    );

    const renderDate = (label: string, key: FormKey, required = false): JSX.Element => (
      <label class="storage-form-item">
        {renderLabel(label, required)}
        <DatePicker
          valueFormat="YYYY-MM-DD"
          value={String(form[key] ?? "")}
          onUpdate:value={(value: string) => {
            form[key] = value ?? "";
          }}
          style={{ width: "100%" }}
        />
      </label>
    );

    const renderUserSelect = (label: string, key: FormKey, required = true): JSX.Element => (
      <label class="storage-form-item">
        {renderLabel(label, required)}
        <UserSelect
          value={String(form.responsibleId ?? "")}
          allowClear
          onUpdate:value={(value?: string) => {
            form.responsibleId = value ?? "";
            form[key] = value ?? "";
          }}
        />
      </label>
    );

    const renderSelect = (
      label: string,
      key: FormKey,
      options: Array<string | EnumOption>,
      placeholder = "请选择",
      required = true,
    ): JSX.Element => {
      const selectOptions = options.map((item) => (typeof item === "string" ? { label: item, value: item } : item));
      return (
        <label class="storage-form-item">
          {renderLabel(label, required)}
          <Select
            value={String(form[key] ?? "")}
            placeholder={placeholder}
            options={selectOptions}
            onUpdate:value={(value?: string) => {
              form[key] = value ?? "";
            }}
          />
        </label>
      );
    };

    const renderBuildingSelect = (): JSX.Element => (
      <label class="storage-form-item">
        {renderLabel("关联建筑", false)}
        <TreeSelect
          value={form.building}
          treeData={buildingTreeData.value}
          fieldNames={{ label: "name", value: "id", children: "children" }}
          placeholder="请选择关联建筑"
          allowClear
          loading={buildingTreeLoading.value}
          style={{ width: "100%" }}
          onUpdate:value={(value?: string | number) => {
            form.building = value == null ? undefined : String(value);
          }}
        />
      </label>
    );

    const selectedDeviceColumns = [
      { title: "设备编码", dataIndex: "deviceCode", align: "center", width: 105 },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        align: "center",
        width: 150,
        customRender: ({ record }: { record: ColdStoreDevice }) => <span class="strong">{record.deviceName}</span>,
      },
      {
        title: "品类",
        dataIndex: "productCategoryName",
        align: "center",
        width: 120,
        customRender: ({ record }: { record: ColdStoreDevice }) => record.productCategoryName || "--",
      },
      {
        title: "品牌/型号",
        align: "center",
        width: 140,
        customRender: ({ record }: { record: ColdStoreDevice }) => record.productCategoryName || "--",
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
        align: "center",
        width: 96,
        customRender: ({ record }: { record: ColdStoreDevice }) => record.areaName || "--",
      },
      {
        title: "状态",
        align: "center",
        width: 72,
        customRender: ({ record }: { record: ColdStoreDevice }) => (
          <Tag color={deviceOnlineColor(record.deviceState, record.deviceStateCode)}>
            {deviceOnlineText(record.deviceState, record.deviceStateCode)}
          </Tag>
        ),
      },
      {
        title: "操作",
        align: "center",
        width: 72,
        customRender: ({ record }: { record: ColdStoreDevice }) => (
          <Button type="link" size="small" onClick={() => unlinkDevice(record.id)}>
            移除
          </Button>
        ),
      },
    ];

    const boundCameraColumns = [
      { title: "摄像头编号", dataIndex: "deviceCode", align: "center" },
      { title: "摄像头名称", dataIndex: "deviceName", align: "center" },
      {
        title: "安装位置",
        align: "center",
        customRender: ({ record }: { record: ColdStoreCamera }) => record.locationDes || record.areaName || "--",
      },
      {
        title: "状态",
        align: "center",
        customRender: ({ record }: { record: ColdStoreCamera }) => (
          <Tag color={deviceOnlineColor(record.deviceState, record.deviceStateCode)}>
            {deviceOnlineText(record.deviceState, record.deviceStateCode)}
          </Tag>
        ),
      },
      {
        title: "操作",
        align: "center",
        customRender: ({ record }: { record: ColdStoreCamera }) => (
          <Button type="link" size="small" onClick={() => removeCamera(String(record.id))}>
            移除
          </Button>
        ),
      },
    ];

    const renderFormContent = (): JSX.Element => (
      <Spin spinning={loading.value}>
        <div class="cold-storage-form">
          <section class="storage-form-section storage-form-section--basic">
            <div class="storage-section-title">
              <h3>基本信息</h3>
            </div>
            <div class="storage-form-grid">
              {renderInput("冷库编号", "code", "如 CK-004")}
              {renderInput("冷库名称", "name", "如 D区1号冷库")}
              {renderSelect("冷库形态", "type", coldStoreTypeOptions, "请选择冷库形态")}
              {renderInput("面积（㎡）", "area", "如 2000")}
              {renderInput("设计温度（℃）", "designTemp", "如 -18")}
              {renderSelect("制冷方式", "method", refrigerationMethodOptions, "请选择制冷方式")}
              {renderMainDevicePicker()}
              {renderSelect("保温材料", "insulation", insulationOptions, "聚氨酯板")}
              {renderBuildingSelect()}
              {renderUserSelect("责任人", "responsible")}
              {renderInput("地址/位置", "location", "如 A区101号")}
              {renderDate("建成时间", "builtDate")}
            </div>
          </section>

          <section class="storage-form-section storage-form-section--devices">
            <div class="storage-section-title">
              <h3>添加冷库内设备进行综合监控管理</h3>
              <Button type="primary" size="small" onClick={openEquipmentPicker}>
                关联设备
              </Button>
            </div>
            <Table
              class="storage-selected-device-table"
              columns={selectedDeviceColumns}
              dataSource={selectedDevices.value}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: <Empty description="暂未关联设备" /> }}
            />
            <div class="storage-tip">点击「关联设备」从设备关联数据中选择设备。传感器设备随主设备自动接入，无需重复关联。</div>
          </section>

          <section class="storage-form-section storage-form-section--cameras">
            <div class="storage-section-title">
              <h3>绑定监控摄像头</h3>
              <Button type="primary" size="small" onClick={openCameraPicker}>
                绑定摄像头
              </Button>
            </div>
            <Table
              columns={boundCameraColumns}
              dataSource={boundCameras.value}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: <Empty description="暂未绑定摄像头" /> }}
            />
            <div class="storage-camera-footer">
              <span>点击「绑定摄像头」从设备关联数据中选择摄像头设备。</span>
            </div>
          </section>
        </div>
      </Spin>
    );

    return (): JSX.Element => (
      <>
        {renderFormContent()}
        <DeviceModalTable
          ref={mainDeviceModalRef}
          title="选择主设备"
          value={mainDeviceDraft.value}
          searchParams={{}}
          multiple={false}
          applicationCode={APPLICATION_CODE}
          tagCodes={[tagCode]}
          onOk={(rows: DeviceModalRecord[]) => {
            handleMainDeviceSelect(rows);
          }}
        />
        <DeviceModalTable
          ref={equipmentModalRef}
          title="关联设备"
          value={equipmentDraft.value}
          searchParams={{}}
          multiple
          applicationCode={APPLICATION_CODE}
          tagCodes={[tagCode]}
          onOk={(rows: DeviceModalRecord[]) => {
            handleEquipmentSelect(rows);
          }}
        />
        <DeviceModalTable
          ref={cameraModalRef}
          title="绑定监控摄像头"
          value={cameraDraft.value}
          searchParams={{}}
          multiple
          applicationCode={APPLICATION_CODE}
          tagCodes={[tagCode]}
          onOk={(rows: DeviceModalRecord[]) => {
            handleCameraSelect(rows);
          }}
        />
      </>
    );
  },
});

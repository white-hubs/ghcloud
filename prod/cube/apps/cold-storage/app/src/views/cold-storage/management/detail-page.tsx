import { computed, defineComponent, onMounted, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { CubePlayer } from "@ghcloud/cube-player";
import type { ColdStore, ColdStoreCamera, ColdStoreDevice } from "@ghcloud/cube-service-interface/cold-storage";
import type { Area } from "@ghcloud/cube-service-interface/metadata";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreDetail } from "@ghcloud/cube-services-client/cold-storage.client";
import { listAllArea } from "@ghcloud/cube-services-client/metadata.client";
import { Button, Empty, Spin, Table, Tag } from "@ghcloud/cube-ui";

import { goBack } from "../shared/page";
import { formatDate } from "../shared/time";
import { deviceOnlineColor, deviceOnlineText } from "./cold-storage-options";
import { coldStoreTypeOptions, enumLabelOf, refrigerationMethodOptions } from "@/constants";

import "./detail-page.less";

const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

const formatArea = (value?: string): string => {
  const area = displayText(value);
  return area === "--" || area.includes("㎡") || area.toLowerCase().includes("m") ? area : `${area} ㎡`;
};

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

const areaIdKeys = (value?: string | null): string[] => {
  if (value == null || value === "") {
    return [];
  }
  return [value];
};

const appendAreaNameMap = (areas: Area[], map: Map<string, string>, parentPath = ""): void => {
  areas.forEach((area) => {
    const name = area.name || area.aliasName || area.code || "";
    const pathName = [parentPath, name].filter(Boolean).join("/");
    areaIdKeys(area.id).forEach((key) => map.set(key, pathName || key));
    appendAreaNameMap(area.children ?? [], map, pathName);
  });
};

const deviceDisplayName = (device?: ColdStoreDevice): string => {
  if (!device) {
    return "--";
  }
  const code = device.deviceCode ?? "";
  const name = device.deviceName ?? "";
  if (code && name) {
    return `${code} · ${name}`;
  }
  return code || name || "--";
};

const deviceColumns = [
  {
    title: "设备编码",
    dataIndex: "deviceCode",
    align: "center",
    customRender: ({ record }: { record: ColdStoreDevice }) => displayText(record.deviceCode),
  },
  {
    title: "设备名称",
    dataIndex: "deviceName",
    align: "center",
    customRender: ({ record }: { record: ColdStoreDevice }) => displayText(record.deviceName),
  },
  {
    title: "品类",
    align: "center",
    customRender: ({ record }: { record: ColdStoreDevice }) => <Tag color="blue">{displayText(record.productCategoryName)}</Tag>,
  },
  { title: "品牌", align: "center", customRender: () => "--" },
  { title: "安装日期", align: "center", customRender: ({ record }: { record: ColdStoreDevice }) => formatDate(record.createTime) },
  {
    title: "状态",
    align: "center",
    customRender: ({ record }: { record: ColdStoreDevice }) => (
      <Tag color={deviceOnlineColor(record.deviceState, record.deviceStateCode)}>
        {deviceOnlineText(record.deviceState, record.deviceStateCode)}
      </Tag>
    ),
  },
];

export const ColdStorageManagementDetailPage = defineComponent({
  name: "ColdStorageManagementDetailPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = shallowRef(false);
    const detail = ref<ColdStore | null>(null);
    const buildingTreeData = ref<Area[]>([]);
    const activeCameraId = ref("");
    const storeId = computed(() => {
      const value = route.query.id;
      return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
    });
    const activeCamera = computed(() => detail.value?.cameras.find((camera) => String(camera.id) === activeCameraId.value));
    const buildingNameMap = computed(() => {
      const map = new Map<string, string>();
      appendAreaNameMap(buildingTreeData.value, map);
      return map;
    });
    const formatBuilding = (building?: string): string => {
      if (!building) {
        return "--";
      }
      for (const key of areaIdKeys(building)) {
        const name = buildingNameMap.value.get(key);
        if (name) {
          return name;
        }
      }
      return displayText(building);
    };

    const loadDetail = async (): Promise<void> => {
      if (!storeId.value) {
        detail.value = null;
        activeCameraId.value = "";
        return;
      }
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getColdStoreDetail(storeId.value));
        detail.value = data;
        activeCameraId.value = data.cameras[0]?.id ? String(data.cameras[0].id) : "";
      } finally {
        loading.value = false;
      }
    };

    const loadBuildingTreeData = async (): Promise<void> => {
      try {
        buildingTreeData.value = normalizeAreaTree(await useAuthRequest(() => listAllArea()));
      } catch {
        buildingTreeData.value = [];
      }
    };

    const back = (): void => {
      goBack(router, { name: "cold-storage-management" });
    };

    const baseFields = computed<Array<[string, JSX.Element | string]>>(() => {
      const current = detail.value;
      if (!current) {
        return [];
      }
      return [
        ["冷库编号", current.code],
        ["冷库名称", current.name],
        ["冷库形态", <Tag color="blue">{enumLabelOf(coldStoreTypeOptions, current.type)}</Tag>],
        ["面积", formatArea(current.area)],
        ["设计温度", current.designTemp],
        ["制冷方式", enumLabelOf(refrigerationMethodOptions, current.method)],
        ["关联主设备", deviceDisplayName(current.mainDevice)],
        ["保温材料", current.insulation],
        ["关联建筑", formatBuilding(current.building)],
        ["地址/位置", displayText(current.location)],
        ["建成时间", formatDate(current.builtTime)],
        ["责任人", displayText(current.responsibleName)],
      ];
    });

    onMounted(() => {
      void loadBuildingTreeData();
      void loadDetail();
    });

    watch(storeId, () => {
      void loadDetail();
    });

    const renderCamera = (camera: ColdStoreCamera): JSX.Element => {
      const cameraId = String(camera.id ?? "");
      const isActive = cameraId !== "" && cameraId === activeCameraId.value;
      return (
        <button
          class={["cold-store-camera-card", isActive ? "is-active" : "", camera.deviceState === false ? "is-offline" : ""]
            .filter(Boolean)
            .join(" ")}
          key={camera.id}
          type="button"
          onClick={() => {
            activeCameraId.value = cameraId;
          }}
        >
          <span class="cold-store-camera-card__live">
            <i />
            {camera.deviceState === false ? "OFFLINE" : "LIVE"}
          </span>
          <div class="cold-store-camera-card__icon">CAM</div>
          <b>{displayText(camera.deviceCode)}</b>
          <span>{displayText(camera.deviceName)}</span>
          <small>{camera.locationDes || camera.areaName || "--"}</small>
        </button>
      );
    };

    const content = (): JSX.Element => (
      <div class="cold-store-detail-page">
        <Spin spinning={loading.value}>
          {detail.value ? (
            <div class="cold-store-detail-panel">
              <section class="cold-store-detail-section">
                <h3>基本信息</h3>
                <div class="cold-store-detail-grid">
                  {baseFields.value.map(([label, value]) => (
                    <div class="cold-store-detail-field" key={label}>
                      <span>{label}</span>
                      <b>{value || "--"}</b>
                    </div>
                  ))}
                </div>
              </section>

              <section class="cold-store-detail-section">
                <h3>关联设备（来自物联中心）</h3>
                <Table
                  columns={deviceColumns}
                  dataSource={detail.value.devices}
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: <Empty description="暂未关联设备" /> }}
                />
              </section>

              <section class="cold-store-detail-section">
                <h3>绑定摄像头</h3>
                {detail.value.cameras.length ? (
                  <div class="cold-store-monitor">
                    <div class="cold-store-camera-grid">{detail.value.cameras.map(renderCamera)}</div>
                    <div class="cold-store-player-panel">
                      <div class="cold-store-player-panel__title">
                        <span>实时监控</span>
                        <b>{displayText(activeCamera.value?.deviceName || activeCamera.value?.deviceCode)}</b>
                      </div>
                      <div class="cold-store-player-panel__body">
                        {activeCameraId.value ? (
                          <CubePlayer
                            key={activeCameraId.value}
                            deviceId={activeCameraId.value}
                            h5sControl={true}
                            isShowDeviceDetails={false}
                          />
                        ) : (
                          <Empty description="请选择摄像头" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Empty description="暂未绑定摄像头" />
                )}
              </section>
            </div>
          ) : (
            <Empty description="未找到冷库详情" />
          )}
        </Spin>
      </div>
    );

    return () => (
      <CubeLayout
        title={`冷库详情${detail.value?.code ? ` · ${detail.value.code}` : ""}`}
        showFooter
        v-slots={{
          "layout-content": content,
          "footer-page": () => <Button onClick={back}>返回</Button>,
        }}
      />
    );
  },
});

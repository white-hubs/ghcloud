import { Modal, Popconfirm } from "ant-design-vue";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  WarehouseLocationCardConfigDetailVO,
  WarehouseLocationCardEnvironmentMonitorVO,
  WarehouseLocationCardQualityInspectionVO,
} from "@ghcloud/cube-granary-management-service";
import { Button, Input, message, Table } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import {
  buildProfilePayload,
  buildQualityPayload,
  copyProfileToForm,
  copyQualityToForm,
  emptyProfileForm,
  emptyQualityForm,
  formatDateTime,
  ProfileDateField,
  ProfileField,
  ProfileRangeField,
  TimestampDateField,
  type ProfileFormState,
  type QualityFormState,
  routeQueryString,
  text,
} from "./shared";
import { cubeGranaryManagementService } from "@/api/service";

import "./warehouse-location-card-config.less";

type DetailTab = "profile" | "logs";
type PositionProfileWithCapacity = NonNullable<WarehouseLocationCardConfigDetailVO["profile"]> & {
  materialVolume: number | null;
  remainingVolume: number | null;
  weight: number | null;
};

export const WarehouseLocationCardConfigDetail = defineComponent({
  name: "WarehouseLocationCardConfigDetail",
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const warehouseId = computed(() => Number(routeQueryString(route.query.warehouseId)));
    const activeTab = ref<DetailTab>("profile");
    const loading = ref(false);
    const saving = ref(false);
    const detail = ref<WarehouseLocationCardConfigDetailVO | null>(null);
    const profileForm = reactive<ProfileFormState>(emptyProfileForm());
    const editableBasicProfile = ref(false);
    const editableStorageProfile = ref(false);
    const qualityModalOpen = ref(false);
    const qualitySubmitting = ref(false);
    const qualityForm = reactive<QualityFormState>(emptyQualityForm());

    const headerInfo = computed(() => ({
      warehouseName: routeQueryString(route.query.warehouseName),
      categoryName: routeQueryString(route.query.categoryName),
      qualityGrade: routeQueryString(route.query.qualityGrade),
      maxHeight: routeQueryString(route.query.maxHeight),
      warehouseVolume: routeQueryString(route.query.warehouseVolume),
    }));

    const env = computed<WarehouseLocationCardEnvironmentMonitorVO | null>(() => detail.value?.environmentMonitor ?? null);
    const profile = computed<PositionProfileWithCapacity | null>(() => detail.value?.profile as PositionProfileWithCapacity | null);
    const qualityRows = computed(() => detail.value?.qualityInspections ?? []);

    const loadDetail = async (): Promise<void> => {
      const wid = warehouseId.value;
      if (!Number.isFinite(wid)) {
        message.error("缺少有效的粮仓 ID");
        return;
      }
      loading.value = true;
      try {
        const config = await cubeGranaryManagementService.getLocationCardConfigDetail(wid);
        detail.value = config;
        copyProfileToForm(profileForm, config?.profile);
      } finally {
        loading.value = false;
      }
    };

    const saveProfile = async (): Promise<void> => {
      const wid = warehouseId.value;
      if (!Number.isFinite(wid)) {
        return;
      }
      const temperatureRangeMin = Number(profileForm.temperatureRangeMin);
      const temperatureRangeMax = Number(profileForm.temperatureRangeMax);
      if (
        profileForm.temperatureRangeMin.trim() === "" ||
        profileForm.temperatureRangeMax.trim() === "" ||
        !Number.isFinite(temperatureRangeMin) ||
        !Number.isFinite(temperatureRangeMax) ||
        temperatureRangeMin > temperatureRangeMax
      ) {
        message.warning("请输入有效的温度分级区间，且下限不能高于上限");
        return;
      }
      saving.value = true;
      try {
        const ok = await cubeGranaryManagementService.saveLocationCardPositionProfile(buildProfilePayload(wid, profileForm));
        if (ok) {
          message.success("仓位档案已保存");
          editableBasicProfile.value = false;
          editableStorageProfile.value = false;
          await loadDetail();
        }
      } finally {
        saving.value = false;
      }
    };

    const cancelProfileEdit = (section: "basic" | "storage"): void => {
      copyProfileToForm(profileForm, detail.value?.profile);
      if (section === "basic") {
        editableBasicProfile.value = false;
      } else {
        editableStorageProfile.value = false;
      }
    };

    const renderProfileActions = (editable: boolean, onEdit: () => void, onCancel: () => void): JSX.Element =>
      editable ? (
        <span class="location-card-config-actions">
          <Button size="small" onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" size="small" loading={saving.value} onClick={() => void saveProfile()}>
            保存
          </Button>
        </span>
      ) : (
        <Button type="link" size="small" onClick={onEdit}>
          编辑
        </Button>
      );

    const openQualityModal = (record?: WarehouseLocationCardQualityInspectionVO): void => {
      copyQualityToForm(qualityForm, record);
      qualityModalOpen.value = true;
    };

    const saveQuality = async (): Promise<void> => {
      const wid = warehouseId.value;
      if (!Number.isFinite(wid)) {
        return;
      }
      const inspectionTime = qualityForm.inspectionTime;
      if (inspectionTime == null) {
        message.warning("请输入检测时间");
        return;
      }
      qualitySubmitting.value = true;
      try {
        const payload = buildQualityPayload(wid, { ...qualityForm, inspectionTime });
        const ok =
          qualityForm.id == null
            ? await cubeGranaryManagementService.createLocationCardQualityInspection(payload)
            : await cubeGranaryManagementService.updateLocationCardQualityInspection(payload);
        if (ok) {
          message.success("检测记录已保存");
          qualityModalOpen.value = false;
          await loadDetail();
        }
      } finally {
        qualitySubmitting.value = false;
      }
    };

    const deleteQuality = async (id: number | string): Promise<void> => {
      const ok = await cubeGranaryManagementService.deleteLocationCardQualityInspection(id);
      if (ok) {
        message.success("检测记录已删除");
        await loadDetail();
      }
    };

    const goLogs = (): void => {
      activeTab.value = "logs";
      void router.push({
        path: "/warehouse-location-card-config/operation-records",
        query: {
          warehouseId: String(warehouseId.value),
          warehouseName: headerInfo.value.warehouseName,
          categoryName: headerInfo.value.categoryName,
          qualityGrade: headerInfo.value.qualityGrade,
          maxHeight: headerInfo.value.maxHeight,
          warehouseVolume: headerInfo.value.warehouseVolume,
        },
      });
    };

    const goList = (): void => {
      void router.push({ path: "/warehouse-location-card-config" });
    };

    const qualityColumns = [
      { title: "检测时间", dataIndex: "inspectionTime", customRender: ({ text: t }: { text: string | number }) => formatDateTime(t) },
      { title: "检测人", dataIndex: "inspector" },
      { title: "水分(%)", dataIndex: "moisture" },
      { title: "杂质(%)", dataIndex: "impurity" },
      { title: "色泽气味", dataIndex: "colorSmell" },
      { title: "出糙率(%)", dataIndex: "roughness" },
      { title: "互混率(%)", dataIndex: "mixedRate" },
      { title: "整精米率(%)", dataIndex: "headRiceRate" },
      { title: "谷外糙米(%)", dataIndex: "outOfPaddyBrownRiceRate" },
      { title: "黄粒米(%)", dataIndex: "yellowRiceRate" },
      { title: "品尝分值", dataIndex: "tasteScore" },
      { title: "脂肪酸(mgKOH/100g)", dataIndex: "fattyAcid" },
      { title: "镉(mg/kg)", dataIndex: "cadmium" },
      { title: "黄曲霉素B1(μg/kg)", dataIndex: "aflatoxinB1" },
      { title: "铅(mg/kg)", dataIndex: "lead" },
      { title: "汞(mg/kg)", dataIndex: "mercury" },
      { title: "无机砷(mg/kg)", dataIndex: "inorganicArsenic" },
      {
        title: "操作",
        dataIndex: "action",
        width: 130,
        customRender: ({ record }: { record: WarehouseLocationCardQualityInspectionVO }) => (
          <span class="location-card-config-actions">
            <Button type="link" size="small" onClick={() => openQualityModal(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该检测记录？" onConfirm={() => void deleteQuality(record.id)}>
              <Button type="link" size="small">
                删除
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ];

    onMounted(() => void loadDetail());

    return (): JSX.Element => (
      <div class="location-card-config-root">
        <CubeLayout
          title={pageTitle ?? "货位卡配置详情"}
          v-slots={{
            "layout-header": (): JSX.Element => (
              <div>
                <Button onClick={goList}>返回列表</Button>
              </div>
            ),
            "layout-content": () => (
              <div class="location-card-config-detail">
                <div class="location-card-config-page-bar">
                  <div class="location-card-config-tabs">
                    <button
                      class={activeTab.value === "profile" ? "is-active" : ""}
                      onClick={() => {
                        activeTab.value = "profile";
                      }}
                    >
                      基础档案
                    </button>
                    <button onClick={goLogs}>操作记录</button>
                  </div>
                </div>
                <section class="location-card-config-section">
                  <header>
                    <h3>仓位基本信息</h3>
                    {renderProfileActions(
                      editableBasicProfile.value,
                      () => {
                        editableBasicProfile.value = true;
                      },
                      () => cancelProfileEdit("basic"),
                    )}
                  </header>
                  <div class="location-card-config-form-grid">
                    <ProfileField label="仓号" value={profileForm.positionNo} editable={false} changeValue={() => {}} />
                    <ProfileField
                      label="货位编号"
                      value={profileForm.positionCode}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.positionCode = v;
                      }}
                    />
                    <ProfileField
                      label="平房仓号"
                      value={profileForm.flatWarehouseNo}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.flatWarehouseNo = v;
                      }}
                    />
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">核定仓容 (m³)</span>
                      <Input value={headerInfo.value.warehouseVolume} disabled />
                    </label>
                    <ProfileField
                      label="长 (m)"
                      value={profileForm.length}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.length = v;
                      }}
                    />
                    <ProfileField
                      label="宽 (m)"
                      value={profileForm.width}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.width = v;
                      }}
                    />
                    <ProfileField
                      label="安全高度 (m)"
                      value={profileForm.height}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.height = v;
                      }}
                    />
                    <ProfileRangeField
                      label="温度分级区间 (℃)"
                      minValue={profileForm.temperatureRangeMin}
                      maxValue={profileForm.temperatureRangeMax}
                      editable={editableBasicProfile.value}
                      changeMinValue={(v) => {
                        profileForm.temperatureRangeMin = v;
                      }}
                      changeMaxValue={(v) => {
                        profileForm.temperatureRangeMax = v;
                      }}
                    />
                    <ProfileField
                      label="保管员"
                      value={profileForm.keeper}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.keeper = v;
                      }}
                    />
                    <ProfileDateField
                      label="填卡日期"
                      value={profileForm.filingDate}
                      editable={editableBasicProfile.value}
                      showTime={false}
                      changeValue={(v) => {
                        profileForm.filingDate = v;
                      }}
                    />
                    <ProfileField
                      label="授权单位"
                      value={profileForm.authorizedUnit}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.authorizedUnit = v;
                      }}
                    />
                    <ProfileField
                      label="储存库点"
                      value={profileForm.storageSite}
                      editable={editableBasicProfile.value}
                      changeValue={(v) => {
                        profileForm.storageSite = v;
                      }}
                    />
                  </div>
                </section>

                <section class="location-card-config-section">
                  <header>
                    <h3>储量监测 & 质量指标</h3>
                    {renderProfileActions(
                      editableStorageProfile.value,
                      () => {
                        editableStorageProfile.value = true;
                      },
                      () => cancelProfileEdit("storage"),
                    )}
                  </header>
                  <div class="location-card-config-form-grid">
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">储存品种</span>
                      <Input value={headerInfo.value.categoryName} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">已用体积 (m³)</span>
                      <Input value={text(profile.value?.materialVolume)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">剩余体积 (m³)</span>
                      <Input value={text(profile.value?.remainingVolume)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">储存重量 (吨)</span>
                      <Input value={text(profile.value?.weight)} disabled />
                    </label>
                    <ProfileField
                      label="数字粮体积 (m³)"
                      value={profileForm.digitalGrainVolume}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.digitalGrainVolume = v;
                      }}
                    />
                    <ProfileField
                      label="扣除体积 (m³)"
                      value={profileForm.deductedVolume}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.deductedVolume = v;
                      }}
                    />
                    <ProfileField
                      label="包存量包数"
                      value={profileForm.storageBagCount}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.storageBagCount = v;
                      }}
                    />
                    <ProfileField
                      label="平均包重"
                      value={profileForm.averageBagWeight}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.averageBagWeight = v;
                      }}
                    />
                    <ProfileField
                      label="产地"
                      value={profileForm.originPlace}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.originPlace = v;
                      }}
                    />
                    <ProfileField
                      label="收获年度"
                      value={profileForm.harvestYear}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.harvestYear = v;
                      }}
                    />
                    <ProfileDateField
                      label="入仓时间"
                      value={profileForm.inboundTime}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.inboundTime = v;
                      }}
                    />
                    <ProfileField
                      label="储存性质"
                      value={profileForm.storageNature}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.storageNature = v;
                      }}
                    />
                    <ProfileField
                      label="保管方式"
                      value={profileForm.storageMode}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.storageMode = v;
                      }}
                    />
                    <ProfileField
                      label="恒温率指标"
                      value={profileForm.constantTemperatureRate}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.constantTemperatureRate = v;
                      }}
                    />
                    <ProfileField
                      label="容重/粗糙率"
                      value={profileForm.bulkDensityOrRoughness}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.bulkDensityOrRoughness = v;
                      }}
                    />
                    <ProfileField
                      label="折合水分"
                      value={profileForm.convertedMoisture}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.convertedMoisture = v;
                      }}
                    />
                    <ProfileField
                      label="整精米粒/不完善粒"
                      value={profileForm.wholeOrImperfectGrain}
                      editable={editableStorageProfile.value}
                      changeValue={(v) => {
                        profileForm.wholeOrImperfectGrain = v;
                      }}
                    />
                  </div>
                </section>

                <section class="location-card-config-section">
                  <header>
                    <h3>环境 & 气体监测数据（设备获取，不支持修改）</h3>
                  </header>
                  <div class="location-card-config-form-grid">
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">最高温度 (℃)</span>
                      <Input value={text(env.value?.maxTemperature)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">最低温度 (℃)</span>
                      <Input value={text(env.value?.minTemperature)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">平均温度 (℃)</span>
                      <Input value={text(env.value?.avgTemperature)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">二氧化碳 CO₂ (ppm)</span>
                      <Input value={text(env.value?.co2Ppm)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">氧气 O₂ (%)</span>
                      <Input value={text(env.value?.o2Percent)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">磷化氢 PH₃ (%VOL)</span>
                      <Input value={text(env.value?.ph3Ppm)} disabled />
                    </label>
                    <label class="location-card-config-field">
                      <span class="location-card-config-field-label">湿度 RH (%)</span>
                      <Input value={text(env.value?.humidity)} disabled />
                    </label>
                  </div>
                </section>

                <section class="location-card-config-section">
                  <header>
                    <h3>质量检测记录</h3>
                    <Button type="primary" size="small" onClick={() => openQualityModal()}>
                      新增检测记录
                    </Button>
                  </header>
                  <Table
                    rowKey="id"
                    columns={qualityColumns}
                    dataSource={qualityRows.value}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                  />
                </section>

                <Modal
                  title={qualityForm.id == null ? "新增检测记录" : "编辑检测记录"}
                  open={qualityModalOpen.value}
                  width={560}
                  onCancel={() => {
                    qualityModalOpen.value = false;
                  }}
                  v-slots={{
                    footer: () => (
                      <div class="location-card-config-modal-footer">
                        <Button
                          onClick={() => {
                            qualityModalOpen.value = false;
                          }}
                        >
                          取消
                        </Button>
                        <Button type="primary" loading={qualitySubmitting.value} onClick={() => void saveQuality()}>
                          保存
                        </Button>
                      </div>
                    ),
                  }}
                >
                  <div class="location-card-config-quality-form">
                    <TimestampDateField
                      label="检测时间"
                      required
                      value={qualityForm.inspectionTime}
                      editable
                      changeValue={(v) => {
                        qualityForm.inspectionTime = v;
                      }}
                    />
                    <ProfileField
                      label="检测人"
                      value={qualityForm.inspector}
                      editable
                      changeValue={(v) => {
                        qualityForm.inspector = v;
                      }}
                    />
                    <ProfileField
                      label="水分(%)"
                      value={qualityForm.moisture}
                      editable
                      changeValue={(v) => {
                        qualityForm.moisture = v;
                      }}
                    />
                    <ProfileField
                      label="杂质(%)"
                      value={qualityForm.impurity}
                      editable
                      changeValue={(v) => {
                        qualityForm.impurity = v;
                      }}
                    />
                    <ProfileField
                      label="色泽气味"
                      value={qualityForm.colorSmell}
                      editable
                      changeValue={(v) => {
                        qualityForm.colorSmell = v;
                      }}
                    />
                    <ProfileField
                      label="出糙率(%)"
                      value={qualityForm.roughness}
                      editable
                      changeValue={(v) => {
                        qualityForm.roughness = v;
                      }}
                    />
                    <ProfileField
                      label="互混率(%)"
                      value={qualityForm.mixedRate}
                      editable
                      changeValue={(v) => {
                        qualityForm.mixedRate = v;
                      }}
                    />
                    <ProfileField
                      label="整精米率(%)"
                      value={qualityForm.headRiceRate}
                      editable
                      changeValue={(v) => {
                        qualityForm.headRiceRate = v;
                      }}
                    />
                    <ProfileField
                      label="谷外糙米(%)"
                      value={qualityForm.outOfPaddyBrownRiceRate}
                      editable
                      changeValue={(v) => {
                        qualityForm.outOfPaddyBrownRiceRate = v;
                      }}
                    />
                    <ProfileField
                      label="黄粒米(%)"
                      value={qualityForm.yellowRiceRate}
                      editable
                      changeValue={(v) => {
                        qualityForm.yellowRiceRate = v;
                      }}
                    />
                    <ProfileField
                      label="品尝分值"
                      value={qualityForm.tasteScore}
                      editable
                      changeValue={(v) => {
                        qualityForm.tasteScore = v;
                      }}
                    />
                    <ProfileField
                      label="脂肪酸(mgKOH/100g)"
                      value={qualityForm.fattyAcid}
                      editable
                      changeValue={(v) => {
                        qualityForm.fattyAcid = v;
                      }}
                    />
                    <ProfileField
                      label="镉(mg/kg)"
                      value={qualityForm.cadmium}
                      editable
                      changeValue={(v) => {
                        qualityForm.cadmium = v;
                      }}
                    />
                    <ProfileField
                      label="黄曲霉素B1(μg/kg)"
                      value={qualityForm.aflatoxinB1}
                      editable
                      changeValue={(v) => {
                        qualityForm.aflatoxinB1 = v;
                      }}
                    />
                    <ProfileField
                      label="铅(mg/kg)"
                      value={qualityForm.lead}
                      editable
                      changeValue={(v) => {
                        qualityForm.lead = v;
                      }}
                    />
                    <ProfileField
                      label="汞(mg/kg)"
                      value={qualityForm.mercury}
                      editable
                      changeValue={(v) => {
                        qualityForm.mercury = v;
                      }}
                    />
                    <ProfileField
                      label="无机砷(mg/kg)"
                      value={qualityForm.inorganicArsenic}
                      editable
                      changeValue={(v) => {
                        qualityForm.inorganicArsenic = v;
                      }}
                    />
                  </div>
                </Modal>
              </div>
            ),
          }}
        />
      </div>
    );
  },
});

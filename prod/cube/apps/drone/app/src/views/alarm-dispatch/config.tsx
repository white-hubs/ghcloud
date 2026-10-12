import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, ObjectSelectModal, ObjectType } from "@ghcloud/cube-app-design";
import type { DroneAlarmDispatchConfigModel, IdNameModel } from "@ghcloud/cube-drone-service";
import { Button, Input, InputNumber, Select, Space, Table, message } from "@ghcloud/cube-ui";

import { cubeDroneService } from "@/api/server";

import styles from "./alarm-dispatch.module.less";

type Option = { label: string; value: string | number | boolean };
type AlarmTargetOption = {
  id: string;
  name: string;
  type: ObjectType;
  code?: string;
  area?: { id?: string | number; pathName?: string; name?: string };
  areaId?: string | number;
  areaName?: string;
};
type ObjectSelectModalExpose = { openModal: () => void };

const finishActionOptions: Option[] = [
  { label: "悬停", value: 0 },
  { label: "垂直降落", value: 1 },
  { label: "返航", value: 2 },
  { label: "消航线返航", value: 3 },
  { label: "机库跳飞", value: 4 },
];

const enabledStatusOptions: Option[] = [
  { label: "启用", value: true },
  { label: "禁用", value: false },
];

const mediaActionOptions: Option[] = [
  { label: "无", value: "" },
  { label: "拍照", value: "photo" },
  { label: "录像", value: "video" },
];

const toIds = (ids: Array<string | number>): IdNameModel[] => ids.map((id) => ({ id }));

export const AlarmDispatchConfig = defineComponent({
  name: "AlarmDispatchConfig",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const saving = ref(false);
    const alarmLevelOptions = ref<Option[]>([]);
    const alarmTypeOptions = ref<Option[]>([]);
    const droneDeviceOptions = ref<Option[]>([]);
    const alarmTargets = ref<AlarmTargetOption[]>([]);
    const selectedTargetRowKeys = ref<string[]>([]);
    const alarmTargetModalRef = ref<ObjectSelectModalExpose>();
    const form = reactive({
      enabled: true,
      alarmLevelIds: [] as Array<string | number>,
      alarmTypeIds: [] as Array<string | number>,
      droneDeviceId: undefined as string | number | undefined,
      finishAction: undefined as number | undefined,
      flyHeight: 120,
      sceneId: undefined as string | number | undefined,
      sceneCode: "",
      mediaAction: "" as "" | "photo" | "video",
    });

    const loadOptions = async (): Promise<void> => {
      const [levels, types, droneDevices] = await Promise.all([
        cubeDroneService.getAlarmLevels(),
        cubeDroneService.getAlarmTypes(),
        cubeDroneService.getDroneDeviceInstancePage({ applicationCode: __ENV__.applicationCode, pageNumber: 1, pageSize: 1000 }),
      ]);
      alarmLevelOptions.value = levels.map((item) => ({ label: item.name, value: item.id }));
      alarmTypeOptions.value = types.map((item) => ({ label: item.name, value: item.id }));
      droneDeviceOptions.value = droneDevices.records.map((item) => ({
        label: item.deviceName ?? item.name ?? item.code ?? item.deviceCode ?? String(item.deviceId ?? item.id),
        value: item.deviceId ?? item.id,
      }));
    };

    const loadConfig = async (): Promise<void> => {
      const config = await cubeDroneService.getAlarmDispatchConfig();
      form.enabled = config.id == null ? true : Boolean(config.enabled);
      alarmTargets.value = (config.alarmTargets ?? []).map((item) => ({
        id: String(item.id),
        name: item.name,
        type: ObjectType.DEVICE,
        code: item.code,
        areaId: item.areaId,
        areaName: item.areaName,
      }));
      selectedTargetRowKeys.value = [];
      form.alarmLevelIds = (config.alarmLevels ?? []).map((item) => item.id);
      form.alarmTypeIds = (config.alarmTypes ?? []).map((item) => item.id);
      form.droneDeviceId = config.droneDeviceId;
      form.finishAction = config.finishAction;
      form.flyHeight = config.flyHeight ?? 120;
      form.sceneId = config.sceneId;
      form.sceneCode = config.sceneCode ?? "";
      form.mediaAction = config.mediaAction ?? "";
    };

    onMounted(async () => {
      loading.value = true;
      try {
        await loadOptions();
        await loadConfig();
      } finally {
        loading.value = false;
      }
    });

    const validate = (): boolean => {
      if (form.enabled == null) {
        message.warning("请选择启用状态");
        return false;
      }
      if (form.droneDeviceId == null) {
        message.warning("请选择无人机设备");
        return false;
      }
      if (!form.alarmLevelIds.length) {
        message.warning("请选择报警级别");
        return false;
      }
      if (!form.alarmTypeIds.length) {
        message.warning("请选择报警类型");
        return false;
      }
      if (!alarmTargets.value.length) {
        message.warning("请添加报警设备");
        return false;
      }
      return true;
    };

    const save = async (): Promise<void> => {
      if (!validate()) {
        return;
      }
      saving.value = true;
      try {
        const payload: DroneAlarmDispatchConfigModel = {
          enabled: form.enabled,
          alarmTargets: alarmTargets.value.map((item) => ({
            id: item.id,
            name: item.name,
            code: item.code,
            areaId: item.areaId ?? item.area?.id,
            areaName: getAlarmTargetAreaName(item) === "--" ? undefined : getAlarmTargetAreaName(item),
          })),
          alarmLevels: toIds(form.alarmLevelIds),
          alarmTypes: toIds(form.alarmTypeIds),
          droneDeviceId: form.droneDeviceId,
          droneDeviceName: droneDeviceOptions.value.find((option) => String(option.value) === String(form.droneDeviceId))?.label,
          finishAction: form.finishAction == null ? undefined : Number(form.finishAction),
          flyHeight: Number(form.flyHeight ?? 120),
          sceneId: form.sceneId,
          sceneCode: form.sceneCode,
          mediaAction: form.mediaAction || undefined,
        };
        await cubeDroneService.saveAlarmDispatchConfig(payload);
        message.success("保存成功");
      } finally {
        saving.value = false;
      }
    };

    const removeAlarmTargets = (ids: string[]): void => {
      alarmTargets.value = alarmTargets.value.filter((item) => !ids.includes(item.id));
      selectedTargetRowKeys.value = selectedTargetRowKeys.value.filter((id) => !ids.includes(id));
    };

    const getAlarmTargetAreaName = (record: AlarmTargetOption): string =>
      record.area?.pathName ?? record.area?.name ?? record.areaName ?? "--";

    const targetColumns = [
      {
        title: "报警设备",
        dataIndex: "name",
        ellipsis: true,
      },
      {
        title: "设备编号",
        dataIndex: "code",
        ellipsis: true,
        customRender: ({ record }: { record: AlarmTargetOption }) => record.code ?? "--",
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        ellipsis: true,
        customRender: ({ record }: { record: AlarmTargetOption }) => getAlarmTargetAreaName(record),
      },
      {
        title: "对象类型",
        dataIndex: "type",
        width: 140,
        customRender: () => "设备",
      },
      {
        title: "操作",
        dataIndex: "operation",
        width: 120,
        customRender: ({ record }: { record: AlarmTargetOption }) => (
          <Button class={styles.detailButton} type="link" onClick={() => removeAlarmTargets([record.id])}>
            移除
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <>
        <CubeLayout
          class={styles.container}
          title="报警派飞配置"
          v-slots={{
            "layout-header": () => <Button onClick={() => void router.push({ path: "/alarm-dispatch-records" })}>派飞日志</Button>,
            "layout-content": () => (
              <div class={styles.content}>
                <div class={styles.panel}>
                  <div class={styles.sectionTitle}>基本配置</div>
                  <div class={styles.formGrid}>
                    <label class={`${styles.field} ${styles.requiredField}`}>
                      <span>启用状态</span>
                      <Select v-model:value={form.enabled} options={enabledStatusOptions} disabled={loading.value} />
                    </label>
                    <label class={`${styles.field} ${styles.requiredField}`}>
                      <span>无人机设备</span>
                      <Select
                        v-model:value={form.droneDeviceId}
                        options={droneDeviceOptions.value}
                        placeholder="请选择无人机设备"
                        allowClear
                      />
                    </label>
                    <label class={`${styles.field} ${styles.requiredField}`}>
                      <span>报警级别</span>
                      <Select
                        v-model:value={form.alarmLevelIds}
                        options={alarmLevelOptions.value}
                        placeholder="请选择报警级别"
                        mode="multiple"
                        allowClear
                      />
                    </label>
                    <label class={`${styles.field} ${styles.requiredField}`}>
                      <span>报警类型</span>
                      <Select
                        v-model:value={form.alarmTypeIds}
                        options={alarmTypeOptions.value}
                        placeholder="请选择报警类型"
                        mode="multiple"
                        allowClear
                      />
                    </label>
                    <label class={styles.field}>
                      <span>完成动作</span>
                      <Select v-model:value={form.finishAction} options={finishActionOptions} placeholder="无" allowClear />
                    </label>
                    <label class={styles.field}>
                      <span>飞行高度</span>
                      <InputNumber v-model:value={form.flyHeight} min={5} precision={0} />
                    </label>
                    <label class={styles.field}>
                      <span>场景ID</span>
                      <InputNumber v-model:value={form.sceneId} min={1} precision={0} placeholder="可选" />
                    </label>
                    <label class={styles.field}>
                      <span>场景编号</span>
                      <Input v-model:value={form.sceneCode} placeholder="可选" />
                    </label>
                    <label class={styles.field}>
                      <span>执行动作</span>
                      <Select v-model:value={form.mediaAction} options={mediaActionOptions} placeholder="无" />
                    </label>
                  </div>
                </div>
                <div class={styles.panel}>
                  <div class={styles.tableHeader}>
                    <div class={`${styles.sectionTitle} ${styles.requiredTitle}`}>报警设备</div>
                    <Space>
                      <Button
                        disabled={!selectedTargetRowKeys.value.length}
                        onClick={() => removeAlarmTargets(selectedTargetRowKeys.value)}
                      >
                        批量移除
                      </Button>
                      <Button type="primary" onClick={() => alarmTargetModalRef.value?.openModal()}>
                        添加设备
                      </Button>
                    </Space>
                  </div>
                  <Table
                    columns={targetColumns}
                    dataSource={alarmTargets.value}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scrollY={320}
                    rowSelection={{
                      selectedRowKeys: selectedTargetRowKeys.value,
                      onChange: (keys: Array<string | number>) => {
                        selectedTargetRowKeys.value = keys.map((key) => String(key));
                      },
                    }}
                  />
                </div>
                <div class={styles.bottomActions}>
                  <Button onClick={() => void loadConfig()}>重置</Button>
                  <Button type="primary" loading={saving.value} onClick={() => void save()}>
                    保存
                  </Button>
                </div>
              </div>
            ),
          }}
        />
        <ObjectSelectModal
          ref={alarmTargetModalRef}
          title="选择报警对象"
          value={alarmTargets.value}
          defaultTab={ObjectType.DEVICE}
          showTabs={[ObjectType.DEVICE]}
          multiple
          onEnter={(value: AlarmTargetOption[]) => {
            alarmTargets.value = value.map((item) => ({
              ...item,
              id: String(item.id),
              name: item.name,
              type: ObjectType.DEVICE,
              areaId: item.areaId ?? item.area?.id,
              areaName: getAlarmTargetAreaName(item) === "--" ? undefined : getAlarmTargetAreaName(item),
            }));
            selectedTargetRowKeys.value = selectedTargetRowKeys.value.filter((id) => alarmTargets.value.some((item) => item.id === id));
          }}
        />
      </>
    );
  },
});

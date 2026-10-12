import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { Pagination } from "@ghcloud/cube-service-interface/base";
import {
  GrainDimension,
  type GrainRuleConfig,
  type GrainRuleEngineConstants,
  type GrainWarehouseOption,
  type GrainWarehouseRulePageQuery,
  type GrainWarehouseRuleRow,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  deleteIntelligentGrainWarehouseRules,
  getIntelligentGrainGlobalRules,
  getIntelligentGrainRuleEngineConstants,
  getIntelligentGrainWarehouseRules,
  listIntelligentGrainWarehouseOptions,
  pageIntelligentGrainWarehouseRules,
  restoreIntelligentGrainFactoryDefaults,
  saveIntelligentGrainGlobalRules,
  saveIntelligentGrainWarehouseRules,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, InputNumber, Modal, Page, Select, Space, Spin, Tag, message, type ColumnType } from "@ghcloud/cube-ui";

import { formatTime } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

type RuleTab = "global" | "warehouse";
type InheritDimension = "temperature" | "storage" | "gas" | "humidity";

interface RuleForm {
  temperature: {
    warningThreshold: number;
    consecutiveDays: number;
    minDailyIncrease: number;
    approachMargin: number;
  };
  storage: {
    volumeChangeThreshold: number;
    weightChangeThreshold: number;
  };
  gas: {
    o2LowerLimit: number;
    co2UpperLimit: number;
    h2sUpperLimit: number;
  };
  humidity: {
    upperLimit: number;
    lowerLimit: number;
  };
  escalation: {
    level1UrgeMinutes: number;
    level1EscalateMinutes: number;
    level2UrgeMinutes: number;
    level3ReminderMinutes: number;
  };
  alertScan: {
    enabled: boolean;
    dedupeWindowMinutes: number;
  };
}

const DIMENSION_LABEL: Record<string, string> = {
  [GrainDimension.TEMPERATURE]: "温度",
  [GrainDimension.STORAGE]: "储量",
  [GrainDimension.GAS]: "气体",
  [GrainDimension.HUMIDITY]: "湿度",
};

const inheritLabels: Array<{ key: InheritDimension; label: string; summary: (form: RuleForm) => string }> = [
  { key: "temperature", label: "温度", summary: (form) => `${form.temperature.warningThreshold}℃` },
  {
    key: "storage",
    label: "储量",
    summary: (form) => `${form.storage.volumeChangeThreshold}m³ / ${form.storage.weightChangeThreshold}吨`,
  },
  { key: "gas", label: "气体", summary: (form) => `${form.gas.co2UpperLimit}ppm` },
  { key: "humidity", label: "湿度", summary: (form) => `${form.humidity.upperLimit}/${form.humidity.lowerLimit}%RH` },
];

function createDefaultForm(): RuleForm {
  return {
    temperature: {
      warningThreshold: 25,
      consecutiveDays: 3,
      minDailyIncrease: 0.3,
      approachMargin: 3,
    },
    storage: {
      volumeChangeThreshold: 30,
      weightChangeThreshold: 25,
    },
    gas: {
      o2LowerLimit: 19,
      co2UpperLimit: 1500,
      h2sUpperLimit: 10,
    },
    humidity: {
      upperLimit: 75,
      lowerLimit: 30,
    },
    escalation: {
      level1UrgeMinutes: 15,
      level1EscalateMinutes: 30,
      level2UrgeMinutes: 120,
      level3ReminderMinutes: 240,
    },
    alertScan: {
      enabled: true,
      dedupeWindowMinutes: 5,
    },
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function numberValue(record: Record<string, unknown>, keys: string[], fallback: number): number {
  const actual = keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "");
  const numeric = Number(actual);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function booleanValue(record: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const actual = record[key];
  return actual === undefined || actual === null ? fallback : Boolean(actual);
}

function applyRuleConfig(target: RuleForm, config?: GrainRuleConfig): void {
  const defaults = createDefaultForm();
  const temperature = objectValue(config?.temperature);
  const storage = objectValue(config?.storage);
  const gas = objectValue(config?.gas);
  const humidity = objectValue(config?.humidity);
  const escalation = objectValue(config?.escalation);
  const alertScan = objectValue(config?.alertScan);

  target.temperature.warningThreshold = numberValue(temperature, ["warningThreshold", "max"], defaults.temperature.warningThreshold);
  target.temperature.consecutiveDays = numberValue(temperature, ["consecutiveDays"], defaults.temperature.consecutiveDays);
  target.temperature.minDailyIncrease = numberValue(temperature, ["minDailyIncrease"], defaults.temperature.minDailyIncrease);
  target.temperature.approachMargin = numberValue(temperature, ["approachMargin"], defaults.temperature.approachMargin);
  target.storage.volumeChangeThreshold = numberValue(
    storage,
    ["volumeChangeThreshold", "volumeDeviationPercent"],
    defaults.storage.volumeChangeThreshold,
  );
  target.storage.weightChangeThreshold = numberValue(
    storage,
    ["weightChangeThreshold", "dayDecreaseTon"],
    defaults.storage.weightChangeThreshold,
  );
  target.gas.o2LowerLimit = numberValue(gas, ["o2LowerLimit", "o2Min"], defaults.gas.o2LowerLimit);
  target.gas.co2UpperLimit = numberValue(gas, ["co2UpperLimit", "co2Max"], defaults.gas.co2UpperLimit);
  target.gas.h2sUpperLimit = numberValue(gas, ["h2sUpperLimit"], defaults.gas.h2sUpperLimit);
  target.humidity.upperLimit = numberValue(humidity, ["upperLimit", "max"], defaults.humidity.upperLimit);
  target.humidity.lowerLimit = numberValue(humidity, ["lowerLimit"], defaults.humidity.lowerLimit);
  target.escalation.level1UrgeMinutes = numberValue(escalation, ["level1UrgeMinutes"], defaults.escalation.level1UrgeMinutes);
  target.escalation.level1EscalateMinutes = numberValue(
    escalation,
    ["level1EscalateMinutes", "level2Minutes"],
    defaults.escalation.level1EscalateMinutes,
  );
  target.escalation.level2UrgeMinutes = numberValue(escalation, ["level2UrgeMinutes"], defaults.escalation.level2UrgeMinutes);
  target.escalation.level3ReminderMinutes = numberValue(
    escalation,
    ["level3ReminderMinutes", "level3Minutes"],
    defaults.escalation.level3ReminderMinutes,
  );
  target.alertScan.enabled = booleanValue(alertScan, "enabled", defaults.alertScan.enabled);
  target.alertScan.dedupeWindowMinutes = numberValue(alertScan, ["dedupeWindowMinutes"], defaults.alertScan.dedupeWindowMinutes);
}

function copyDimension(target: RuleForm, source: RuleForm, key: InheritDimension): void {
  if (key === "temperature") {
    target.temperature = { ...source.temperature };
  }
  if (key === "storage") {
    target.storage = { ...source.storage };
  }
  if (key === "gas") {
    target.gas = { ...source.gas };
  }
  if (key === "humidity") {
    target.humidity = { ...source.humidity };
  }
}

function toRuleConfig(form: RuleForm, include?: InheritDimension[]): GrainRuleConfig {
  const shouldInclude = (key: InheritDimension): boolean => !include || include.includes(key);
  const config: GrainRuleConfig = {};
  if (shouldInclude("temperature")) {
    config.temperature = { ...form.temperature };
  }
  if (shouldInclude("storage")) {
    config.storage = { ...form.storage };
  }
  if (shouldInclude("gas")) {
    config.gas = { ...form.gas };
  }
  if (shouldInclude("humidity")) {
    config.humidity = { ...form.humidity };
  }
  if (!include) {
    config.escalation = { ...form.escalation };
    config.alertScan = { ...form.alertScan };
  }
  return config;
}

function setNumericValue(assign: (value: number) => void): (event: Event) => void {
  return (event: Event) => {
    const input = event.target as HTMLInputElement;
    const numeric = Number(input.value);
    assign(Number.isFinite(numeric) ? numeric : 0);
  };
}

function RuleInput(props: { label: string; input: JSX.Element; unit?: string }): JSX.Element {
  return (
    <label class="ig-rules-field">
      <span>{props.label}</span>
      {props.input}
      {props.unit ? <em>{props.unit}</em> : null}
    </label>
  );
}

export const IntelligentGrainRules = defineComponent({
  name: "IntelligentGrainRules",
  setup: () => {
    const loading = ref(false);
    const saving = ref(false);
    const modalVisible = ref(false);
    const modalSaving = ref(false);
    const activeTab = ref<RuleTab>("global");
    const modalTitle = ref("新增单仓规则");
    const editingWarehouseId = ref<string>();
    const selectedWarehouseId = ref<string>();
    const rules = ref<Pagination<GrainWarehouseRuleRow>>();
    const warehouseOptions = ref<GrainWarehouseOption[]>([]);
    const engineConstants = ref<GrainRuleEngineConstants>();
    const ruleSearch = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      grainType: "",
    });
    const globalForm = reactive(createDefaultForm());
    const warehouseForm = reactive(createDefaultForm());
    const inherit = reactive<Record<InheritDimension, boolean>>({
      temperature: true,
      storage: true,
      gas: true,
      humidity: true,
    });

    const warehouseSelectOptions = computed(() => {
      const ruleIds = new Set((rules.value?.records ?? []).map((item) => item.warehouseId));
      return warehouseOptions.value.map((item) => ({
        label: `${item.warehouseName}${item.grainType ? ` · ${item.grainType}` : ""}`,
        value: item.warehouseId,
        disabled: ruleIds.has(item.warehouseId) && item.warehouseId !== editingWarehouseId.value,
      }));
    });

    const selectedWarehouse = computed(() => warehouseOptions.value.find((item) => item.warehouseId === selectedWarehouseId.value));
    const grainTypeOptions = computed(() => {
      const grainTypes = Array.from(new Set(warehouseOptions.value.map((item) => item.grainType).filter(Boolean) as string[]));
      return [{ label: "全部", value: "" }, ...grainTypes.map((value) => ({ label: value, value }))];
    });

    const updateRuleSearchFieldSchema = (): void => {
      ruleSearchFormApi.updateFieldSchema({
        component: Select,
        label: "粮食品种",
        fieldName: "grainType",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: grainTypeOptions.value,
          styles: { width: "160px" },
        },
      });
    };

    const load = async (): Promise<void> => {
      loading.value = true;
      try {
        const [globalRuleConfig, options, constants] = await Promise.all([
          useAuthRequest(() => getIntelligentGrainGlobalRules()),
          useAuthRequest(() => listIntelligentGrainWarehouseOptions()),
          useAuthRequest(() => getIntelligentGrainRuleEngineConstants()),
        ]);
        warehouseOptions.value = options;
        engineConstants.value = constants;
        applyRuleConfig(globalForm, globalRuleConfig);
        updateRuleSearchFieldSchema();
      } catch (error) {
        message.error((error as Error).message || "加载规则配置失败");
      } finally {
        loading.value = false;
      }
    };

    const saveGlobal = async (): Promise<void> => {
      saving.value = true;
      try {
        await useAuthRequest(() => saveIntelligentGrainGlobalRules(toRuleConfig(globalForm)));
        message.success("规则配置已保存");
        await load();
      } catch (error) {
        message.error((error as Error).message || "保存规则配置失败");
      } finally {
        saving.value = false;
      }
    };

    const restoreDefaults = async (): Promise<void> => {
      saving.value = true;
      try {
        const restored = await useAuthRequest(() => restoreIntelligentGrainFactoryDefaults());
        applyRuleConfig(globalForm, restored);
        message.success("已恢复出厂默认");
        await load();
      } catch (error) {
        message.error((error as Error).message || "恢复默认失败");
      } finally {
        saving.value = false;
      }
    };

    const openCreateModal = (): void => {
      modalTitle.value = "新增单仓规则";
      editingWarehouseId.value = undefined;
      selectedWarehouseId.value = warehouseSelectOptions.value.find((item) => !item.disabled)?.value;
      applyRuleConfig(warehouseForm, toRuleConfig(globalForm));
      inherit.temperature = true;
      inherit.storage = true;
      inherit.gas = true;
      inherit.humidity = true;
      modalVisible.value = true;
    };

    const openEditModal = async (row: GrainWarehouseRuleRow): Promise<void> => {
      modalTitle.value = "编辑单仓规则";
      editingWarehouseId.value = row.warehouseId;
      selectedWarehouseId.value = row.warehouseId;
      applyRuleConfig(warehouseForm, toRuleConfig(globalForm));
      inherit.temperature = true;
      inherit.storage = true;
      inherit.gas = true;
      inherit.humidity = true;
      row.overrideDimensions.forEach((item) => {
        if (item.dimension === GrainDimension.TEMPERATURE) inherit.temperature = false;
        if (item.dimension === GrainDimension.STORAGE) inherit.storage = false;
        if (item.dimension === GrainDimension.GAS) inherit.gas = false;
        if (item.dimension === GrainDimension.HUMIDITY) inherit.humidity = false;
      });
      modalVisible.value = true;
      try {
        const config = await useAuthRequest(() => getIntelligentGrainWarehouseRules(row.warehouseId));
        applyRuleConfig(warehouseForm, config);
      } catch (error) {
        message.error((error as Error).message || "加载单仓规则失败");
      }
    };

    const saveWarehouseRule = async (): Promise<void> => {
      if (!selectedWarehouseId.value) {
        message.warning("请选择仓房");
        return;
      }
      modalSaving.value = true;
      try {
        const overrideKeys = inheritLabels.filter((item) => !inherit[item.key]).map((item) => item.key);
        await useAuthRequest(() => deleteIntelligentGrainWarehouseRules(selectedWarehouseId.value as string));
        if (overrideKeys.length > 0) {
          await useAuthRequest(() =>
            saveIntelligentGrainWarehouseRules(selectedWarehouseId.value as string, toRuleConfig(warehouseForm, overrideKeys)),
          );
        }
        modalVisible.value = false;
        message.success("单仓规则已保存");
        ruleTableApi.query();
      } catch (error) {
        message.error((error as Error).message || "保存单仓规则失败");
      } finally {
        modalSaving.value = false;
      }
    };

    const deleteWarehouseRule = async (row: GrainWarehouseRuleRow): Promise<void> => {
      if (!window.confirm(`确认删除 ${row.warehouseName} 的单仓覆盖规则？`)) {
        return;
      }
      try {
        await useAuthRequest(() => deleteIntelligentGrainWarehouseRules(row.warehouseId));
        message.success("单仓规则已删除");
        ruleTableApi.query();
      } catch (error) {
        message.error((error as Error).message || "删除单仓规则失败");
      }
    };

    onMounted(() => {
      void load();
    });

    const renderRuleSection = (options: { title: string; icon: string; dotClass?: string; children: JSX.Element }): JSX.Element => (
      <section class="ig-rules-block">
        <header>
          <span class={["ig-rules-dot", options.dotClass ?? ""]} />
          <strong>
            {options.icon} {options.title}
          </strong>
          <Tag color="green">已就绪</Tag>
        </header>
        <div class="ig-rules-grid">{options.children}</div>
      </section>
    );

    const renderTemperatureFields = (form: RuleForm): JSX.Element => (
      <>
        <RuleInput
          label="预警阈值："
          input={<InputNumber v-model:value={form.temperature.warningThreshold} min={0} precision={2} style={{ width: "96px" }} />}
          unit="℃"
        />
        <RuleInput
          label="连续上升天数："
          input={<InputNumber v-model:value={form.temperature.consecutiveDays} min={0} precision={0} style={{ width: "96px" }} />}
          unit="天"
        />
        <RuleInput
          label="日均最小增幅："
          input={<InputNumber v-model:value={form.temperature.minDailyIncrease} min={0} precision={2} style={{ width: "96px" }} />}
          unit="℃/天"
        />
        <RuleInput
          label="逼近余量："
          input={<InputNumber v-model:value={form.temperature.approachMargin} min={0} precision={2} style={{ width: "96px" }} />}
          unit="℃"
        />
      </>
    );

    const renderStorageFields = (form: RuleForm): JSX.Element => (
      <>
        <RuleInput
          label="体积变化阈值："
          input={<InputNumber v-model:value={form.storage.volumeChangeThreshold} min={0} precision={3} style={{ width: "96px" }} />}
          unit="m³"
        />
        <RuleInput
          label="重量变化阈值："
          input={<InputNumber v-model:value={form.storage.weightChangeThreshold} min={0} precision={3} style={{ width: "96px" }} />}
          unit="吨"
        />
      </>
    );

    const renderGasFields = (form: RuleForm): JSX.Element => (
      <>
        <RuleInput
          label="O₂下限："
          input={<InputNumber v-model:value={form.gas.o2LowerLimit} min={0} precision={2} style={{ width: "96px" }} />}
          unit="%"
        />
        <RuleInput
          label="CO₂上限："
          input={<InputNumber v-model:value={form.gas.co2UpperLimit} min={0} precision={0} style={{ width: "96px" }} />}
          unit="ppm"
        />
        <RuleInput
          label="H₂S上限："
          input={<InputNumber v-model:value={form.gas.h2sUpperLimit} min={0} precision={0} style={{ width: "96px" }} />}
          unit="ppm"
        />
      </>
    );

    const renderHumidityFields = (form: RuleForm): JSX.Element => (
      <>
        <RuleInput
          label="湿度上限："
          input={<InputNumber v-model:value={form.humidity.upperLimit} min={0} precision={2} style={{ width: "96px" }} />}
          unit="%RH"
        />
        <RuleInput
          label="湿度下限："
          input={<InputNumber v-model:value={form.humidity.lowerLimit} min={0} precision={2} style={{ width: "96px" }} />}
          unit="%RH"
        />
      </>
    );

    const renderEscalationFields = (): JSX.Element => (
      <section class="ig-rules-block">
        <header>
          <span class="ig-rules-dot is-blue" />
          <strong>⏰ 催办升级时间</strong>
        </header>
        <div class="ig-rules-escalation">
          <label>
            <Tag color="red">一级告警</Tag>
            超时催办：
            <input
              value={globalForm.escalation.level1UrgeMinutes}
              type="number"
              onInput={setNumericValue((value) => (globalForm.escalation.level1UrgeMinutes = value))}
            />
            分钟后催办巡检员+安保经理
          </label>
          <label>
            <Tag color="red">一级告警</Tag>
            升级通知：
            <input
              value={globalForm.escalation.level1EscalateMinutes}
              type="number"
              onInput={setNumericValue((value) => (globalForm.escalation.level1EscalateMinutes = value))}
            />
            分钟后追加通知园区总经理
          </label>
          <label>
            <Tag color="orange">二级告警</Tag>
            超时催办：
            <input
              value={globalForm.escalation.level2UrgeMinutes}
              type="number"
              onInput={setNumericValue((value) => (globalForm.escalation.level2UrgeMinutes = value))}
            />
            分钟后催办巡检员+安保经理
          </label>
          <label>
            <Tag color="gold">三级告警</Tag>
            超时提醒：
            <input
              value={globalForm.escalation.level3ReminderMinutes}
              type="number"
              onInput={setNumericValue((value) => (globalForm.escalation.level3ReminderMinutes = value))}
            />
            分钟后提醒巡检员
          </label>
          <label>
            <Tag color={globalForm.alertScan.enabled ? "green" : "default"}>{globalForm.alertScan.enabled ? "开启" : "关闭"}</Tag>
            告警扫描：
            <input
              type="checkbox"
              checked={globalForm.alertScan.enabled}
              onChange={(event) => {
                globalForm.alertScan.enabled = (event.target as HTMLInputElement).checked;
              }}
            />
            去重周期
            <input
              value={globalForm.alertScan.dedupeWindowMinutes}
              type="number"
              onInput={setNumericValue((value) => (globalForm.alertScan.dedupeWindowMinutes = value))}
            />
            分钟
          </label>
        </div>
      </section>
    );

    const renderEngineConstants = (): JSX.Element => (
      <section class="ig-rules-engine">
        <h3>🔒 智能粮情规则引擎固化参数（以下参数由规则引擎代码管理，不在报警中心配置）</h3>
        <div class="ig-rules-engine-grid">
          <div>
            <strong>跨维度关联参数</strong>
            <p>
              CD-01 温度趋势窗口：<b>{engineConstants.value?.supportedRanges?.[0] ?? 3}天</b>
            </p>
            <p>
              CD-03 CO₂上升触发量：<b>100ppm</b>
            </p>
            <p>
              CD-05 聚合点数阈值：<b>3点</b>（空间半径：相邻点）
            </p>
          </div>
          <div>
            <strong>健康度评分权重</strong>
            <p>温度 30% | 储量 20% | 湿度 15% | 气体 10% | 品质 15%（待确认） | 虫害 10%（未就绪）</p>
            <p class="ig-rules-blue">当前有效权重：温度 40% | 储量 27% | 湿度 20% | 气体 13%（自动缩放）</p>
          </div>
        </div>
      </section>
    );

    const ruleColumns: ColumnType<GrainWarehouseRuleRow>[] = [
      { title: "仓房名称", dataIndex: "warehouseName", customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "品种", dataIndex: "grainType", width: 180, customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "覆盖维度",
        dataIndex: "overrideDimensions",
        customRender: ({ record }: { record: GrainWarehouseRuleRow }) => (
          <Space wrap>
            {record.overrideDimensions.length > 0 ? (
              record.overrideDimensions.map((item) => (
                <Tag color="blue" key={`${record.warehouseId}-${item.dimension}`}>
                  {item.summary || DIMENSION_LABEL[item.dimension] || item.dimension}
                </Tag>
              ))
            ) : (
              <Tag>沿用全局默认</Tag>
            )}
          </Space>
        ),
      },
      { title: "最近修改", dataIndex: "updatedAt", width: 220, customRender: ({ text }: { text?: string }) => formatTime(text) },
      {
        title: "操作",
        dataIndex: "action",
        width: 160,
        customRender: ({ record }: { record: GrainWarehouseRuleRow }) => (
          <Space>
            <Button type="link" size="small" onClick={() => void openEditModal(record)}>
              编辑
            </Button>
            <Button type="link" size="small" danger onClick={() => void deleteWarehouseRule(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const [RuleSearchForm, ruleSearchFormApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: (values) => {
        ruleSearch.keyword = values.keyword ? String(values.keyword) : "";
        ruleSearch.grainType = values.grainType ? String(values.grainType) : "";
        ruleSearch.pageNumber = 1;
        ruleTableApi.query();
      },
      handleReset: () => {
        ruleSearch.keyword = "";
        ruleSearch.grainType = "";
        ruleSearch.pageNumber = 1;
        ruleTableApi.query();
      },
      schema: [
        {
          component: "Input",
          label: "关键词",
          fieldName: "keyword",
          defaultValue: "",
          componentProps: {
            placeholder: "仓房名称/粮食品种",
            styles: { width: "220px" },
          },
        },
        {
          component: Select,
          label: "粮食品种",
          fieldName: "grainType",
          defaultValue: "",
          componentProps: {
            allowClear: true,
            options: grainTypeOptions.value,
            styles: { width: "160px" },
          },
        },
      ],
      showCollapseButton: true,
    });

    const emptyRulePage = (): Pagination<GrainWarehouseRuleRow> => ({
      total: 0,
      pages: 0,
      records: [],
    });

    const [RuleTable, ruleTableApi] = useCubeTable({
      columns: ruleColumns,
      rowKey: "warehouseId",
      tableCode: "INTELLIGENT_GRAIN_WAREHOUSE_RULES",
      fetchApi: async () => {
        try {
          const params: GrainWarehouseRulePageQuery = {
            pageNumber: ruleSearch.pageNumber,
            pageSize: ruleSearch.pageSize,
          };
          if (ruleSearch.keyword) {
            params.keyword = ruleSearch.keyword;
          }
          if (ruleSearch.grainType) {
            params.grainType = ruleSearch.grainType;
          }
          return await useAuthRequest(() => pageIntelligentGrainWarehouseRules(params));
        } catch (error) {
          message.error((error as Error).message || "加载单仓规则失败");
          return emptyRulePage();
        }
      },
      fetchLoaded: (data) => {
        const page = data as Pagination<GrainWarehouseRuleRow>;
        rules.value = page;
        ruleSearch.total = page.total;
      },
    });

    const handleRulePageChange = (current: number, size: number): void => {
      ruleSearch.pageNumber = current;
      ruleSearch.pageSize = size;
      ruleTableApi.query();
    };

    const slots = {
      "layout-header": (): JSX.Element => <span class="ig-header-tip">配置智能粮情规则阈值、单仓覆盖和规则引擎固化参数。</span>,
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-rules-page">
            <section class="ig-rules-main">
              <div class="ig-rules-tabs">
                <button class={activeTab.value === "global" ? "is-active" : ""} onClick={() => (activeTab.value = "global")} type="button">
                  全局默认
                </button>
                <button
                  class={activeTab.value === "warehouse" ? "is-active" : ""}
                  onClick={() => (activeTab.value = "warehouse")}
                  type="button"
                >
                  单仓覆盖
                </button>
              </div>

              {activeTab.value === "global" ? (
                <div class="ig-rules-content">
                  {renderRuleSection({ title: "温度维度", icon: "🌡", children: renderTemperatureFields(globalForm) })}
                  {renderRuleSection({ title: "储量维度", icon: "📦", children: renderStorageFields(globalForm) })}
                  {renderRuleSection({ title: "气体维度", icon: "🧪", children: renderGasFields(globalForm) })}
                  {renderRuleSection({ title: "湿度维度", icon: "💧", children: renderHumidityFields(globalForm) })}
                  {renderEscalationFields()}
                </div>
              ) : (
                <div class="ig-rules-content">
                  <div class="ig-rules-warehouse-head">
                    <span>已配置独立规则的仓房。单仓规则优先级高于全局默认。</span>
                    <Button type="primary" onClick={openCreateModal}>
                      + 新增规则
                    </Button>
                  </div>
                  <RuleSearchForm />
                  <RuleTable />
                </div>
              )}
            </section>

            {renderEngineConstants()}

            <Modal
              v-model:visible={modalVisible.value}
              title={modalTitle.value}
              width="560px"
              destroyOnClose
              confirmLoading={modalSaving.value}
              onOk={() => void saveWarehouseRule()}
              onCancel={() => {
                modalVisible.value = false;
              }}
            >
              <div class="ig-rules-modal">
                <label class="ig-rules-modal-field">
                  <span>选择仓房：</span>
                  <Select
                    value={selectedWarehouseId.value}
                    options={warehouseSelectOptions.value}
                    disabled={Boolean(editingWarehouseId.value)}
                    showSearch
                    style={{ width: "100%" }}
                    filterOption={(input: string, option: { label?: string }) =>
                      (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value: string) => {
                      selectedWarehouseId.value = value;
                    }}
                  />
                </label>
                <p class="ig-rules-modal-tip">已配置独立规则的仓房灰显不可选</p>
                <div class="ig-rules-inherit-list">
                  {inheritLabels.map((item) => (
                    <section key={item.key}>
                      <label>
                        <input
                          type="checkbox"
                          checked={inherit[item.key]}
                          onChange={(event) => {
                            inherit[item.key] = (event.target as HTMLInputElement).checked;
                            if (inherit[item.key]) {
                              copyDimension(warehouseForm, globalForm, item.key);
                            }
                          }}
                        />
                        {item.label}使用全局默认（{item.summary(globalForm)}）
                      </label>
                      {!inherit[item.key] ? (
                        <div class="ig-rules-inherit-fields">
                          {item.key === "temperature" ? renderTemperatureFields(warehouseForm) : null}
                          {item.key === "storage" ? renderStorageFields(warehouseForm) : null}
                          {item.key === "gas" ? renderGasFields(warehouseForm) : null}
                          {item.key === "humidity" ? renderHumidityFields(warehouseForm) : null}
                        </div>
                      ) : null}
                    </section>
                  ))}
                </div>
                {selectedWarehouse.value ? (
                  <p class="ig-rules-modal-tip">
                    当前仓房：{selectedWarehouse.value.warehouseName} · {selectedWarehouse.value.grainType || "--"}
                  </p>
                ) : null}
              </div>
            </Modal>
          </div>
        </Spin>
      ),
      "footer-page": (): JSX.Element =>
        activeTab.value === "global" ? (
          <Space>
            <Button onClick={() => void restoreDefaults()}>恢复出厂默认</Button>
            <Button type="primary" loading={saving.value} onClick={() => void saveGlobal()}>
              保存配置
            </Button>
          </Space>
        ) : (
          <Page
            current={ruleSearch.pageNumber}
            pageSize={ruleSearch.pageSize}
            total={ruleSearch.total}
            showQuickJumper={false}
            showSizeChanger
            showTotal={(total: number) => `共 ${total} 条数据`}
            pageSizeOptions={["10", "20", "50", "100"]}
            onPageChange={handleRulePageChange}
            onShowSizeChange={handleRulePageChange}
          />
        ),
    };

    return (): JSX.Element => <CubeLayout title="规则配置" v-slots={slots} showTableXScroll={activeTab.value === "warehouse"} />;
  },
});

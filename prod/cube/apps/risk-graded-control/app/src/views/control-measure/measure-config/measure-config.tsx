import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { RiskControlMeasureParam } from "@ghcloud/cube-service-interface/risk-graded-control";
import {
  generateControlMeasuresByAi,
  getUnit,
  listObjectControlMeasures,
  pageAreas,
  pageRiskObjects,
  pageUnitInventory,
  pageUnitTypes,
  saveObjectControlMeasures,
} from "@ghcloud/cube-services-client/risk-graded-control.client";
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  SelectOption,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { MeasureCardList, type MeasureFormItem } from "@/components/measure-card-list/measure-card-list";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import {
  CONTROL_LEVELS,
  CONTROL_TYPES,
  LIST_ACTION_LINK_PROPS,
  LIST_FILTER_SELECT_CLASS,
  LIST_FILTER_SELECT_WIDTH,
  LIST_SEARCH_INPUT_PROPS,
  TABLE_CODE_COLUMN_WIDTH,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { ControlMeasureVO, ObjectStatus, RiskObjectVO, UnitInventoryRowVO, UnitTypeVO, UnitVO, ZoneVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { canConfigureObjectMeasures, measureConfigDisabledReason } from "@/utils/object-measure-eligibility";
import { unwrapListRecords } from "@/utils/page-records";
import {
  mapMeasureFromApi,
  mapMeasureToApi,
  mapRiskObjectFromApi,
  mapUnitFromApi,
  mapUnitInventoryRowFromApi,
  mapUnitTypeFromApi,
  mapZoneFromApi,
} from "@/utils/risk-control-mapper";

import styles from "./measure-config.module.less";
import formStyles from "@/styles/form-page.module.less";

const TABLE_SCROLL_X = 980;

const CONTROL_STATUS = {
  CONTROL_SET: { label: "待配置", color: "gold" },
  EXECUTING: { label: "执行中", color: "blue" },
  ACTIVE: { label: "已完成", color: "green" },
} as const;

export const MeasureConfigPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const routeUnitId = Array.isArray(route.query.unitId) ? route.query.unitId[0] : route.query.unitId;
    const selectedUnitId = ref(typeof routeUnitId === "string" ? routeUnitId : "");
    const workflowEntry = Boolean(selectedUnitId.value);
    const detailMode = ref(Boolean(selectedUnitId.value));

    const records = ref<UnitInventoryRowVO[]>([]);
    const zones = ref<ZoneVO[]>([]);
    const unitTypes = ref<UnitTypeVO[]>([]);
    const overviewLoading = ref(false);
    const keyword = ref("");
    const filters = reactive({
      zoneId: "",
      status: "" as ObjectStatus | "",
    });
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, runInitialLoadUnlessHandled, rewindIfEmpty } = useServerPagedList();

    const unit = ref<UnitVO | null>(null);
    const objects = ref<RiskObjectVO[]>([]);
    const objectMeasureMap = ref<Record<string, ControlMeasureVO[]>>({});
    const loading = ref(false);
    const detailLoaded = ref(false);
    const objectId = ref("");
    const activeObject = ref<RiskObjectVO | null>(null);
    const measureModalVisible = ref(false);
    const modalSubmitting = ref(false);
    const aiMeasureGenerating = ref(false);
    const measures = ref<MeasureFormItem[]>([{ id: "m-new-1", controlType: "", content: "", controlLevel: "", executor: "" }]);

    const resetMeasureForm = (): void => {
      measures.value = [{ id: `m-new-${Date.now()}`, controlType: "", content: "", controlLevel: "", executor: "" }];
    };

    const hydrateRow = (row: UnitInventoryRowVO): UnitInventoryRowVO => ({
      ...row,
      unit: {
        ...row.unit,
        zoneName: row.unit.zoneName || zones.value.find((zone) => zone.id === row.unit.zoneId)?.name || "--",
        unitType: row.unit.unitType || unitTypes.value.find((type) => type.id === row.unit.unitTypeId)?.name || "--",
      },
    });

    const resolveControlStatus = (row: UnitInventoryRowVO): keyof typeof CONTROL_STATUS => {
      const status = row.unit.controlStatus;
      if (status === "CONTROL_SET" || status === "EXECUTING" || status === "ACTIVE") return status;
      if ((row.measureCount ?? 0) === 0) return "CONTROL_SET";
      if ((row.completedMeasureCount ?? 0) >= (row.measureCount ?? 0)) return "ACTIVE";
      return "EXECUTING";
    };

    const loadZones = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => pageAreas({ pageNumber: 1, pageSize: 500, view: "option" }));
        zones.value = page.records.map(mapZoneFromApi);
      } catch {
        zones.value = [];
      }
    };

    const loadUnitTypes = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => pageUnitTypes({ pageNumber: 1, pageSize: 500, view: "option" }));
        unitTypes.value = page.records.map(mapUnitTypeFromApi);
      } catch {
        unitTypes.value = [];
      }
    };

    const loadOverview = async (): Promise<void> => {
      overviewLoading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageUnitInventory({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            areaId: filters.zoneId || undefined,
            controlStatus: filters.status || undefined,
          }),
        );
        records.value = page.records.map(mapUnitInventoryRowFromApi).map(hydrateRow);
        total.value = page.total ?? 0;
        await rewindIfEmpty(records.value.length, loadOverview);
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        overviewLoading.value = false;
      }
    };

    const fetchMeasuresForObject = async (targetObjectId: string): Promise<ControlMeasureVO[]> => {
      const measureList = await useAuthRequest(() => listObjectControlMeasures(targetObjectId));
      return unwrapListRecords(measureList).map(mapMeasureFromApi);
    };

    const loadMeasureSummaries = async (targetObjects: RiskObjectVO[]): Promise<void> => {
      const entries = await Promise.all(
        targetObjects.map(async (object) => {
          try {
            return [object.id, await fetchMeasuresForObject(object.id)] as const;
          } catch (e) {
            showApiError(e);
            return [object.id, []] as const;
          }
        }),
      );
      objectMeasureMap.value = Object.fromEntries(entries);
    };

    const loadMeasuresForObject = async (targetObjectId: string): Promise<void> => {
      if (!targetObjectId) {
        resetMeasureForm();
        return;
      }
      const items = await fetchMeasuresForObject(targetObjectId);
      objectMeasureMap.value = {
        ...objectMeasureMap.value,
        [targetObjectId]: items,
      };
      measures.value =
        items.length > 0
          ? items.map((m) => ({
              id: m.id,
              controlType: m.controlType,
              content: m.content,
              controlLevel: m.controlLevel,
              executor: m.executorId,
              executorName: m.executor,
            }))
          : [{ id: "m-new-1", controlType: "", content: "", controlLevel: "", executor: "" }];
    };

    const loadData = async (): Promise<void> => {
      if (!selectedUnitId.value) return;
      loading.value = true;
      detailLoaded.value = false;
      try {
        const unitVo = await useAuthRequest(() => getUnit(selectedUnitId.value));
        unit.value = mapUnitFromApi(unitVo);
        let objectList = (unitVo.objects ?? []).map(mapRiskObjectFromApi);
        if (objectList.length === 0) {
          const riskPage = await useAuthRequest(() =>
            pageRiskObjects({
              unitId: selectedUnitId.value,
              pageNumber: 1,
              pageSize: 500,
            }),
          );
          objectList = riskPage.records.map(mapRiskObjectFromApi);
        }
        objects.value = objectList;
        await loadMeasureSummaries(objects.value);
        objectId.value = "";
        activeObject.value = null;
        resetMeasureForm();
      } catch (e) {
        showApiError(e);
        unit.value = null;
        objects.value = [];
        objectMeasureMap.value = {};
      } finally {
        detailLoaded.value = true;
        loading.value = false;
      }
    };

    onMounted(async () => {
      await loadZones();
      await loadUnitTypes();
      if (detailMode.value) {
        await loadData();
      } else {
        runInitialLoadUnlessHandled(loadOverview);
      }
    });

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadOverview();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      keyword.value = "";
      filters.zoneId = "";
      filters.status = "";
      pageNumber.value = 1;
      void loadOverview();
    };

    const onPageChange = bindPageChange(loadOverview);

    const openUnitControl = async (row: UnitInventoryRowVO): Promise<void> => {
      selectedUnitId.value = row.unit.id;
      detailMode.value = true;
      detailLoaded.value = false;
      unit.value = null;
      objects.value = [];
      objectMeasureMap.value = {};
      objectId.value = "";
      resetMeasureForm();
      await loadData();
    };

    const backToOverview = async (): Promise<void> => {
      if (workflowEntry) {
        router.back();
        return;
      }
      detailMode.value = false;
      detailLoaded.value = false;
      selectedUnitId.value = "";
      unit.value = null;
      objects.value = [];
      objectMeasureMap.value = {};
      objectId.value = "";
      await loadOverview();
    };

    const openMeasureModal = async (record: RiskObjectVO): Promise<void> => {
      if (!canConfigureObjectMeasures(record)) {
        message.warning(measureConfigDisabledReason(record) ?? "请先完成风险评估");
        return;
      }
      activeObject.value = record;
      objectId.value = record.id;
      measureModalVisible.value = true;
      resetMeasureForm();
      try {
        await loadMeasuresForObject(record.id);
      } catch (e) {
        showApiError(e);
      }
    };

    const completeMeasures = (): MeasureFormItem[] => {
      const filled = measures.value.filter((m) => Boolean(m.controlType || m.content.trim() || m.controlLevel || m.executor));
      const invalid = filled.some((m) => !m.controlType || !m.content.trim() || !m.controlLevel || !m.executor);
      if (invalid) {
        message.error("请完善所有措施的必填项");
        return [];
      }
      if (filled.length === 0) {
        message.warning("请至少填写一条管控措施");
        return [];
      }
      return filled;
    };

    const normalizeAiOption = (value: unknown, options: readonly string[]): string => {
      const text = String(value ?? "").trim();
      return options.includes(text) ? text : "";
    };

    const mapAiMeasureDraft = (draft: RiskControlMeasureParam, index: number): MeasureFormItem => ({
      id: `m-ai-${Date.now()}-${index}`,
      controlType: normalizeAiOption(draft.controlType, CONTROL_TYPES),
      content: String(draft.content ?? ""),
      controlLevel: normalizeAiOption(draft.controlLevel, CONTROL_LEVELS),
      executor: String(draft.executorUserId ?? ""),
    });

    const isBlankMeasure = (item: MeasureFormItem): boolean =>
      !item.controlType && !item.content.trim() && !item.controlLevel && !item.executor;

    const generateAiMeasures = async (): Promise<void> => {
      const target = activeObject.value;
      if (!target) {
        message.warning("请先选择风险对象");
        return;
      }
      aiMeasureGenerating.value = true;
      try {
        const result = await useAuthRequest(() =>
          generateControlMeasuresByAi(target.id, {
            requirement: [
              target.name ? `风险对象：${target.name}` : "",
              target.hazardDesc ? `危险源：${target.hazardDesc}` : "",
              target.accidentTypes.length ? `事故类型：${target.accidentTypes.join("、")}` : "",
            ]
              .filter(Boolean)
              .join("；"),
            count: 3,
            existingMeasures: measures.value.filter((item) => !isBlankMeasure(item)).map(mapMeasureToApi),
          }),
        );
        const mapped = (result.measures ?? [])
          .map(mapAiMeasureDraft)
          .filter((item) => item.controlType || item.content.trim() || item.controlLevel);
        if (!mapped.length) {
          message.warning("AI未返回可用措施");
          return;
        }
        measures.value = measures.value.length === 1 && isBlankMeasure(measures.value[0]) ? mapped : [...measures.value, ...mapped];
        message.success(`已生成 ${mapped.length} 条措施草稿`);
      } catch (e) {
        showApiError(e);
      } finally {
        aiMeasureGenerating.value = false;
      }
    };

    const submit = async (): Promise<void> => {
      if (!objectId.value) {
        message.warning("当前未选择风险对象");
        return;
      }
      const targetObject = objects.value.find((object) => object.id === objectId.value) ?? activeObject.value;
      if (targetObject && !canConfigureObjectMeasures(targetObject)) {
        message.warning(measureConfigDisabledReason(targetObject) ?? "请先完成风险评估");
        return;
      }
      const payloadMeasures = completeMeasures();
      if (payloadMeasures.length === 0) return;
      modalSubmitting.value = true;
      try {
        const savedMeasures = await useAuthRequest(() =>
          saveObjectControlMeasures(objectId.value, {
            measures: payloadMeasures.map(mapMeasureToApi),
            submitted: true,
          }),
        );
        const submittedObjectId = objectId.value;
        objectMeasureMap.value = {
          ...objectMeasureMap.value,
          [submittedObjectId]: unwrapListRecords(savedMeasures).map(mapMeasureFromApi),
        };
        objects.value = objects.value.map((object) =>
          object.id === submittedObjectId && object.status === "CONTROL_SET" ? { ...object, status: "EXECUTING" } : object,
        );
        measureModalVisible.value = false;
        activeObject.value = null;
        const unconfiguredObjects = objects.value.filter((object) => (objectMeasureMap.value[object.id] ?? []).length === 0);
        message.success(unconfiguredObjects.length > 0 ? "当前对象措施已保存，请继续配置剩余风险对象" : "管控措施已保存");
        if (workflowEntry) {
          if (unconfiguredObjects.length === 0) {
            void router.push({ name: "measureExecution" });
            return;
          }
        }
        objectId.value = "";
        resetMeasureForm();
      } catch (e) {
        showApiError(e);
      } finally {
        modalSubmitting.value = false;
      }
    };

    const overviewColumns = [
      {
        title: "编号",
        dataIndex: ["unit", "code"],
        width: TABLE_CODE_COLUMN_WIDTH,
        ellipsis: true,
        customRender: ({ text }: { text?: string }) => text || "--",
      },
      { title: "单元名称", dataIndex: ["unit", "name"], width: 180, ellipsis: true },
      { title: "单元类型", dataIndex: ["unit", "unitType"], width: 120, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "所属区域", dataIndex: ["unit", "zoneName"], width: 150, ellipsis: true },
      {
        title: "管控状态",
        width: 100,
        customRender: ({ record }: { record: UnitInventoryRowVO }): JSX.Element => {
          const status = CONTROL_STATUS[resolveControlStatus(record)];
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
      {
        title: "措施总数",
        dataIndex: "measureCount",
        width: 90,
        align: "center" as const,
        customRender: ({ text }: { text?: number }) => text ?? 0,
      },
      {
        title: "已执行",
        dataIndex: "completedMeasureCount",
        width: 90,
        align: "center" as const,
        customRender: ({ text }: { text?: number }) => text ?? 0,
      },
      {
        title: "操作",
        width: 90,
        customRender: ({ record }: { record: UnitInventoryRowVO }): JSX.Element => (
          <Button
            {...LIST_ACTION_LINK_PROPS}
            onClick={() => {
              void openUnitControl(record);
            }}
          >
            管控
          </Button>
        ),
      },
    ];

    const overview = (): JSX.Element => (
      <>
        <Form layout="inline" data-layout-toolbar>
          <FormItem label="关键词">
            <Input
              {...LIST_SEARCH_INPUT_PROPS}
              v-model:value={keyword.value}
              placeholder="搜索单元名称"
              allowClear
              style={{ width: 200 }}
              onPressEnter={onSearch}
            />
          </FormItem>
          <FormItem label="所属区域">
            <div style={{ width: LIST_FILTER_SELECT_WIDTH }}>
              <Select
                class={LIST_FILTER_SELECT_CLASS}
                v-model:value={filters.zoneId}
                allowClear
                placeholder="全部区域"
                style={{ width: "100%" }}
              >
                <SelectOption value="">全部区域</SelectOption>
                {zones.value.map((zone) => (
                  <SelectOption key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectOption>
                ))}
              </Select>
            </div>
          </FormItem>
          <FormItem label="管控状态">
            <div style={{ width: LIST_FILTER_SELECT_WIDTH }}>
              <Select
                class={LIST_FILTER_SELECT_CLASS}
                v-model:value={filters.status}
                allowClear
                placeholder="全部状态"
                style={{ width: "100%" }}
              >
                <SelectOption value="">全部状态</SelectOption>
                {Object.entries(CONTROL_STATUS).map(([value, option]) => (
                  <SelectOption key={value} value={value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </div>
          </FormItem>
          <FormItem>
            <Space>
              <Button type="primary" onClick={onSearch}>
                查询
              </Button>
              <Button onClick={onReset}>重置</Button>
            </Space>
          </FormItem>
        </Form>
        <div class="tableWrap">
          <Table
            columns={overviewColumns}
            dataSource={records.value}
            rowKey={(row: UnitInventoryRowVO) => row.unit.id}
            pagination={false}
            loading={overviewLoading.value}
            scroll={{ x: TABLE_SCROLL_X }}
            tableLayout="fixed"
          />
        </div>
      </>
    );

    const objectRiskTags = (record: RiskObjectVO): JSX.Element => (
      <div class={styles.objectRiskSummary}>
        <span class={styles.riskPair}>
          <span class={styles.riskLabel}>固有</span>
          <RiskLevelTag level={record.innateLevel} />
        </span>
        <span class={styles.riskPair}>
          <span class={styles.riskLabel}>现状</span>
          <RiskLevelTag level={record.controlLevel} />
        </span>
      </div>
    );

    const objectMeasures = (record: RiskObjectVO): ControlMeasureVO[] => objectMeasureMap.value[record.id] ?? [];

    const measureStatusMeta = (status: ControlMeasureVO["execStatus"]): { label: string; className: string } => {
      if (status === "DONE") return { label: "已执行", className: styles.measureChipDone };
      if (status === "OVERDUE") return { label: "已逾期", className: styles.measureChipOverdue };
      if (status === "EXECUTING") return { label: "执行中", className: styles.measureChipDoing };
      return { label: "待执行", className: styles.measureChipPending };
    };

    const measureSummary = (record: RiskObjectVO): JSX.Element => {
      const items = objectMeasures(record);
      if (items.length === 0) {
        return (
          <div class={styles.measureSummary}>
            <p class={styles.measureSummaryTitle}>暂未配置措施</p>
            <p class={styles.measureSummaryEmpty}>尚未配置管控措施，请点击“配置措施”开始配置</p>
          </div>
        );
      }
      return (
        <div class={styles.measureSummary}>
          <p class={styles.measureSummaryTitle}>已配置措施（{items.length}条）</p>
          <div class={styles.measureTags}>
            {items.slice(0, 4).map((measure) => {
              const meta = measureStatusMeta(measure.execStatus);
              const measureText = `【${measure.controlType || "--"}】${measure.content || "--"}`;
              return (
                <span key={measure.id} class={[styles.measureChip, meta.className].join(" ")} title={`${meta.label} ${measureText}`}>
                  <span class={styles.measureStatus}>{meta.label}</span>
                  <span class={styles.measureText}>{measureText}</span>
                </span>
              );
            })}
            {items.length > 4 && <span class={styles.measureMore}>{`+${items.length - 4}`}</span>}
          </div>
        </div>
      );
    };

    const renderMeasureAction = (object: RiskObjectVO): JSX.Element => {
      const disabled = !canConfigureObjectMeasures(object);
      const reason = measureConfigDisabledReason(object);
      const button = (
        <Button
          class={styles.objectAction}
          type="primary"
          size="small"
          disabled={disabled}
          onClick={() => {
            void openMeasureModal(object);
          }}
        >
          {objectMeasures(object).length > 0 ? "编辑措施" : "配置措施"}
        </Button>
      );
      if (!disabled || !reason) return button;
      return (
        <Tooltip title={reason}>
          <span class={styles.objectActionWrap}>{button}</span>
        </Tooltip>
      );
    };

    const detail = (): JSX.Element => {
      if (!detailLoaded.value || loading.value) {
        return <Card loading />;
      }
      return unit.value ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <Descriptions column={3} size="small">
              <DescriptionsItem label="单元名称">{unit.value.name}</DescriptionsItem>
              <DescriptionsItem label="所属区域">{unit.value.zoneName}</DescriptionsItem>
              <DescriptionsItem label="单元类型">{unit.value.unitType}</DescriptionsItem>
              <DescriptionsItem label="风险对象">{objects.value.length}</DescriptionsItem>
            </Descriptions>
          </div>
          {objects.value.length > 0 ? (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {objects.value.map((object) => (
                <Card key={object.id} class={styles.objectCard}>
                  <div class={styles.objectHeader}>
                    <div class={styles.objectMain}>
                      <div class={styles.objectTitleLine}>
                        <strong class={styles.objectName}>{object.name}</strong>
                        {objectRiskTags(object)}
                      </div>
                      <div class={styles.objectMeta}>
                        <span>危险源：{object.hazardDesc || "--"}</span>
                        <span class={styles.metaSeparator}>·</span>
                        <span>责任人员：{object.responsibleUser || "--"}</span>
                      </div>
                    </div>
                    {renderMeasureAction(object)}
                  </div>
                  {measureSummary(object)}
                </Card>
              ))}
            </Space>
          ) : (
            <Card size="small">
              <p>当前单元没有风险对象</p>
            </Card>
          )}
          <Modal
            title={`配置管控措施 - ${activeObject.value?.name ?? ""}`}
            open={measureModalVisible.value}
            width={780}
            confirmLoading={modalSubmitting.value}
            okText="保存措施"
            cancelText="取消"
            onOk={() => {
              void submit();
            }}
            onCancel={() => {
              measureModalVisible.value = false;
              activeObject.value = null;
              objectId.value = "";
            }}
          >
            {activeObject.value && (
              <>
                <div style={{ background: "#f5f7fa", padding: 12, marginBottom: 16, borderRadius: 4, lineHeight: "24px" }}>
                  <div>
                    <strong>风险对象：</strong>
                    {activeObject.value.name}
                  </div>
                  <div>
                    <strong>危险源：</strong>
                    {activeObject.value.hazardDesc || "--"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <strong>风险等级：</strong>
                    {objectRiskTags(activeObject.value)}
                  </div>
                </div>
                <MeasureCardList
                  modelValue={measures.value}
                  showAiGenerate
                  aiGenerateLoading={aiMeasureGenerating.value}
                  onUpdate:modelValue={(v: MeasureFormItem[]) => {
                    measures.value = v;
                  }}
                  onAiGenerate={() => {
                    void generateAiMeasures();
                  }}
                />
              </>
            )}
          </Modal>
        </>
      ) : (
        <Card>
          <p>未找到风险单元</p>
        </Card>
      );
    };

    const detailFooter = (): JSX.Element => (
      <div class={formStyles.footerActions}>
        <Button
          onClick={() => {
            void backToOverview();
          }}
        >
          返回列表
        </Button>
      </div>
    );

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-content": () => (detailMode.value ? detail() : overview()),
          "footer-page": () =>
            detailMode.value ? (
              detailFooter()
            ) : (
              <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
            ),
        }}
      />
    );
  },
});

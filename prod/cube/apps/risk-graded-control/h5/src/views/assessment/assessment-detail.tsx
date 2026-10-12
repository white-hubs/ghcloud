import { Button, Cell, CellGroup, Empty, Loading, Popup, Tag, showSuccessToast, showToast } from "vant";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  createAssessment,
  getUnit,
  listObjectAssessments,
  pageAssessmentMethods,
  pageRiskObjects,
  patchAssessment,
} from "@ghcloud/cube-services-client/risk-graded-control.client";

import { Bar } from "@/components/bar/bar";
import { RiskLevelBadge } from "@/components/risk-level-badge/risk-level-badge";
import { RISK_LEVEL_LABEL } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { AssessmentMethodVO, ObjectStatus, RiskLevel, RiskObjectVO, UnitVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { calcAssessmentTotalScore, formatAssessmentScore } from "@/utils/assessment-score";
import {
  mapAssessmentMethodFromApi,
  mapRiskLevelFromApi,
  mapRiskObjectFromApi,
  mapUnitFromApi,
  type RiskAssessmentRecordApiVO,
  type RiskObjectApiVO,
} from "@/utils/risk-control-mapper";

import styles from "./assessment-detail.module.less";

type AssessmentType = "INHERENT" | "CONTROL";

interface ObjectAssessmentRecords {
  inherent?: RiskAssessmentRecordApiVO;
  control?: RiskAssessmentRecordApiVO;
  inherentDraft?: RiskAssessmentRecordApiVO;
  controlDraft?: RiskAssessmentRecordApiVO;
}

const ASSESSMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  INHERENT: "固有风险",
  CONTROL: "控制风险",
};

const STATUS_LABEL: Record<string, string> = {
  INHERENT_EVAL: "待固有评估",
  INNATE_EVAL: "待固有评估",
  CONTROL_EVAL: "待控制评估",
  RE_EVAL: "重新评估",
  CONTROL_SET: "评估已完成",
  EXECUTING: "评估已完成",
  ACTIVE: "评估已完成",
};

const ASSESSMENT_STATUS: Record<"PENDING" | "ASSESSING" | "COMPLETED", { label: string; tagType: "warning" | "primary" | "success" }> = {
  PENDING: { label: "待评估", tagType: "warning" },
  ASSESSING: { label: "评估中", tagType: "primary" },
  COMPLETED: { label: "已完成", tagType: "success" },
};

const RISK_LEVEL_ORDER: RiskLevel[] = ["MAJOR", "SIGNIFICANT", "GENERAL", "LOW"];

function parseScoreDetail(value: unknown): Record<string, number> | undefined {
  if (!value || typeof value !== "string") return undefined;
  try {
    const parsed = JSON.parse(value) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function shouldHideHistoryForCurrentCycle(status: ObjectStatus, type: AssessmentType): boolean {
  if (type === "INHERENT") {
    return status === "INHERENT_EVAL" || status === "INNATE_EVAL" || status === "RE_EVAL";
  }
  return status === "INHERENT_EVAL" || status === "INNATE_EVAL" || status === "RE_EVAL" || status === "CONTROL_EVAL";
}

function editableTypeForStatus(status?: ObjectStatus): AssessmentType | undefined {
  if (status === "INHERENT_EVAL" || status === "INNATE_EVAL" || status === "RE_EVAL") return "INHERENT";
  if (status === "CONTROL_EVAL") return "CONTROL";
  return undefined;
}

function determineRiskLevel(method: AssessmentMethodVO, score?: number): RiskLevel | undefined {
  if (score == null) return undefined;
  if (method.code === "LEC") {
    if (score >= 200) return "MAJOR";
    if (score >= 70) return "SIGNIFICANT";
    if (score >= 20) return "GENERAL";
    return "LOW";
  }
  if (method.code === "MES") {
    if (score >= 180) return "MAJOR";
    if (score >= 90) return "SIGNIFICANT";
    if (score >= 50) return "GENERAL";
    return "LOW";
  }
  if (score >= 20) return "MAJOR";
  if (score >= 10) return "SIGNIFICANT";
  if (score >= 5) return "GENERAL";
  return "LOW";
}

function riskTag(level?: RiskLevel): JSX.Element {
  return <RiskLevelBadge level={level} />;
}

function scoreText(scores?: Record<string, number>): string {
  if (!scores || Object.keys(scores).length === 0) return "";
  return Object.entries(scores)
    .map(([code, value]) => `${code}:${value}`)
    .join(" ");
}

function maxRiskLevel(levels: Array<RiskLevel | undefined>): RiskLevel | undefined {
  for (const level of RISK_LEVEL_ORDER) {
    if (levels.includes(level)) return level;
  }
  return undefined;
}

export const AssessmentDetailPage = defineComponent({
  name: "AssessmentDetailPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const unit = ref<UnitVO | null>(null);
    const objects = ref<RiskObjectVO[]>([]);
    const methods = ref<AssessmentMethodVO[]>([]);
    const recordsMap = ref<Record<string, ObjectAssessmentRecords>>({});
    const inherentScoresMap = ref<Record<string, Record<string, number>>>({});
    const controlScoresMap = ref<Record<string, Record<string, number>>>({});
    const loading = ref(false);
    const submitting = ref(false);
    const popupVisible = ref(false);
    const activeObject = ref<RiskObjectVO | null>(null);
    const modalInherentMethodId = ref("");
    const modalControlMethodId = ref("");

    const unitId = computed(() => {
      const raw = route.query.unitId;
      return Array.isArray(raw) ? (raw[0] ?? "") : String(raw ?? "");
    });

    const editableType = computed(() => editableTypeForStatus(activeObject.value?.status));
    const modalInherentMethod = computed(() => methods.value.find((item) => item.id === modalInherentMethodId.value) ?? null);
    const modalControlMethod = computed(() => methods.value.find((item) => item.id === modalControlMethodId.value) ?? null);

    const methodForType = (type: AssessmentType): AssessmentMethodVO | null =>
      type === "INHERENT" ? modalInherentMethod.value : modalControlMethod.value;

    const methodNameById = (methodId?: string | number): string => {
      if (methodId == null || methodId === "") return "--";
      const id = String(methodId);
      return methods.value.find((item) => item.id === id)?.name ?? "--";
    };

    const draftAssessmentRecord = (objectId: string, type: AssessmentType): RiskAssessmentRecordApiVO | undefined => {
      return type === "INHERENT" ? recordsMap.value[objectId]?.inherentDraft : recordsMap.value[objectId]?.controlDraft;
    };

    const latestAssessmentRecord = (objectId: string, type: AssessmentType): RiskAssessmentRecordApiVO | undefined => {
      return type === "INHERENT" ? recordsMap.value[objectId]?.inherent : recordsMap.value[objectId]?.control;
    };

    const assessmentRecord = (object: RiskObjectVO, type: AssessmentType): RiskAssessmentRecordApiVO | undefined => {
      const draft = draftAssessmentRecord(object.id, type);
      if (draft) return draft;
      if (shouldHideHistoryForCurrentCycle(object.status, type)) return undefined;
      return latestAssessmentRecord(object.id, type);
    };

    const getScores = (objectId: string, type: AssessmentType): Record<string, number> => {
      const target = type === "INHERENT" ? inherentScoresMap : controlScoresMap;
      if (!target.value[objectId]) {
        target.value[objectId] = {};
      }
      return target.value[objectId];
    };

    const setScores = (objectId: string, type: AssessmentType, scores: Record<string, number>): void => {
      if (type === "INHERENT") {
        inherentScoresMap.value = { ...inherentScoresMap.value, [objectId]: scores };
      } else {
        controlScoresMap.value = { ...controlScoresMap.value, [objectId]: scores };
      }
    };

    const pickScoresForMethod = (scores: Record<string, number>, method: AssessmentMethodVO): Record<string, number> => {
      const picked: Record<string, number> = {};
      method.dimensions.forEach((dimension) => {
        if (scores[dimension.code] != null) {
          picked[dimension.code] = scores[dimension.code];
        }
      });
      return picked;
    };

    const calcTotal = (objectId: string, type: AssessmentType, method: AssessmentMethodVO): number | undefined => {
      const scores = pickScoresForMethod(getScores(objectId, type), method);
      const complete = method.dimensions.length > 0 && method.dimensions.every((dimension) => scores[dimension.code] != null);
      return complete ? calcAssessmentTotalScore(scores, method.dimensions) : undefined;
    };

    const assessmentLevel = (object: RiskObjectVO, type: AssessmentType): RiskLevel | undefined => {
      if (shouldHideHistoryForCurrentCycle(object.status, type)) {
        return mapRiskLevelFromApi(assessmentRecord(object, type)?.riskLevel);
      }
      return (
        mapRiskLevelFromApi(assessmentRecord(object, type)?.riskLevel) ?? (type === "INHERENT" ? object.innateLevel : object.controlLevel)
      );
    };

    const assessmentLevelLabel = (object: RiskObjectVO, type: AssessmentType): string => {
      const level = assessmentLevel(object, type);
      return level ? RISK_LEVEL_LABEL[level] : "未评估";
    };

    const unitInherentRiskLevel = computed(
      () => maxRiskLevel(objects.value.map((object) => assessmentLevel(object, "INHERENT"))) ?? unit.value?.inherentRiskLevel,
    );
    const unitControlRiskLevel = computed(
      () => maxRiskLevel(objects.value.map((object) => assessmentLevel(object, "CONTROL"))) ?? unit.value?.controlRiskLevel,
    );

    const resolveObjectAssessmentStatus = (status: ObjectStatus): keyof typeof ASSESSMENT_STATUS => {
      if (status === "INHERENT_EVAL" || status === "INNATE_EVAL" || status === "RE_EVAL") return "PENDING";
      if (status === "CONTROL_EVAL") return "ASSESSING";
      return "COMPLETED";
    };

    const resolveObjectMethodName = (object: RiskObjectVO): string => {
      const inherentMethodId = assessmentRecord(object, "INHERENT")?.methodId;
      const controlMethodId = assessmentRecord(object, "CONTROL")?.methodId;
      if (inherentMethodId && controlMethodId && String(inherentMethodId) !== String(controlMethodId)) {
        return `${methodNameById(inherentMethodId)} / ${methodNameById(controlMethodId)}`;
      }
      return methodNameById(inherentMethodId ?? controlMethodId);
    };

    const loadAssessments = async (targetObjects: RiskObjectVO[]): Promise<void> => {
      const nextRecords: Record<string, ObjectAssessmentRecords> = {};
      const nextInherentScores: Record<string, Record<string, number>> = {};
      const nextControlScores: Record<string, Record<string, number>> = {};
      await Promise.all(
        targetObjects.map(async (obj) => {
          const page = await useAuthRequest(() => listObjectAssessments(obj.id));
          const inherent = page.records.find((record) => record.assessmentType === "INHERENT");
          const control = page.records.find((record) => record.assessmentType === "CONTROL");
          const inherentDraft = page.records.find((record) => record.assessmentType === "INHERENT" && record.submitted === false);
          const controlDraft = page.records.find((record) => record.assessmentType === "CONTROL" && record.submitted === false);
          const displayInherent = inherentDraft ?? (shouldHideHistoryForCurrentCycle(obj.status, "INHERENT") ? undefined : inherent);
          const displayControl = controlDraft ?? (shouldHideHistoryForCurrentCycle(obj.status, "CONTROL") ? undefined : control);
          nextRecords[obj.id] = { inherent, control, inherentDraft, controlDraft };
          const inherentScores = displayInherent?.dimensionScores ?? parseScoreDetail(displayInherent?.scoreDetailJson);
          const controlScores = displayControl?.dimensionScores ?? parseScoreDetail(displayControl?.scoreDetailJson);
          if (inherentScores) nextInherentScores[obj.id] = inherentScores;
          if (controlScores) nextControlScores[obj.id] = controlScores;
        }),
      );
      recordsMap.value = nextRecords;
      inherentScoresMap.value = nextInherentScores;
      controlScoresMap.value = nextControlScores;
    };

    const loadData = async (): Promise<void> => {
      if (!unitId.value) return;
      loading.value = true;
      try {
        const [unitVo, methodPage] = await Promise.all([
          useAuthRequest(() => getUnit(unitId.value)),
          useAuthRequest(() => pageAssessmentMethods({ pageNumber: 1, pageSize: 500, enabled: true })),
        ]);
        unit.value = mapUnitFromApi(unitVo);
        methods.value = methodPage.records.map(mapAssessmentMethodFromApi);
        const unitObjects = ((unitVo as { objects?: RiskObjectApiVO[] }).objects ?? []).map(mapRiskObjectFromApi);
        let objectList = unitObjects;
        if (objectList.length === 0) {
          const objectPage = await useAuthRequest(() =>
            pageRiskObjects({
              unitId: unitId.value,
              pageNumber: 1,
              pageSize: 500,
            }),
          );
          objectList = objectPage.records.map(mapRiskObjectFromApi);
        }
        objects.value = objectList;
        await loadAssessments(objectList);
      } catch (e) {
        showApiError(e);
      } finally {
        loading.value = false;
      }
    };

    watch(unitId, () => void loadData(), { immediate: true });

    onMounted(() => {
      document.title = "风险评估详情";
    });

    const resolveMethodId = (object: RiskObjectVO, type: AssessmentType): string => {
      const methodId = assessmentRecord(object, type)?.methodId;
      if (methodId != null && methods.value.some((item) => item.id === String(methodId))) {
        return String(methodId);
      }
      return methods.value[0]?.id ?? "";
    };

    const openAssessment = (object: RiskObjectVO): void => {
      activeObject.value = object;
      modalInherentMethodId.value = resolveMethodId(object, "INHERENT");
      modalControlMethodId.value = resolveMethodId(object, "CONTROL");
      popupVisible.value = true;
    };

    const onMethodChange = (type: AssessmentType, methodId: string): void => {
      if (type === "INHERENT") {
        modalInherentMethodId.value = methodId;
      } else {
        modalControlMethodId.value = methodId;
      }
      if (!activeObject.value || editableType.value !== type) return;
      setScores(activeObject.value.id, type, {});
    };

    const updateScore = (type: AssessmentType, dimensionCode: string, value: number): void => {
      const object = activeObject.value;
      if (!object || editableType.value !== type) return;
      const current = getScores(object.id, type);
      setScores(object.id, type, { ...current, [dimensionCode]: value });
    };

    const validateScores = (type: AssessmentType): boolean => {
      const object = activeObject.value;
      const method = methodForType(type);
      if (!object || !method) {
        showToast(`请选择${ASSESSMENT_TYPE_LABEL[type]}评估方法`);
        return false;
      }
      const scores = pickScoresForMethod(getScores(object.id, type), method);
      const missing = method.dimensions.some((dimension) => scores[dimension.code] == null);
      if (missing) {
        showToast(`请完善${ASSESSMENT_TYPE_LABEL[type]}评估维度`);
        return false;
      }
      return true;
    };

    const submitAssessment = async (): Promise<void> => {
      const object = activeObject.value;
      const type = editableType.value;
      if (!object || !type) {
        popupVisible.value = false;
        return;
      }
      const method = methodForType(type);
      if (!method || !validateScores(type)) return;
      submitting.value = true;
      try {
        const scores = pickScoresForMethod(getScores(object.id, type), method);
        const payload = {
          objectId: object.id,
          unitId: unitId.value,
          methodId: method.id,
          assessmentType: type,
          dimensionScores: scores,
          totalScore: calcAssessmentTotalScore(scores, method.dimensions),
          submitted: true,
        };
        const draftId = draftAssessmentRecord(object.id, type)?.id;
        if (draftId) {
          await useAuthRequest(() => patchAssessment(draftId, payload));
        } else {
          await useAuthRequest(() => createAssessment(payload));
        }
        showSuccessToast(`${ASSESSMENT_TYPE_LABEL[type]}评估已提交`);
        popupVisible.value = false;
        await loadData();
      } catch (e) {
        showApiError(e);
      } finally {
        submitting.value = false;
      }
    };

    const renderMethodTabs = (type: AssessmentType): JSX.Element => {
      const method = methodForType(type);
      const methodId = type === "INHERENT" ? modalInherentMethodId.value : modalControlMethodId.value;
      const editable = editableType.value === type;
      if (!editable) {
        return (
          <CellGroup inset class={styles.methodSummary}>
            <Cell title="评估方法" label={method ? `${method.name}（${method.formula || "--"}）` : "暂无方法"} />
          </CellGroup>
        );
      }
      return (
        <div class={styles.methodList}>
          {methods.value.map((item) => (
            <button
              key={item.id}
              type="button"
              class={[styles.methodButton, methodId === item.id ? styles.methodButtonActive : ""].join(" ")}
              onClick={() => onMethodChange(type, item.id)}
            >
              <span>{item.name || "评估方法"}</span>
              <small>{item.formula || "--"}</small>
            </button>
          ))}
        </div>
      );
    };

    const renderDimensionForm = (type: AssessmentType): JSX.Element => {
      const object = activeObject.value;
      const method = methodForType(type);
      if (!object || !method) return <Empty description="暂无评估方法" />;
      const editable = editableType.value === type;
      const scores = getScores(object.id, type);
      const total = calcTotal(object.id, type, method);
      const level = determineRiskLevel(method, total) ?? assessmentLevel(object, type);
      return (
        <div class={styles.dimensionPanel}>
          {method.dimensions.map((dimension) => (
            <div key={`${type}-${dimension.code}`} class={styles.dimensionBlock}>
              <div class={styles.dimensionTitle}>
                <span>{dimension.name}</span>
                <em>{dimension.code}</em>
              </div>
              <div class={styles.optionGrid}>
                {dimension.options.map((option) => {
                  const active = scores[dimension.code] === option.value;
                  return (
                    <button
                      key={`${type}-${dimension.code}-${option.value}`}
                      type="button"
                      class={[styles.optionButton, active ? styles.optionButtonActive : ""].join(" ")}
                      disabled={!editable}
                      onClick={() => updateScore(type, dimension.code, option.value)}
                    >
                      <span>{option.label}</span>
                      <strong>{option.value}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div class={styles.scorePanel}>
            <div>
              <span>总分值</span>
              <strong>{formatAssessmentScore(total)}</strong>
            </div>
            <div>
              <span>判定等级</span>
              <div class={styles.riskLevelValue}>{riskTag(level)}</div>
            </div>
          </div>
          {level && (
            <div class={styles.ruleHint}>
              {method.levelRules.find((rule) => rule.level === level)?.requirement || RISK_LEVEL_LABEL[level]}
            </div>
          )}
        </div>
      );
    };

    const assessmentSummary = (object: RiskObjectVO, type: AssessmentType): JSX.Element => {
      const record = assessmentRecord(object, type);
      const scores = type === "INHERENT" ? inherentScoresMap.value[object.id] : controlScoresMap.value[object.id];
      const detail = scoreText(scores);
      const level = assessmentLevel(object, type);
      return (
        <div class={styles.assessmentSummary}>
          {riskTag(level)}
          {(detail || record?.totalScore != null) && (
            <small>
              {detail}
              {record?.totalScore != null ? ` = ${formatAssessmentScore(record.totalScore)}` : ""}
            </small>
          )}
        </div>
      );
    };

    const assessmentStatusTag = (object: RiskObjectVO): JSX.Element => {
      const meta = ASSESSMENT_STATUS[resolveObjectAssessmentStatus(object.status)];
      return (
        <Tag type={meta.tagType} plain>
          {meta.label}
        </Tag>
      );
    };

    const renderObjectCard = (object: RiskObjectVO): JSX.Element => {
      const completed = resolveObjectAssessmentStatus(object.status) === "COMPLETED";
      return (
        <div key={object.id} class={styles.objectCard}>
          <div class={styles.objectHeader}>
            <div>
              <div class={styles.objectName}>{object.name}</div>
              <div class={styles.objectStatus}>{STATUS_LABEL[object.status] ?? object.status}</div>
            </div>
            {assessmentStatusTag(object)}
          </div>
          <div class={styles.objectDesc}>
            <span>危险源</span>
            <p>{object.hazardDesc || "--"}</p>
          </div>
          <div class={styles.objectMethod}>
            <span>评估方法</span>
            <strong>{resolveObjectMethodName(object)}</strong>
          </div>
          <div class={styles.riskGrid}>
            <div class={styles.riskItem}>
              <span>固有评估</span>
              {assessmentSummary(object, "INHERENT")}
            </div>
            <div class={styles.riskItem}>
              <span>控制评估</span>
              {assessmentSummary(object, "CONTROL")}
            </div>
          </div>
          <div class={styles.objectActions}>
            <Button size="small" type="primary" plain onClick={() => openAssessment(object)}>
              {completed ? "查看" : "评估"}
            </Button>
          </div>
        </div>
      );
    };

    const renderAssessmentSection = (type: AssessmentType): JSX.Element => (
      <section class={styles.assessmentSection}>
        <div class={styles.sectionHeader}>
          <h4>{ASSESSMENT_TYPE_LABEL[type]}评估</h4>
          {editableType.value === type ? <Tag type="primary">可编辑</Tag> : <Tag>只读</Tag>}
        </div>
        {type === "CONTROL" && <p class={styles.sectionHint}>在现有管控措施基础上重新评估</p>}
        {renderMethodTabs(type)}
        {renderDimensionForm(type)}
      </section>
    );

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="风险评估详情" isShowRight={false} />
        {loading.value ? (
          <div class={styles.loadingBox}>
            <Loading type="spinner">加载中...</Loading>
          </div>
        ) : unit.value && methods.value.length > 0 ? (
          <>
            <div class={styles.unitCard}>
              <div class={styles.unitName}>{unit.value.name}</div>
              <div class={styles.metaGrid}>
                <div>
                  <span>编号</span>
                  <strong>{unit.value.code || "--"}</strong>
                </div>
                <div>
                  <span>单元类型</span>
                  <strong>{unit.value.unitType || "--"}</strong>
                </div>
                <div>
                  <span>所属区域</span>
                  <strong>{unit.value.zoneName || "--"}</strong>
                </div>
                <div>
                  <span>风险对象</span>
                  <strong>{objects.value.length}</strong>
                </div>
                <div>
                  <span>固有风险等级</span>
                  <div class={styles.riskLevelValue}>{riskTag(unitInherentRiskLevel.value)}</div>
                </div>
                <div>
                  <span>现状风险等级</span>
                  <div class={styles.riskLevelValue}>{riskTag(unitControlRiskLevel.value)}</div>
                </div>
              </div>
            </div>
            {objects.value.length ? (
              <div class={styles.objectList}>{objects.value.map(renderObjectCard)}</div>
            ) : (
              <Empty description="暂无风险对象" />
            )}
          </>
        ) : (
          <Empty description="未找到评估单元或评估方法">
            <Button size="small" type="primary" onClick={() => router.push({ name: "assessmentList" })}>
              返回列表
            </Button>
          </Empty>
        )}

        <Popup v-model:show={popupVisible.value} round position="bottom" class={styles.assessmentPopup}>
          <div class={styles.popupHeader}>
            <div>
              <h3>风险评估 - {activeObject.value?.name ?? "--"}</h3>
              <p>
                {editableType.value ? `当前需完成${ASSESSMENT_TYPE_LABEL[editableType.value]}评估` : "当前对象评估已完成，可查看评估结果"}
              </p>
            </div>
            {activeObject.value && assessmentStatusTag(activeObject.value)}
          </div>
          {activeObject.value && (
            <>
              <CellGroup inset class={styles.objectInfo}>
                <Cell title="风险对象" label={activeObject.value.name || "--"} />
                <Cell title="危险源" label={activeObject.value.hazardDesc || "--"} />
                <Cell title="事故类型" label={activeObject.value.accidentTypes.join("、") || "--"} />
                <Cell title="当前状态" label={STATUS_LABEL[activeObject.value.status] ?? activeObject.value.status} />
              </CellGroup>
              {renderAssessmentSection("INHERENT")}
              {renderAssessmentSection("CONTROL")}
              {!editableType.value && (
                <div class={styles.completeHint}>
                  当前对象评估已完成，固有风险为 {assessmentLevelLabel(activeObject.value, "INHERENT")}，控制风险为{" "}
                  {assessmentLevelLabel(activeObject.value, "CONTROL")}。
                </div>
              )}
            </>
          )}
          <div class={[styles.popupActions, editableType.value ? styles.popupActionsTwo : ""].join(" ")}>
            <Button block onClick={() => (popupVisible.value = false)}>
              {editableType.value ? "取消" : "关闭"}
            </Button>
            {editableType.value && (
              <Button block type="primary" loading={submitting.value} onClick={() => void submitAssessment()}>
                提交评估
              </Button>
            )}
          </div>
        </Popup>
      </div>
    );
  },
});

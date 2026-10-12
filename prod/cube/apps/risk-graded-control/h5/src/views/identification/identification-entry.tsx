import { Steps, Step, Field, Button, ActionSheet, Tag, showSuccessToast, showToast, Loading } from "vant";
import { defineComponent, ref, computed, onMounted, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { RiskAiIdentificationObjectDraftVO } from "@ghcloud/cube-service-interface/risk-graded-control";
import {
  generateRiskObjectByAiPhoto,
  getUnit,
  pageRiskObjects,
  reviseRiskObjectByAiPhoto,
  submitUnitIdentification,
} from "@ghcloud/cube-services-client/risk-graded-control.client";

import { uploadRiskControlFile } from "@/api/upload-risk-file";
import { Bar } from "@/components/bar/bar";
import { ACCIDENT_TYPES, FILE_SCENE_CODE } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { UnitVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { consumeAssetPickResult } from "@/utils/asset-pick-result";
import { enrichUnitVoFromApi, loadAreaAndUnitTypeNameMaps } from "@/utils/hydrate-unit-display";
import { enrichRiskObjectsWithAssetNames } from "@/utils/load-property-assets";
import { readCurrentUserId } from "@/utils/read-current-user";
import { mapIdentificationObjectToApi, mapRiskObjectFromApi, mapUnitFromApi } from "@/utils/risk-control-mapper";

import styles from "./identification-entry.module.less";

const MAX_OBJECTS = 5;

interface RiskObjectForm {
  id: string;
  name: string;
  assetId: string;
  assetName: string;
  hazardDesc: string;
  accidentTypes: string[];
  cause: string;
  triggerFactors: string;
  emergencyMeasures: string;
  responsibleUser: string;
}

let objectSeq = 1;
type AiPhotoMode = "create" | "revise";
type AiRiskObjectPhotoResult = {
  recognized?: boolean;
  noRiskReason?: string;
  object?: RiskAiIdentificationObjectDraftVO | null;
};
type NativePhotoFile = {
  id?: string | number;
  fileId?: string | number;
  path?: string;
};

const emptyObject = (unit?: UnitVO | null): RiskObjectForm => ({
  id: `new-${objectSeq++}`,
  name: "",
  assetId: "",
  assetName: "",
  hazardDesc: "",
  accidentTypes: [],
  cause: "",
  triggerFactors: "",
  emergencyMeasures: "",
  responsibleUser: unit?.responsibleUser && unit.responsibleUser !== "--" ? unit.responsibleUser : (unit?.responsibleUserId ?? ""),
});

export const IdentificationEntryPage = defineComponent({
  name: "IdentificationEntryPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const stepActive = ref(0);
    const accidentSheetVisible = ref(false);
    const editingObjectIdx = ref(-1);
    const unitLoading = ref(false);
    const objectsLoading = ref(false);
    const unit = ref<UnitVO | null>(null);
    const deletedObjects = ref<RiskObjectForm[]>([]);
    const aiPhotoInputRef = ref<HTMLInputElement | null>(null);
    const aiPhotoMode = ref<AiPhotoMode>("create");
    const aiPhotoTargetIdx = ref(-1);
    const aiGeneratingKey = ref("");
    const loadedUnitId = ref("");
    let loadRequestSeq = 0;

    const unitId = computed(() => (route.query.unitId as string) ?? "");
    const isReIdentifyMode = computed(() => unit.value?.identifyStatus === "PENDING_REVIEW");
    const isReviewedUnit = computed(() => unit.value?.identifyStatus === "REVIEWED");
    const canAddObject = computed(() => Boolean(unit.value) && !isReIdentifyMode.value && !isReviewedUnit.value);
    const emptyHint = computed(() => {
      if (isReviewedUnit.value) return "该风险单元已审核完成，需到下次辨识周期后再发起辨识";
      if (isReIdentifyMode.value) return "该风险单元审核中，当前没有可再次辨识的退回对象";
      return "请添加风险对象后提交辨识";
    });

    const riskObjects = ref<RiskObjectForm[]>([emptyObject()]);

    const applyRiskObjects = (mappedUnit: UnitVO, existing: ReturnType<typeof mapRiskObjectFromApi>[]): void => {
      const editableObjects =
        mappedUnit.identifyStatus === "PENDING_REVIEW"
          ? existing.filter((o) => o.status === "DRAFT")
          : mappedUnit.identifyStatus === "REVIEWED"
            ? []
            : existing;
      if (editableObjects.length > 0) {
        riskObjects.value = editableObjects.map((o) => ({
          id: o.id,
          name: o.name,
          assetId: o.assetId ?? "",
          assetName: o.assetName ?? "",
          hazardDesc: o.hazardDesc,
          accidentTypes: [...o.accidentTypes],
          cause: o.cause,
          triggerFactors: o.triggerFactors ?? "",
          emergencyMeasures: o.emergencyMeasures,
          responsibleUser: o.responsibleUserId || mappedUnit.responsibleUserId,
        }));
      } else if (mappedUnit.identifyStatus !== "PENDING_REVIEW" && mappedUnit.identifyStatus !== "REVIEWED") {
        riskObjects.value = [emptyObject(mappedUnit)];
      } else {
        riskObjects.value = [];
      }
    };

    const resetEntryState = (): void => {
      stepActive.value = 0;
      accidentSheetVisible.value = false;
      editingObjectIdx.value = -1;
      unit.value = null;
      deletedObjects.value = [];
      riskObjects.value = [emptyObject()];
      aiPhotoMode.value = "create";
      aiPhotoTargetIdx.value = -1;
      aiGeneratingKey.value = "";
      loadedUnitId.value = "";
    };

    const isCurrentLoad = (requestSeq: number, targetUnitId: string): boolean =>
      requestSeq === loadRequestSeq && targetUnitId === unitId.value;

    const loadRiskObjects = async (
      targetUnitId: string,
      requestSeq: number,
      unitVo: Awaited<ReturnType<typeof getUnit>>,
      mappedUnit: UnitVO,
    ): Promise<void> => {
      objectsLoading.value = true;
      try {
        deletedObjects.value = [];
        const riskPage = await useAuthRequest(() =>
          pageRiskObjects({ unitId: targetUnitId, pageNumber: 1, pageSize: 500 }).catch(() => ({ records: [] })),
        );
        if (!isCurrentLoad(requestSeq, targetUnitId)) return;
        const existing = (unitVo.objects ?? riskPage.records ?? []).map(mapRiskObjectFromApi);
        await enrichRiskObjectsWithAssetNames(existing);
        if (!isCurrentLoad(requestSeq, targetUnitId)) return;
        applyRiskObjects(mappedUnit, existing);
        loadedUnitId.value = targetUnitId;
      } catch (e) {
        if (isCurrentLoad(requestSeq, targetUnitId)) {
          showApiError(e);
        }
      } finally {
        if (isCurrentLoad(requestSeq, targetUnitId)) {
          objectsLoading.value = false;
        }
      }
    };

    const loadUnit = async (targetUnitId: string, requestSeq: number): Promise<void> => {
      if (!targetUnitId) return;
      unitLoading.value = true;
      try {
        const unitVo = await useAuthRequest(() => getUnit(targetUnitId));
        if (!isCurrentLoad(requestSeq, targetUnitId)) return;
        let mappedUnit = mapUnitFromApi(unitVo);
        const needsMaps = !mappedUnit.zoneName || mappedUnit.zoneName === "--" || !mappedUnit.unitType || mappedUnit.unitType === "--";
        if (needsMaps) {
          const maps = await loadAreaAndUnitTypeNameMaps(useAuthRequest);
          if (!isCurrentLoad(requestSeq, targetUnitId)) return;
          mappedUnit = enrichUnitVoFromApi(unitVo, mappedUnit, maps);
        } else {
          mappedUnit = enrichUnitVoFromApi(unitVo, mappedUnit);
        }
        unit.value = mappedUnit;
        void loadRiskObjects(targetUnitId, requestSeq, unitVo, mappedUnit);
      } catch (e) {
        if (isCurrentLoad(requestSeq, targetUnitId)) {
          showApiError(e);
        }
      } finally {
        if (isCurrentLoad(requestSeq, targetUnitId)) {
          unitLoading.value = false;
        }
      }
    };

    const loadData = async (targetUnitId = unitId.value): Promise<void> => {
      const normalizedUnitId = String(targetUnitId || "");
      loadRequestSeq += 1;
      const requestSeq = loadRequestSeq;
      resetEntryState();
      if (!normalizedUnitId) return;
      await loadUnit(normalizedUnitId, requestSeq);
    };

    const applyAssetPickResult = (): void => {
      const result = consumeAssetPickResult();
      if (!result) return;
      const obj = riskObjects.value[result.objectIdx];
      if (!obj) return;
      obj.assetId = result.id;
      obj.assetName = result.name;
    };

    onMounted(() => {
      document.title = "风险辨识";
    });

    onActivated(() => {
      applyAssetPickResult();
      if (unitId.value && unitId.value !== loadedUnitId.value) {
        void loadData(unitId.value);
      }
    });

    watch(
      unitId,
      (next, prev) => {
        if (next === prev && loadedUnitId.value === next) return;
        void loadData(next);
      },
      { immediate: true },
    );

    const currentObject = computed(() => riskObjects.value[editingObjectIdx.value]);

    const updateObjectField = <K extends keyof RiskObjectForm>(idx: number, key: K, value: RiskObjectForm[K]): void => {
      const target = riskObjects.value[idx];
      if (!target) return;
      target[key] = value;
    };

    const parseAiAccidentTypes = (value: RiskAiIdentificationObjectDraftVO["accidentTypes"]): string[] => {
      const values = (Array.isArray(value) ? value.map(String) : String(value ?? "").split(/[,，、;；/\s]+/))
        .map((item) => item.trim())
        .filter(Boolean);
      const selected = values.filter(
        (item, index) => (ACCIDENT_TYPES as readonly string[]).includes(item) && values.indexOf(item) === index,
      );
      return selected.length ? selected : values.length ? ["其他"] : [];
    };

    const hasAiRiskContent = (draft?: RiskAiIdentificationObjectDraftVO | null): boolean => {
      if (!draft) return false;
      const accidentTypes = parseAiAccidentTypes(draft.accidentTypes);
      return Boolean(
        String(draft.hazardDesc ?? "").trim() ||
        String(draft.accidentCause ?? draft.cause ?? "").trim() ||
        String(draft.triggerFactor ?? draft.triggerFactors ?? "").trim() ||
        String(draft.emergencyMeasure ?? draft.emergencyMeasures ?? "").trim() ||
        accidentTypes.some((type) => type !== "其他"),
      );
    };

    const aiNoRiskMessage = (result: AiRiskObjectPhotoResult): string =>
      String(result.noRiskReason ?? "").trim() || "未识别到风险，请手动输入";

    const applyAiDraft = (idx: number, draft: RiskAiIdentificationObjectDraftVO, mode: AiPhotoMode): void => {
      const obj = riskObjects.value[idx];
      if (!obj) return;
      if (mode === "create") {
        updateObjectField(idx, "name", String(draft.name ?? draft.objectName ?? obj.name ?? ""));
      }
      updateObjectField(idx, "hazardDesc", String(draft.hazardDesc ?? obj.hazardDesc ?? ""));
      const accidentTypes = parseAiAccidentTypes(draft.accidentTypes);
      if (accidentTypes.length) {
        updateObjectField(idx, "accidentTypes", accidentTypes);
      }
      updateObjectField(idx, "cause", String(draft.accidentCause ?? draft.cause ?? obj.cause ?? ""));
      updateObjectField(idx, "triggerFactors", String(draft.triggerFactor ?? draft.triggerFactors ?? obj.triggerFactors ?? ""));
      updateObjectField(idx, "emergencyMeasures", String(draft.emergencyMeasure ?? draft.emergencyMeasures ?? obj.emergencyMeasures ?? ""));
    };

    const buildCurrentContext = (obj: RiskObjectForm) =>
      mapIdentificationObjectToApi({
        objectId: obj.id.startsWith("new-") ? undefined : obj.id,
        name: obj.name,
        hazardDesc: obj.hazardDesc,
        accidentTypes: obj.accidentTypes,
        accidentCause: obj.cause,
        triggerFactor: obj.triggerFactors,
        emergencyMeasure: obj.emergencyMeasures,
      });

    const openAiPhoto = (idx: number, mode: AiPhotoMode): void => {
      if (!unitId.value) {
        showToast("请先选择风险单元");
        return;
      }
      const obj = riskObjects.value[idx];
      if (!obj) return;
      if (mode === "revise" && obj.id.startsWith("new-")) {
        showToast("AI修改需要已有风险对象，新对象请使用AI生成");
        return;
      }
      aiPhotoMode.value = mode;
      aiPhotoTargetIdx.value = idx;
      if (getEnvironment() !== "cubeApp") {
        aiPhotoInputRef.value?.click();
        return;
      }
      void handleNativeAiPhoto(idx, mode);
    };

    const runAiPhotoRecognition = async (idx: number, mode: AiPhotoMode, fileId: string): Promise<void> => {
      const obj = riskObjects.value[idx];
      if (!obj) return;
      const key = `${idx}-${mode}`;
      aiGeneratingKey.value = key;
      try {
        const context = buildCurrentContext(obj);
        const generatePayload = {
          unitId: unitId.value,
          fileId,
          context,
        };
        const modifyPayload = {
          fileId,
          context,
        };
        const result = (
          mode === "revise"
            ? await useAuthRequest(() => reviseRiskObjectByAiPhoto(obj.id, modifyPayload))
            : await useAuthRequest(() => generateRiskObjectByAiPhoto(generatePayload))
        ) as AiRiskObjectPhotoResult;
        const draft = result.object;
        if (result.recognized === false || !hasAiRiskContent(draft)) {
          showToast(aiNoRiskMessage(result));
          return;
        }
        applyAiDraft(idx, draft as RiskAiIdentificationObjectDraftVO, mode);
        showSuccessToast(mode === "revise" ? "AI修改内容已回填" : "AI生成内容已回填");
      } catch (e) {
        showApiError(e);
      } finally {
        aiGeneratingKey.value = "";
      }
    };

    const handleNativeAiPhoto = async (idx: number, mode: AiPhotoMode): Promise<void> => {
      const key = `${idx}-${mode}`;
      aiGeneratingKey.value = key;
      try {
        const photo = (await cubeAppService.takePhoto({
          sceneCode: FILE_SCENE_CODE.AI_IDENTIFICATION_PHOTO,
          confirmText: "开始识别",
        })) as NativePhotoFile | null;
        const fileId = String(photo?.id ?? photo?.fileId ?? "").trim();
        if (!fileId) {
          showToast("未获取到拍照结果");
          return;
        }
        await runAiPhotoRecognition(idx, mode, fileId);
      } catch (e) {
        showApiError(e, "拍照失败");
      } finally {
        if (aiGeneratingKey.value === key) {
          aiGeneratingKey.value = "";
        }
      }
    };

    const handleAiPhotoSelected = async (event: Event): Promise<void> => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      const key = `${aiPhotoTargetIdx.value}-${aiPhotoMode.value}`;
      aiGeneratingKey.value = key;
      try {
        const uploaded = await useAuthRequest(() => uploadRiskControlFile(file, FILE_SCENE_CODE.AI_IDENTIFICATION_PHOTO));
        await runAiPhotoRecognition(aiPhotoTargetIdx.value, aiPhotoMode.value, uploaded.id);
      } catch (e) {
        showApiError(e, "上传照片失败");
      } finally {
        if (aiGeneratingKey.value === key) {
          aiGeneratingKey.value = "";
        }
      }
    };

    const addObject = (): void => {
      if (!canAddObject.value) {
        showToast(isReIdentifyMode.value ? "再次辨识只能修改退回对象" : "当前单元暂不能辨识");
        return;
      }
      if (riskObjects.value.length >= MAX_OBJECTS) {
        showToast(`最多添加 ${MAX_OBJECTS} 个风险对象`);
        return;
      }
      riskObjects.value.push(emptyObject(unit.value));
    };

    const removeObject = (idx: number): void => {
      if (riskObjects.value.length <= 1) {
        showToast("至少保留一个风险对象");
        return;
      }
      const [removed] = riskObjects.value.splice(idx, 1);
      if (removed && !removed.id.startsWith("new-")) {
        deletedObjects.value.push(removed);
      }
    };

    const validateStep = (): boolean => {
      if (stepActive.value === 0) {
        if (!unit.value) {
          showToast("未找到风险单元");
          return false;
        }
        return true;
      }
      if (stepActive.value === 1) {
        if (!riskObjects.value.length) {
          showToast(emptyHint.value);
          return false;
        }
        for (const [i, obj] of riskObjects.value.entries()) {
          if (!obj.name.trim()) {
            showToast(`对象 ${i + 1}：请填写风险对象名称`);
            return false;
          }
          if (!obj.hazardDesc.trim()) {
            showToast(`对象 ${i + 1}：请填写危险源描述`);
            return false;
          }
          if (!obj.accidentTypes.length) {
            showToast(`对象 ${i + 1}：请选择事故类型`);
            return false;
          }
          if (!obj.cause.trim()) {
            showToast(`对象 ${i + 1}：请填写致险因素`);
            return false;
          }
          if (!obj.emergencyMeasures.trim()) {
            showToast(`对象 ${i + 1}：请填写应急措施`);
            return false;
          }
          if (!obj.responsibleUser.trim()) {
            showToast(`对象 ${i + 1}：请填写管控责任人`);
            return false;
          }
        }
        return true;
      }
      return true;
    };

    const nextStep = (): void => {
      if (!validateStep()) return;
      stepActive.value += 1;
    };

    const prevStep = (): void => {
      stepActive.value -= 1;
    };

    const submit = async (): Promise<void> => {
      if (!unitId.value) return;
      try {
        const userId = readCurrentUserId();
        await useAuthRequest(() =>
          submitUnitIdentification(unitId.value, {
            objects: [
              ...riskObjects.value.map((obj) =>
                mapIdentificationObjectToApi({
                  objectId: obj.id.startsWith("new-") ? undefined : obj.id,
                  name: obj.name,
                  assetId: obj.assetId || undefined,
                  hazardDesc: obj.hazardDesc,
                  accidentTypes: obj.accidentTypes,
                  accidentCause: obj.cause,
                  triggerFactor: obj.triggerFactors,
                  emergencyMeasure: obj.emergencyMeasures,
                  responsibleUserId: obj.responsibleUser,
                  userId,
                }),
              ),
              ...deletedObjects.value.map((obj) =>
                mapIdentificationObjectToApi({
                  objectId: obj.id,
                  name: obj.name,
                  assetId: obj.assetId || undefined,
                  hazardDesc: obj.hazardDesc,
                  accidentTypes: obj.accidentTypes,
                  accidentCause: obj.cause,
                  triggerFactor: obj.triggerFactors,
                  emergencyMeasure: obj.emergencyMeasures,
                  responsibleUserId: obj.responsibleUser,
                  deleted: true,
                  userId,
                }),
              ),
            ],
          }),
        );
        showSuccessToast("辨识提交成功，已进入待审核");
        void router.replace({ name: "identifications" });
      } catch (e) {
        showApiError(e);
      }
    };

    const openAccidentPicker = (idx: number): void => {
      editingObjectIdx.value = idx;
      accidentSheetVisible.value = true;
    };

    const openAssetPicker = (idx: number): void => {
      const obj = riskObjects.value[idx];
      void router.push({
        name: "asset-picker",
        query: {
          objectIdx: String(idx),
          assetId: obj?.assetId ?? "",
          assetName: obj?.assetName ?? "",
          unitId: unitId.value,
        },
      });
    };

    const toggleAccidentType = (type: string): void => {
      const idx = editingObjectIdx.value;
      const obj = riskObjects.value[idx];
      if (!obj) return;
      const next = obj.accidentTypes.includes(type) ? obj.accidentTypes.filter((item) => item !== type) : [...obj.accidentTypes, type];
      updateObjectField(idx, "accidentTypes", next);
    };

    const renderUnitInfo = (): JSX.Element => (
      <section class={styles.section}>
        <div class={styles.sectionTitle}>单元基本信息</div>
        <div class={styles.infoCard}>
          {unitLoading.value ? (
            <div class={styles.loadingWrap}>
              <Loading size="24px">加载中...</Loading>
            </div>
          ) : unit.value ? (
            <>
              <Field label="单元编号" modelValue={unit.value.code || "--"} readonly />
              <Field label="单元名称" modelValue={unit.value.name || "--"} readonly />
              <Field label="单元类型" modelValue={unit.value.unitType || "--"} readonly />
              <Field label="所属区域" modelValue={unit.value.zoneName || "--"} readonly />
              <Field label="辨识周期" modelValue={`${unit.value.identifyCycleDays} 天`} readonly />
              <Field label="辨识人员" modelValue={unit.value.identifyUsers.join("、") || "--"} readonly />
              <Field label="管控责任人" modelValue={unit.value.responsibleUser || "--"} readonly />
              <Field label="单元描述" modelValue={unit.value.description?.trim() || "--"} readonly type="textarea" rows={2} autosize />
            </>
          ) : (
            <div class={styles.emptyCard}>未找到风险单元，请从辨识列表进入</div>
          )}
        </div>
      </section>
    );

    const renderObjectForms = (): JSX.Element => (
      <>
        {objectsLoading.value && !riskObjects.value.length && (
          <section class={styles.section}>
            <div class={styles.infoCard}>
              <div class={styles.loadingWrap}>
                <Loading size="24px">加载风险对象...</Loading>
              </div>
            </div>
          </section>
        )}
        {!objectsLoading.value && !riskObjects.value.length && (
          <section class={styles.section}>
            <div class={styles.infoCard}>
              <div class={styles.emptyCard}>{emptyHint.value}</div>
            </div>
          </section>
        )}
        {riskObjects.value.map((obj, idx) => (
          <div key={obj.id} class={styles.objectCardWrap}>
            <div class={styles.objectCardHeader}>
              <span class={styles.objectCardTitle}>风险对象 {idx + 1}</span>
              <div class={styles.objectCardActions}>
                <Button size="mini" type="danger" plain onClick={() => removeObject(idx)}>
                  删除
                </Button>
              </div>
            </div>
            <div class={styles.aiPhotoBar}>
              <Button
                class={styles.aiPhotoButton}
                size="small"
                type="primary"
                plain
                loading={aiGeneratingKey.value === `${idx}-create`}
                onClick={() => openAiPhoto(idx, "create")}
              >
                AI拍照生成
              </Button>
              {!obj.id.startsWith("new-") ? (
                <Button
                  class={styles.aiPhotoButton}
                  size="small"
                  plain
                  loading={aiGeneratingKey.value === `${idx}-revise`}
                  onClick={() => openAiPhoto(idx, "revise")}
                >
                  AI拍照修改
                </Button>
              ) : null}
            </div>
            <Field
              label="对象名称"
              required
              maxlength={100}
              placeholder="如：氨压缩机氨泄漏"
              modelValue={obj.name}
              onUpdate:modelValue={(value: string) => updateObjectField(idx, "name", value)}
            />
            <Field modelValue={obj.assetName || "请选择"} label="关联资产" readonly isLink onClick={() => openAssetPicker(idx)} />
            <Field
              rows={2}
              autosize
              type="textarea"
              label="危险源描述"
              required
              maxlength={500}
              placeholder="描述危险源及可能后果"
              modelValue={obj.hazardDesc}
              onUpdate:modelValue={(value: string) => updateObjectField(idx, "hazardDesc", value)}
            />
            <Field
              modelValue={obj.accidentTypes.length ? obj.accidentTypes.join("、") : "请选择"}
              label="事故类型"
              required
              readonly
              isLink
              onClick={() => openAccidentPicker(idx)}
            />
            <Field
              label="致险因素"
              required
              maxlength={200}
              placeholder="如：设备老化、密封失效"
              modelValue={obj.cause}
              onUpdate:modelValue={(value: string) => updateObjectField(idx, "cause", value)}
            />
            <Field
              label="触发因素"
              maxlength={200}
              placeholder="如：高温季节、超负荷运行"
              modelValue={obj.triggerFactors}
              onUpdate:modelValue={(value: string) => updateObjectField(idx, "triggerFactors", value)}
            />
            <Field
              rows={2}
              autosize
              type="textarea"
              label="应急措施"
              required
              maxlength={500}
              placeholder="启动应急预案、排风、疏散等"
              modelValue={obj.emergencyMeasures}
              onUpdate:modelValue={(value: string) => updateObjectField(idx, "emergencyMeasures", value)}
            />
            <Field
              label="管控责任人"
              required
              maxlength={50}
              placeholder="填写责任人"
              modelValue={obj.responsibleUser}
              onUpdate:modelValue={(value: string) => updateObjectField(idx, "responsibleUser", value)}
            />
          </div>
        ))}
        <div class={styles.section}>
          <Button block type="primary" plain disabled={!canAddObject.value || riskObjects.value.length >= MAX_OBJECTS} onClick={addObject}>
            + 添加风险对象（{riskObjects.value.length}/{MAX_OBJECTS}）
          </Button>
        </div>
      </>
    );

    const renderConfirm = (): JSX.Element => (
      <section class={styles.section}>
        <div class={styles.sectionTitle}>提交确认</div>
        <div class={styles.infoCard}>
          <div class={styles.confirmDesc}>
            单元：<strong>{unit.value?.name ?? "--"}</strong>，共 {riskObjects.value.length} 个风险对象
            {isReIdentifyMode.value ? "，本次仅提交退回对象" : ""}
          </div>
          {riskObjects.value.map((obj, idx) => (
            <div key={obj.id} class={styles.confirmItem}>
              <div class={styles.confirmName}>
                {idx + 1}. {obj.name}
              </div>
              <div class={styles.confirmDesc}>{obj.hazardDesc}</div>
              <div class={styles.confirmMeta}>
                事故类型：{obj.accidentTypes.join("、")} | 责任人：{obj.responsibleUser}
              </div>
            </div>
          ))}
        </div>
      </section>
    );

    return (): JSX.Element => (
      <div class={styles.page}>
        <input
          ref={aiPhotoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(event: Event) => {
            void handleAiPhotoSelected(event);
          }}
        />
        <Bar name="风险辨识" isShowRight={false} />
        <Steps active={stepActive.value} class={styles.steps}>
          <Step>单元信息</Step>
          <Step>风险对象</Step>
          <Step>提交确认</Step>
        </Steps>

        {stepActive.value === 0 && renderUnitInfo()}
        {stepActive.value === 1 && renderObjectForms()}
        {stepActive.value === 2 && renderConfirm()}

        <div class={styles.bottomBar}>
          <Button class={styles.bottomBtn} disabled={stepActive.value <= 0} onClick={prevStep}>
            上一步
          </Button>
          {stepActive.value < 2 ? (
            <Button class={styles.bottomBtn} type="primary" onClick={nextStep}>
              下一步
            </Button>
          ) : (
            <Button
              class={styles.bottomBtn}
              type="primary"
              disabled={!riskObjects.value.length}
              onClick={() => {
                void submit();
              }}
            >
              {isReIdentifyMode.value ? "提交再次辨识" : "提交辨识"}
            </Button>
          )}
        </div>

        <ActionSheet
          show={accidentSheetVisible.value}
          title="选择事故类型"
          onUpdate:show={(value: boolean) => {
            accidentSheetVisible.value = value;
          }}
        >
          <div class={styles.section}>
            {ACCIDENT_TYPES.map((type) => {
              const selected = currentObject.value?.accidentTypes.includes(type);
              return (
                <Tag
                  key={type}
                  type={selected ? "primary" : "default"}
                  plain={!selected}
                  style={{ margin: "0 8px 8px 0" }}
                  onClick={() => toggleAccidentType(type)}
                >
                  {type}
                </Tag>
              );
            })}
            <Button
              block
              type="primary"
              onClick={() => {
                accidentSheetVisible.value = false;
              }}
            >
              确定
            </Button>
          </div>
        </ActionSheet>
      </div>
    );
  },
});

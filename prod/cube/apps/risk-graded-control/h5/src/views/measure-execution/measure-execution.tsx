import { PullRefresh, Button, Tag, Popup, Picker, Uploader, Icon, showSuccessToast, showToast } from "vant";
import type { PickerOption, UploaderFileListItem } from "vant";
import { defineComponent, ref, computed, onMounted } from "vue";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { createMeasureExecutionRecord, pageMeasureExecutions } from "@ghcloud/cube-services-client/risk-graded-control.client";

import { uploadRiskControlFile } from "@/api/upload-risk-file";
import { Bar } from "@/components/bar/bar";
import { FILE_SCENE_CODE, MAX_MEASURE_EXECUTION_ATTACHMENTS, RISK_LEVEL_LABEL, RISK_LEVEL_TAG_TYPE } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { showApiError } from "@/utils/api-error";
import {
  buildUnitFilterOptions,
  buildUnitMeasureGroupsFromApi,
  computeExecutionStats,
  MEASURE_EXEC_STATUS,
  removeMeasureFromGroups,
  updateMeasureInGroups,
  type MeasureExecutionItem,
  type UnitMeasureGroup,
} from "@/utils/measure-execution-group";
import { unwrapPageRecords } from "@/utils/page-records";

import styles from "./measure-execution.module.less";

const DEFAULT_EXECUTION_RESULT = "COMPLETED";

export const MeasureExecutionPage = defineComponent({
  name: "MeasureExecutionPage",
  setup() {
    const groups = ref<UnitMeasureGroup[]>([]);
    const refreshing = ref(false);
    const loading = ref(false);
    const unitFilter = ref("");
    const pickerVisible = ref(false);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageMeasureExecutions({
            pageNumber: 1,
            pageSize: 500,
            executor: "current",
          }),
        );
        groups.value = buildUnitMeasureGroupsFromApi(unwrapPageRecords(page));
      } catch (e) {
        showApiError(e);
        groups.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      document.title = "我的待执行措施";
      void loadList();
    });

    const stats = computed(() => computeExecutionStats(groups.value));

    const unitFilterOptions = computed(() => buildUnitFilterOptions(groups.value));

    const unitFilterLabel = computed(() => unitFilterOptions.value.find((o) => o.value === unitFilter.value)?.text ?? "全部风险单元");

    const filteredGroups = computed(() => {
      if (!unitFilter.value) return groups.value;
      return groups.value.filter((g) => g.unitId === unitFilter.value);
    });

    const pickerColumns = computed((): PickerOption[] => unitFilterOptions.value.map((o) => ({ text: o.text, value: o.value })));

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList();
      refreshing.value = false;
    };

    const onUnitFilterConfirm = ({ selectedValues }: { selectedValues: string[] }): void => {
      unitFilter.value = selectedValues[0] ?? "";
      pickerVisible.value = false;
    };

    const updateRemark = (groupId: string, measureId: string, value: string): void => {
      groups.value = updateMeasureInGroups(groups.value, groupId, measureId, { execRemark: value });
    };

    const appendAttachment = (groupId: string, measureId: string, attachment: { id: string; path: string; name: string }): void => {
      const group = groups.value.find((g) => g.unitId === groupId);
      const measure = group?.measures.find((m) => m.id === measureId);
      if (!measure) return;
      groups.value = updateMeasureInGroups(groups.value, groupId, measureId, {
        fileIds: [...measure.fileIds, attachment.id],
        attachments: [...measure.attachments, attachment],
        fileVOS: [
          ...measure.fileVOS,
          {
            url: attachment.path,
            ossId: attachment.id,
            isImage: true,
            name: attachment.name,
          } as UploaderFileListItem,
        ],
      });
    };

    const removeAttachment = (groupId: string, measureId: string, fileId: string): void => {
      const group = groups.value.find((g) => g.unitId === groupId);
      const measure = group?.measures.find((m) => m.id === measureId);
      if (!measure) return;
      groups.value = updateMeasureInGroups(groups.value, groupId, measureId, {
        fileIds: measure.fileIds.filter((id) => id !== fileId),
        attachments: measure.attachments.filter((item) => item.id !== fileId),
        fileVOS: measure.fileVOS.filter((item) => (item as UploaderFileListItem & { ossId?: string }).ossId !== fileId),
      });
    };

    const syncFileVos = (groupId: string, measureId: string, fileVOS: UploaderFileListItem[]): void => {
      groups.value = updateMeasureInGroups(groups.value, groupId, measureId, { fileVOS });
    };

    const submitMeasure = async (group: UnitMeasureGroup, measure: MeasureExecutionItem): Promise<void> => {
      const executionDesc = measure.execRemark.trim();
      if (!executionDesc) {
        showToast("请填写执行情况说明");
        return;
      }
      try {
        await useAuthRequest(() =>
          createMeasureExecutionRecord(measure.id, {
            executionDesc,
            executionResult: DEFAULT_EXECUTION_RESULT,
            fileIds: measure.fileIds,
          }),
        );
        groups.value = removeMeasureFromGroups(groups.value, group.unitId, measure.id);
        showSuccessToast("执行反馈已提交");
      } catch (e) {
        showApiError(e);
      }
    };

    const clickUpload = async (groupId: string, measure: MeasureExecutionItem): Promise<void> => {
      if (getEnvironment() !== "cubeApp") return;
      if (measure.fileIds.length >= MAX_MEASURE_EXECUTION_ATTACHMENTS) {
        showToast(`最多上传 ${MAX_MEASURE_EXECUTION_ATTACHMENTS} 个附件`);
        return;
      }
      try {
        const remain = MAX_MEASURE_EXECUTION_ATTACHMENTS - measure.fileIds.length;
        const res = await cubeAppService.uploadImage(String(remain), {
          sceneCode: FILE_SCENE_CODE.MEASURE_EXECUTION_ATTACHMENT,
          uploadMethod: ["camera", "album", "file"],
        });
        res.forEach((item) => {
          const file = item as { id: string; path: string; name?: string };
          if (!file.id) return;
          appendAttachment(groupId, measure.id, {
            id: String(file.id),
            path: file.path,
            name: file.name || "附件",
          });
        });
        if (res.length > 0) {
          showSuccessToast("附件上传成功");
        }
      } catch (e) {
        showApiError(e);
      }
    };

    const handleFileAfterRead = async (
      file: UploaderFileListItem | UploaderFileListItem[],
      groupId: string,
      measure: MeasureExecutionItem,
    ): Promise<void> => {
      const items = Array.isArray(file) ? file : [file];
      for (const fileItem of items) {
        if (!fileItem.file) continue;
        fileItem.status = "uploading";
        fileItem.message = "上传中...";
        try {
          const result = await useAuthRequest(() =>
            uploadRiskControlFile(fileItem.file as Blob, FILE_SCENE_CODE.MEASURE_EXECUTION_ATTACHMENT),
          );
          if (!result.id) {
            fileItem.status = "failed";
            fileItem.message = "上传失败";
            showToast("上传失败");
            continue;
          }
          fileItem.url = result.path;
          (fileItem as UploaderFileListItem & { ossId?: string }).ossId = result.id;
          fileItem.status = "done";
          fileItem.message = "上传成功";
          const latest = groups.value.find((g) => g.unitId === groupId)?.measures.find((m) => m.id === measure.id);
          if (!latest) continue;
          groups.value = updateMeasureInGroups(groups.value, groupId, measure.id, {
            fileIds: [...latest.fileIds, result.id],
            attachments: [
              ...latest.attachments,
              {
                id: result.id,
                path: result.path,
                name: fileItem.file.name || "附件",
              },
            ],
          });
        } catch (e) {
          fileItem.status = "failed";
          fileItem.message = "上传失败";
          showApiError(e);
        }
      }
    };

    const handleDelete = (file: UploaderFileListItem, groupId: string, measure: MeasureExecutionItem): void => {
      const ossId = (file as UploaderFileListItem & { ossId?: string }).ossId;
      const attachment = measure.attachments.find((item) => item.id === ossId || item.path === file.url);
      if (attachment) {
        removeAttachment(groupId, measure.id, attachment.id);
        return;
      }
      syncFileVos(
        groupId,
        measure.id,
        measure.fileVOS.filter((item) => item.url !== file.url),
      );
    };

    const renderUploader = (groupId: string, measure: MeasureExecutionItem): JSX.Element => (
      <Uploader
        modelValue={measure.fileVOS}
        onUpdate:modelValue={(files: UploaderFileListItem[]) => syncFileVos(groupId, measure.id, files)}
        multiple
        maxCount={MAX_MEASURE_EXECUTION_ATTACHMENTS}
        accept="image/*"
        capture="environment"
        deletable
        previewSize={72}
        readonly={getEnvironment() === "cubeApp"}
        onClickUpload={async () => clickUpload(groupId, measure)}
        afterRead={(file: UploaderFileListItem | UploaderFileListItem[]) => {
          void handleFileAfterRead(file, groupId, measure);
        }}
        onDelete={(file: UploaderFileListItem) => {
          handleDelete(file, groupId, measure);
        }}
      >
        <div class={styles.uploadTrigger}>
          <Icon name="plus" size="24" color="#3b82f6" />
          <span class={styles.uploadText}>拍照/上传</span>
        </div>
      </Uploader>
    );

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="我的待执行措施" isShowRight={false} />

        <div class={styles.statsPanel}>
          <div class={styles.statsInner}>
            <div class={styles.statItem}>
              <div class={[styles.statNum, styles.statPending].join(" ")}>{stats.value.pending}</div>
              <div class={styles.statText}>待执行</div>
            </div>
          </div>
        </div>

        <div class={styles.filterRow}>
          <button
            type="button"
            class={styles.unitFilter}
            onClick={() => {
              pickerVisible.value = true;
            }}
          >
            <span>{unitFilterLabel.value}</span>
            <span class={styles.chevron}>▼</span>
          </button>
        </div>

        <PullRefresh modelValue={refreshing.value || loading.value} onRefresh={onRefresh}>
          <div class={styles.list}>
            {filteredGroups.value.length === 0 && !loading.value && <div class={styles.empty}>暂无待执行措施</div>}
            {filteredGroups.value.map((group) => (
              <div key={group.unitId} class={styles.unitCard} style={{ borderLeftColor: group.borderColor }}>
                <div class={styles.unitHeader}>
                  <div class={styles.unitTitleRow}>
                    <span class={styles.unitName}>{group.unitName}</span>
                    <Tag type={RISK_LEVEL_TAG_TYPE[group.riskLevel]} plain>
                      {RISK_LEVEL_LABEL[group.riskLevel]}
                    </Tag>
                  </div>
                </div>

                {group.measures.map((measure) => {
                  const statusMeta = MEASURE_EXEC_STATUS[measure.execStatus] ?? MEASURE_EXEC_STATUS.PENDING;
                  return (
                    <div key={measure.id} class={styles.measureBlock}>
                      <div class={styles.measureMeta}>
                        <span class={styles.measureType}>【{measure.controlType}】</span>
                        <Tag type={statusMeta.tagType} plain size="medium">
                          {statusMeta.label}
                        </Tag>
                      </div>
                      <p class={styles.measureContent}>{measure.content}</p>
                      <div class={styles.measureForm}>
                        <div class={styles.uploadRow}>
                          <div class={styles.uploadLabel}>执行附件（最多 {MAX_MEASURE_EXECUTION_ATTACHMENTS} 个，选填）</div>
                          <div class={styles.uploadPanel}>{renderUploader(group.unitId, measure)}</div>
                        </div>
                        <div class={styles.remarkRow}>
                          <input
                            class={styles.remarkInput}
                            placeholder="执行情况说明（必填）"
                            value={measure.execRemark}
                            onInput={(e: Event) => updateRemark(group.unitId, measure.id, (e.target as HTMLInputElement).value)}
                          />
                          <Button
                            size="mini"
                            type="primary"
                            round
                            onClick={() => {
                              void submitMeasure(group, measure);
                            }}
                          >
                            提交
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </PullRefresh>

        <Popup v-model:show={pickerVisible.value} round position="bottom">
          <Picker
            columns={pickerColumns.value}
            onConfirm={onUnitFilterConfirm}
            onCancel={() => {
              pickerVisible.value = false;
            }}
          />
        </Popup>
      </div>
    );
  },
});

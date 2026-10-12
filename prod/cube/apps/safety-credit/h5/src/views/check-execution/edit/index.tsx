import { Button, Empty, Tag, showConfirmDialog, showSuccessToast, showToast } from "vant";
import { computed, defineComponent, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { SafetyCreditCheckExecutionVO, SafetyCreditChecklistVO, SafetyCreditId } from "@ghcloud/cube-safety-credit-service";

import { CheckItemList } from "../components/check-item-list";
import {
  buildCheckExecutionPayload,
  compactPhotos,
  executionPeriod,
  executionTitle,
  isSameChecklist,
  maxCheckPhotoCount,
  nativeFileToPhoto,
  normalizeChecklistItem,
  normalizeExecutionItem,
  type CheckItemState,
  type PhotoState,
} from "../shared";
import { cubeSafetyCreditService } from "@/api/server";
import {
  EXECUTABLE_CHECKLIST_STATUS,
  checkExecutionStatusLabel,
  checkExecutionStatusTone,
  checklistStatusLabel,
  checklistStatusTone,
  isCheckExecutionReadonlyStatus,
} from "@/constants/safety-credit-enums";
import { getCurrentUserId } from "@/utils/current-user";
import { formatShortDateTime } from "@/utils/format";
import { readQueryText } from "@/utils/route-query";

import "../check-execution.less";

export const CheckExecutionEdit = defineComponent({
  name: "CheckExecutionEdit",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const detailLoading = shallowRef(false);
    const saving = shallowRef(false);
    const submitting = shallowRef(false);
    const uploadingPhotos = shallowRef(0);
    const selectedChecklist = ref<SafetyCreditChecklistVO | null>(null);
    const selectedExecution = ref<SafetyCreditCheckExecutionVO | null>(null);
    const items = ref<CheckItemState[]>([]);

    const editingReady = computed(
      () => selectedExecution.value !== null && !isCheckExecutionReadonlyStatus(selectedExecution.value.status),
    );
    const checklistEditable = computed(() => selectedChecklist.value?.status === EXECUTABLE_CHECKLIST_STATUS);
    const canEdit = computed(() => editingReady.value || checklistEditable.value);
    const readonly = computed(() => !canEdit.value);
    const showEditControls = computed(() => canEdit.value);
    const showSubmitFooter = computed(() => canEdit.value);
    const photoUploading = computed(() => uploadingPhotos.value > 0);
    const completedCount = computed(() => items.value.filter((item) => item.checked).length);
    const totalCount = computed(() => items.value.length);
    const progressPercent = computed(() => (totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100)));
    const submitReady = computed(
      () =>
        totalCount.value > 0 &&
        completedCount.value === totalCount.value &&
        !items.value.some((item) => item.photoRequired && item.photos.length === 0),
    );

    function executionId(): SafetyCreditId | undefined {
      return selectedExecution.value?.id;
    }

    function showList(): void {
      void router.replace({ name: "CheckExecutionList" });
    }

    function applyChecklistDetail(detail: SafetyCreditChecklistVO): void {
      selectedChecklist.value = detail;
      selectedExecution.value = null;
      items.value = (detail.items ?? []).map(normalizeChecklistItem);
    }

    function applyExecutionDetail(detail: SafetyCreditCheckExecutionVO | null): void {
      selectedExecution.value = detail;
      items.value = (detail?.items ?? []).map(normalizeExecutionItem);
    }

    async function loadExecutionForChecklist(checklist: SafetyCreditChecklistVO): Promise<void> {
      const currentMerchantId = checklist.merchantId ?? (await getCurrentUserId());
      if (currentMerchantId === undefined) {
        return;
      }
      let current: SafetyCreditCheckExecutionVO | null = null;
      try {
        current = await cubeSafetyCreditService.getCurrentCheckExecution(currentMerchantId);
      } catch {
        current = null;
      }
      if (isSameChecklist(current, checklist) || (current !== null && checklist.status === EXECUTABLE_CHECKLIST_STATUS)) {
        applyExecutionDetail(current);
        return;
      }
      if (checklist.status !== EXECUTABLE_CHECKLIST_STATUS) {
        return;
      }
      const ensured = await cubeSafetyCreditService.ensureCurrentCheckExecution({ merchantId: currentMerchantId });
      if (ensured !== null) {
        applyExecutionDetail(ensured);
      }
    }

    async function loadDetail(): Promise<void> {
      const executionIdValue = readQueryText(route.query.executionId, "executionId");
      const checklistIdValue = readQueryText(route.query.checklistId, "checklistId");
      detailLoading.value = true;
      selectedChecklist.value = null;
      applyExecutionDetail(null);
      try {
        if (executionIdValue !== undefined) {
          const detail = await cubeSafetyCreditService.getCheckExecution(executionIdValue);
          applyExecutionDetail(detail);
          return;
        }
        if (checklistIdValue === undefined) {
          showToast("缺少自查清单参数");
          return;
        }
        const checklist = await cubeSafetyCreditService.getChecklist(checklistIdValue);
        applyChecklistDetail(checklist);
        try {
          await loadExecutionForChecklist(checklist);
        } catch {
          showToast("自查执行数据加载失败，当前仅展示清单");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "自查详情加载失败");
      } finally {
        detailLoading.value = false;
      }
    }

    function findItem(itemId: SafetyCreditId): CheckItemState | undefined {
      return items.value.find((item) => String(item.itemId) === String(itemId));
    }

    function updateChecked(itemId: SafetyCreditId, checked: boolean): void {
      if (readonly.value) {
        return;
      }
      const item = findItem(itemId);
      if (item !== undefined) {
        item.checked = checked;
      }
    }

    function updateRemark(itemId: SafetyCreditId, remark: string): void {
      if (readonly.value) {
        return;
      }
      const item = findItem(itemId);
      if (item !== undefined) {
        item.remark = remark;
      }
    }

    function appendPhotos(itemId: SafetyCreditId, photos: PhotoState[]): void {
      const item = findItem(itemId);
      if (item === undefined || photos.length === 0) {
        return;
      }
      const existingFileIds = new Set(item.photos.map((photo) => photo.fileId));
      for (const photo of photos) {
        if (!existingFileIds.has(photo.fileId)) {
          item.photos.push(photo);
          existingFileIds.add(photo.fileId);
        }
      }
      item.checked = true;
    }

    async function uploadNativePhotos(itemId: SafetyCreditId): Promise<void> {
      if (readonly.value || photoUploading.value) {
        return;
      }
      const item = findItem(itemId);
      if (item === undefined) {
        return;
      }
      const remainingCount = maxCheckPhotoCount - item.photos.length;
      if (remainingCount <= 0) {
        showToast(`最多上传 ${maxCheckPhotoCount} 张照片`);
        return;
      }
      uploadingPhotos.value += 1;
      try {
        const result = await cubeAppService.uploadImage(String(remainingCount), {
          sceneCode: GLOBAL_SCENE_CODE.safetyCredit,
        });
        const photos = compactPhotos((Array.isArray(result) ? result : []).map((file, index) => nativeFileToPhoto(file, index)));
        if (photos.length === 0) {
          showToast("未获取到上传结果");
          return;
        }
        appendPhotos(itemId, photos);
        showSuccessToast("照片已上传");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "照片上传失败");
      } finally {
        uploadingPhotos.value -= 1;
      }
    }

    function removePhoto(itemId: SafetyCreditId, fileId: string): void {
      if (readonly.value) {
        return;
      }
      const item = findItem(itemId);
      const index = item?.photos.findIndex((photo) => photo.fileId === fileId) ?? -1;
      if (item !== undefined && index >= 0) {
        item.photos.splice(index, 1);
      }
    }

    function validateSubmit(): boolean {
      const unfinished = items.value.find((item) => !item.checked);
      if (unfinished !== undefined) {
        showToast(`请完成检查项：${unfinished.itemName}`);
        return false;
      }
      const missingPhoto = items.value.find((item) => item.photoRequired && item.photos.length === 0);
      if (missingPhoto !== undefined) {
        showToast(`请上传照片：${missingPhoto.itemName}`);
        return false;
      }
      return true;
    }

    async function saveDraft(): Promise<void> {
      const id = executionId();
      if (id === undefined || readonly.value) {
        return;
      }
      if (photoUploading.value) {
        showToast("照片正在上传，请稍后再保存");
        return;
      }
      saving.value = true;
      try {
        await cubeSafetyCreditService.saveCheckExecutionDraft(id, buildCheckExecutionPayload(items.value));
        showSuccessToast("已保存");
        const detail = await cubeSafetyCreditService.getCheckExecution(id);
        applyExecutionDetail(detail);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "保存失败");
      } finally {
        saving.value = false;
      }
    }

    async function submit(): Promise<void> {
      const id = executionId();
      if (id === undefined || readonly.value || !validateSubmit()) {
        return;
      }
      if (photoUploading.value) {
        showToast("照片正在上传，请稍后再提交");
        return;
      }
      try {
        await showConfirmDialog({
          title: "提交自查",
          message: "确认提交本次自查？",
        });
      } catch {
        return;
      }
      submitting.value = true;
      try {
        await cubeSafetyCreditService.submitCheckExecution(id, buildCheckExecutionPayload(items.value));
        showSuccessToast("自查已提交");
        showList();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "提交失败");
      } finally {
        submitting.value = false;
      }
    }

    watch(
      () => [route.query.checklistId, route.query.executionId],
      () => {
        void loadDetail();
      },
      { immediate: true },
    );

    return (): JSX.Element => {
      const execution = selectedExecution.value;
      const checklist = selectedChecklist.value;
      const status = execution?.status ?? checklist?.executionStatus;
      const hasDetail = execution !== null || checklist !== null;
      return (
        <main class="check-execution-page detail-mode">
          <CubeNavBar
            showBack
            onlyBack
            title={executionTitle(execution ?? checklist)}
            rightText={execution?.cycleEnd === undefined ? "" : formatShortDateTime(execution.cycleEnd)}
            onClickLeft={showList}
          />
          {detailLoading.value ? <section class="check-empty">正在加载...</section> : null}
          {hasDetail && !detailLoading.value ? (
            <>
              <section class="check-detail-basis">
                <strong>{execution === null ? "清单信息：" : "清单周期："}</strong>
                {execution === null ? `共 ${items.value.length} 项` : executionPeriod(execution)}
                <Tag type={execution === null ? checklistStatusTone(checklist?.status) : checkExecutionStatusTone(status)}>
                  {execution === null ? checklistStatusLabel(checklist?.status) : checkExecutionStatusLabel(status)}
                </Tag>
              </section>
              <CheckItemList
                items={items.value}
                readonly={readonly.value}
                editingReady={canEdit.value}
                showEditControls={showEditControls.value}
                photoUploading={photoUploading.value}
                onUpdateChecked={updateChecked}
                onUpdateRemark={updateRemark}
                onUploadPhotos={(itemId: SafetyCreditId) => void uploadNativePhotos(itemId)}
                onRemovePhoto={removePhoto}
              />
              {showSubmitFooter.value ? (
                <footer class="check-submit-footer">
                  <div class="check-submit-progress">
                    <span>
                      {completedCount.value}/{totalCount.value} 项已完成
                    </span>
                    <div>
                      <i style={{ width: `${progressPercent.value}%` }} />
                    </div>
                  </div>
                  <div class="check-submit-actions">
                    <Button
                      block
                      plain
                      type="primary"
                      loading={saving.value}
                      disabled={execution === null || readonly.value || submitting.value || photoUploading.value}
                      onClick={() => void saveDraft()}
                    >
                      保存草稿
                    </Button>
                    <Button
                      block
                      type="primary"
                      loading={submitting.value}
                      disabled={execution === null || readonly.value || saving.value || photoUploading.value || !submitReady.value}
                      onClick={() => void submit()}
                    >
                      提交自查
                    </Button>
                  </div>
                </footer>
              ) : null}
            </>
          ) : null}
          {!hasDetail && !detailLoading.value ? (
            <section class="check-empty">
              <Empty description="暂无自查详情" />
            </section>
          ) : null}
        </main>
      );
    };
  },
});

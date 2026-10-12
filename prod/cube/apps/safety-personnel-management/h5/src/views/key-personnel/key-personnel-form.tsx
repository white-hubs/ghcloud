import { Button, Cell, Field, Form, Popup, Radio, RadioGroup, Search, showToast } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  FileVO,
  KeyPersonAreaOptionVO,
  KeyPersonRiskLevel,
  KeyPersonSupervisorOptionVO,
} from "@ghcloud/cube-service-interface/safety-personnel";
import {
  createKeyPerson,
  getKeyPersonAreaOptions,
  getKeyPersonDetail,
  getKeyPersonSupervisorOptions,
  updateKeyPerson,
} from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { FileUploader } from "@/components/file-uploader/file-uploader";
import { KEY_PERSON_RISK_LEVEL_OPTIONS, KEY_PERSON_SCENE } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { maskPhone } from "@/utils";

import styles from "./key-personnel.module.less";

interface FlatArea {
  name: string;
  sequence: string;
  level: number;
}

function flattenAreas(list: KeyPersonAreaOptionVO[], level = 0): FlatArea[] {
  return list.flatMap((item) => [
    { name: `${"　".repeat(level)}${item.name}`, sequence: item.sequence, level },
    ...flattenAreas(item.children ?? [], level + 1),
  ]);
}

export const KeyPersonnelFormPage = defineComponent({
  name: "KeyPersonnelFormPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const rawEditId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
    const editId = rawEditId == null || rawEditId === "" ? null : Number(rawEditId);
    const validEditId = editId == null || (Number.isFinite(editId) && editId > 0);
    const areas = ref<FlatArea[]>([]);
    const supervisors = ref<KeyPersonSupervisorOptionVO[]>([]);
    const areaVisible = ref(false);
    const supervisorVisible = ref(false);
    const areaKeyword = ref("");
    const supervisorKeyword = ref("");
    const photoIds = ref<string[]>([]);
    const photoFiles = ref<FileVO[]>([]);
    const attachmentIds = ref<string[]>([]);
    const attachmentFiles = ref<FileVO[]>([]);
    const submitting = ref(false);

    const form = reactive({
      name: "",
      phone: "",
      idCard: "",
      areaSequence: "",
      areaName: "",
      riskLevel: "HIGH" as KeyPersonRiskLevel,
      supervisorUserId: undefined as number | undefined,
      supervisorName: "",
      supervisionReason: "",
    });

    const loadOptions = async (): Promise<void> => {
      const [areaResult, supervisorResult] = await Promise.all([
        useAuthRequest(() => getKeyPersonAreaOptions(areaKeyword.value.trim() || undefined)),
        useAuthRequest(() => getKeyPersonSupervisorOptions(supervisorKeyword.value.trim() || undefined)),
      ]);
      areas.value = flattenAreas(areaResult ?? []);
      supervisors.value = supervisorResult ?? [];
    };

    const loadDetail = async (): Promise<void> => {
      if (!editId || !validEditId) return;
      const detail = await useAuthRequest(() => getKeyPersonDetail(editId));
      form.name = detail.name ?? "";
      form.phone = detail.phone ?? "";
      form.idCard = detail.idCard ?? "";
      form.areaSequence = detail.areaSequence ?? "";
      form.areaName = detail.areaName ?? "";
      form.riskLevel = detail.riskLevel ?? "HIGH";
      form.supervisorUserId = detail.supervisorUserId;
      form.supervisorName = detail.supervisorName ?? "";
      form.supervisionReason = detail.supervisionReason ?? "";
      photoIds.value = detail.photoFileId ? [detail.photoFileId] : [];
      photoFiles.value = detail.photoFile ? [detail.photoFile] : [];
      attachmentIds.value = detail.personAttachmentFileIds ?? [];
      attachmentFiles.value = detail.personAttachmentFiles ?? [];
    };

    const submit = async (): Promise<void> => {
      if (submitting.value) return;
      if (!validEditId) return showToast("重点人员参数无效");
      if (!form.name.trim()) return showToast("请输入姓名");
      if (!form.phone.trim()) return showToast("请输入手机号");
      if (!form.areaSequence) return showToast("请选择区域");
      if (!form.supervisorUserId) return showToast("请选择监管人员");
      if (!form.supervisionReason.trim()) return showToast("请输入监管原因");
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        idCard: form.idCard.trim() || undefined,
        areaSequence: form.areaSequence,
        riskLevel: form.riskLevel,
        supervisorUserId: form.supervisorUserId,
        supervisionReason: form.supervisionReason.trim(),
        photoFileId: photoIds.value[0],
        clearPhoto: !photoIds.value.length,
        personAttachmentFileIds: attachmentIds.value,
      };
      submitting.value = true;
      try {
        if (editId) {
          await useAuthRequest(() => updateKeyPerson(editId, payload));
        } else {
          await useAuthRequest(() => createKeyPerson(payload));
        }
        showToast(editId ? "保存成功" : "新增成功");
        router.back();
      } finally {
        submitting.value = false;
      }
    };

    onMounted(async () => {
      if (!validEditId) {
        showToast("重点人员参数无效");
        router.back();
        return;
      }
      await loadOptions();
      await loadDetail();
    });

    return (): VNode => (
      <div class="page">
        <Bar name={editId ? "编辑重点人员" : "新增重点人员"} />
        <Form class={styles.form} onSubmit={() => void submit()}>
          <Cell
            title="姓名"
            value=""
            v-slots={{ value: () => <Field v-model={form.name} maxlength={50} placeholder="请输入" inputAlign="right" border={false} /> }}
          />
          <Cell
            title="手机号"
            value=""
            v-slots={{ value: () => <Field v-model={form.phone} placeholder="请输入" inputAlign="right" border={false} type="tel" /> }}
          />
          <Cell
            title="身份证"
            value=""
            v-slots={{ value: () => <Field v-model={form.idCard} maxlength={18} placeholder="请输入" inputAlign="right" border={false} /> }}
          />
          <Cell
            title="区域"
            isLink
            value={form.areaName || "请选择"}
            onClick={() => {
              areaVisible.value = true;
            }}
          />
          <Cell
            title="监管人员"
            isLink
            value={form.supervisorName || "请选择"}
            onClick={() => {
              supervisorVisible.value = true;
            }}
          />
          <div class={styles.formBlock}>
            <div class={styles.formLabel}>风险等级</div>
            <RadioGroup v-model={form.riskLevel} direction="horizontal">
              {KEY_PERSON_RISK_LEVEL_OPTIONS.filter((item) => item.value).map((item) => (
                <Radio name={item.value} key={item.value}>
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          </div>
          <Field
            v-model={form.supervisionReason}
            label="监管原因"
            type="textarea"
            rows={4}
            autosize
            maxlength={500}
            showWordLimit
            placeholder="请输入监管原因"
          />
          <div class={styles.formBlock}>
            <div class={styles.formLabel}>人员照片</div>
            <FileUploader
              v-model:fileIds={photoIds.value}
              v-model:files={photoFiles.value}
              sceneCode={KEY_PERSON_SCENE.PHOTO}
              maxCount={1}
              accept="image/*"
              imageMode
            />
          </div>
          <div class={styles.formBlock}>
            <div class={styles.formLabel}>相关附件</div>
            <FileUploader
              v-model:fileIds={attachmentIds.value}
              v-model:files={attachmentFiles.value}
              sceneCode={KEY_PERSON_SCENE.ATTACHMENT}
              maxCount={6}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>
          <div class={styles.submitBar}>
            <Button block type="primary" nativeType="submit" loading={submitting.value} disabled={submitting.value}>
              保存
            </Button>
          </div>
        </Form>
        <Popup v-model:show={areaVisible.value} position="bottom" round class={styles.optionPopup}>
          <div class={styles.popupTitle}>选择区域</div>
          <Search
            v-model={areaKeyword.value}
            placeholder="搜索区域"
            onSearch={() => void loadOptions()}
            onClear={() => void loadOptions()}
          />
          <div class={styles.optionList}>
            {areas.value.map((area) => (
              <Cell
                key={area.sequence}
                title={area.name}
                onClick={() => {
                  form.areaSequence = area.sequence;
                  form.areaName = area.name.trim();
                  areaVisible.value = false;
                }}
              />
            ))}
          </div>
        </Popup>
        <Popup v-model:show={supervisorVisible.value} position="bottom" round class={styles.optionPopup}>
          <div class={styles.popupTitle}>选择监管人员</div>
          <Search
            v-model={supervisorKeyword.value}
            placeholder="搜索监管人员"
            onSearch={() => void loadOptions()}
            onClear={() => void loadOptions()}
          />
          <div class={styles.optionList}>
            {supervisors.value.map((user) => (
              <Cell
                key={user.userId}
                title={user.name}
                label={`${maskPhone(user.mobileMasked)} ${user.organizationName ?? ""}`}
                onClick={() => {
                  form.supervisorUserId = user.userId;
                  form.supervisorName = user.name;
                  supervisorVisible.value = false;
                }}
              />
            ))}
          </div>
        </Popup>
      </div>
    );
  },
});

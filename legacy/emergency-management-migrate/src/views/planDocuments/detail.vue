<template>
  <g-detail :title="'预案文件-' + title" :formList="formList" :api="api" :afterGet="afterGet" :rules="rules" :saveBtn="false">
    <template #expirationDate="{ record }">
      <a-date-picker
        v-model:value="record.expirationDate"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        placeholder="请选择"
        allow-clear
        class="plan-doc-expiration-date"
        :get-popup-container="pickerPopupContainer"
      />
    </template>
    <template #edit-item="{ record }">
      <a-form-item v-if="record.generated" label="预案正文" class="a-form-item-100 generated-content-item">
        <GeneratedContentEditor
          v-model="record.contentHtml"
          :metadata="generatedMetadata(record)"
          :readonly="type === 'detail'"
          @update:model-value="clearPlanTasks"
        />
      </a-form-item>
      <a-form-item v-if="record.generated" label="正文附件" class="a-form-item-100 generated-content-item">
        <GeneratedAttachmentUpload
          v-model="record.contentFileIds"
          :files="record.contentFileVOS"
          :readonly="type === 'detail'"
          :show-header="false"
        />
      </a-form-item>
      <a-form-item v-if="!record.generated" label="附件文件" name="documentFileId" class="a-form-item-100" style="margin-bottom: 80px">
        <g-upload
          :size="1024"
          listType="text"
          v-model:value="record.documentFileId"
          :file="record.documentFileVOS"
          businessKey="emergency"
          accept="doc,docx,xls,xlsx,ppt,pptx,pdf"
          :disabled="type === 'detail'"
          :sceneCode="GLOBAL_SCENE_CODE.emergencyFile"
          @change="clearPlanTasks"
        ></g-upload>
        <span class="file-txt" v-if="type !== 'detail'">
          支持上传文档（.doc/.docx/.xls/.xlsx/.ppt/.pptx/.pdf）最大为20MB，只能上传1个文件
        </span>
      </a-form-item>
      <a-form-item v-if="!record.generated" label="处理流程" name="processFileId" class="a-form-item-100">
        <g-upload
          v-if="type !== 'detail'"
          :size="1024"
          v-model:value="record.processFileId"
          :sceneCode="GLOBAL_SCENE_CODE.emergencyFile"
          :file="record.processFileVOS"
          businessKey="emergency"
        ></g-upload>
        <span class="file-txt" v-if="type !== 'detail'"> 支持上传图片（.png/.jpeg/.jpg）最大为20MB，只能上传1个文件 </span>
        <a-image
          v-else-if="record.processFileVOS && record.processFileVOS.length"
          :src="record.processFileVOS[0].path"
          :width="100"
        ></a-image>
      </a-form-item>
    </template>
    <template #btn="{ record }">
      <a-button v-if="canDownloadWord(getDetailRecord(record))" @click="downloadWord(getDetailRecord(record))">下载Word</a-button>
      <a-button v-if="type !== 'detail'" :loading="taskDecomposing" @click="decomposeRecord(record)">
        {{ planTasks.length ? "重新拆解任务" : "AI拆解任务" }}
      </a-button>
      <a-button v-else-if="planTasks.length" @click="taskDrawerVisible = true">查看结构化任务</a-button>
      <a-button v-if="type !== 'detail'" type="primary" @click="saveRecord(record)" :loading="saveLoading">提交审批</a-button>
    </template>
  </g-detail>

  <a-drawer v-model:visible="taskDrawerVisible" title="结构化任务" :width="760" :destroy-on-close="false">
    <a-alert v-if="taskWarnings.length" class="task-warning" type="warning" show-icon :message="taskWarnings.join('；')" />
    <PlanTaskEditor v-model="planTasks" :readonly="type === 'detail'" />
  </a-drawer>
</template>
<script lang="jsx">
import { Modal } from "ant-design-vue";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import moment from "moment";
import { defineComponent, onMounted, reactive, toRefs, ref, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { decomposeEmergencyPlanTasks } from "@ghcloud/cube-services-client/emergency-plan-ai.client";

import { parsePlanDraftState } from "../planGenerate/planDraft";
import GeneratedAttachmentUpload from "./GeneratedAttachmentUpload.vue";
import GeneratedContentEditor from "./GeneratedContentEditor.vue";
import { normalizeStoredPlanTasks, toApprovalTasks, validatePlanTasks } from "./planTask";
import PlanTaskEditor from "./PlanTaskEditor.vue";
import { sanitizeRichText } from "./richText";
export default defineComponent({
  components: {
    GeneratedAttachmentUpload,
    GeneratedContentEditor,
    PlanTaskEditor,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const { type } = route.query;
    const saveLoading = ref(false);
    const taskDecomposing = ref(false);
    const taskDrawerVisible = ref(false);
    const planTasks = ref([]);
    const taskWarnings = ref([]);
    const generatedFile = ref(false);
    const levelDisplayMap = {
      IMPORTANT: { text: "重要", color: "red" },
      ORDINARY: { text: "普通", color: "blue" },
    };
    const statusDisplayMap = {
      DRAFT: { text: "草稿", color: "default" },
      APPROVING: { text: "审批中", color: "orange" },
      ACTIVE: { text: "已生效", color: "green" },
      ABOLISHED: { text: "已废止", color: "red" },
    };
    const renderTag = (displayMap, value) => {
      const display = displayMap[value];
      if (!display) {
        return "--";
      }
      const colorClass = display.color === "default" ? "" : ` ant-tag-${display.color}`;
      return `<span class="ant-tag${colorClass}">${display.text}</span>`;
    };
    const validateManualAttachment = (message) => (_rule, value) => {
      if (generatedFile.value || value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    };
    const state = reactive({
      title: "新增",
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: "文件名称",
              value: "name",
              placeholder: "请输入文件名称",
              maxlength: 20,
            },
            {
              label: "文件类型",
              value: "emergencyFileTypeId",
              detailValue: "emergencyFileTypeName",
              component: "gSelect",
              url: "fileTypeList",
              field: { name: "label", id: "value" },
              placeholder: "请选择文件类型",
            },
            {
              label: "文件级别",
              value: "levelCode",
              component: "gSelect",
              detailFun: (value) => renderTag(levelDisplayMap, value),
              html: true,
              options: [
                { label: "重要", value: "IMPORTANT" },
                { label: "普通", value: "ORDINARY" },
              ],
              placeholder: "请选择文件级别",
            },
            ...(type === "detail"
              ? [
                  {
                    label: "预案状态",
                    value: "status",
                    detailFun: (value) => renderTag(statusDisplayMap, value),
                    html: true,
                  },
                  {
                    label: "编制部门",
                    value: "compilerDepartmentName",
                  },
                  {
                    label: "编制人",
                    value: "compilerName",
                  },
                ]
              : []),
            {
              label: "到期日期",
              value: "expirationDate",
              component: "a-date-picker",
              slot: type !== "detail",
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD",
              placeholder: "请选择",
            },
            {
              label: "事件分类",
              value: "emergencyEventTypeCode",
              detailValue: "emergencyEventTypeName",
              component: "gSelect",
              url: "geteventtypes",
              field: { name: "label", code: "value" },
              placeholder: "请选择事件分类",
            },

            {
              label: "文件描述",
              value: "remark",
              component: "a-textarea",
              singleLine: true,
              placeholder: "请填写备注信息，最多输入200个字符",
              showCount: true,
              maxlength: 200,
            },
          ],
        },
      ],
      api: {
        add: "addPlanDocument",
        detail: "planDocumentDetail",
        edit: "editPlanDocument",
      },
      rules: {
        name: [{ required: true, message: "请输入文件名称" }],
        emergencyEventTypeCode: [{ required: true, message: "请选择事件分类" }],
        levelCode: [{ required: true, message: "请选择文件级别" }],
        emergencyFileTypeId: [{ required: true, message: "请选择文件类型" }],
        documentFileId: [{ validator: validateManualAttachment("请上传附件文件"), trigger: "change" }],
        processFileId: [{ validator: validateManualAttachment("请上传处理流程"), trigger: "change" }],
      },
    });
    onMounted(() => {
      if (type == "edit") {
        state.title = "编辑";
      } else if (type == "detail") {
        state.title = "详情";
      } else {
        state.title = "新增";
      }
    });

    const pickerPopupContainer = (triggerNode) => {
      if (!triggerNode || typeof triggerNode.closest !== "function") {
        return document.body;
      }
      return triggerNode.closest(".g-layout-container") || document.body;
    };

    const generatedMetadata = (record) => {
      const level = record.levelCode === "IMPORTANT" ? "重要" : record.levelCode === "ORDINARY" ? "普通" : "";
      return [record.emergencyFileTypeName, level, record.emergencyEventTypeName].filter(Boolean).join(" | ");
    };

    const canDownloadWord = (record) => Boolean(record?.generated && record?.contentHtml);

    const getDetailRecord = (detailForm) => detailForm?.form || null;

    const escapeXml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const normalizeFileName = (value) => {
      const name = String(value || "预案正文")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_");
      return name || "预案正文";
    };

    const paragraphXml = (text, options = {}) => {
      const content = escapeXml(text).replace(/\n/g, "<w:br/>");
      const justify = options.align ? `<w:jc w:val="${options.align}"/>` : "";
      const bold = options.bold ? "<w:b/>" : "";
      const size = options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : "";
      const paragraphProps = justify ? `<w:pPr>${justify}</w:pPr>` : "";
      const runProps = bold || size ? `<w:rPr>${bold}${size}</w:rPr>` : "";
      return `<w:p>${paragraphProps}<w:r>${runProps}<w:t xml:space="preserve">${content}</w:t></w:r></w:p>`;
    };

    const collectText = (node) =>
      Array.from(node.childNodes || [])
        .map((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            return child.textContent || "";
          }
          if (child.nodeName === "BR") {
            return "\n";
          }
          return collectText(child);
        })
        .join("")
        .replace(/\u00a0/g, " ")
        .trim();

    const tableXml = (table) => {
      const rows = Array.from(table.querySelectorAll("tr"))
        .map((row) => {
          const cells = Array.from(row.children).filter((cell) => ["TD", "TH"].includes(cell.nodeName));
          const cellXml = cells
            .map((cell) => {
              const text = collectText(cell);
              return `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>${paragraphXml(text, { bold: cell.nodeName === "TH" })}</w:tc>`;
            })
            .join("");
          return `<w:tr>${cellXml}</w:tr>`;
        })
        .join("");
      return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:left w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:right w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`;
    };

    const nodeToWordXml = (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }
      if (node.nodeName === "TABLE") {
        return tableXml(node);
      }
      if (node.querySelector?.("table")) {
        return Array.from(node.childNodes).map(nodeToWordXml).join("");
      }
      const text = collectText(node);
      if (!text) {
        return "";
      }
      if (node.nodeName === "H1") {
        return paragraphXml(text, { align: "center", bold: true, size: 32 });
      }
      if (node.nodeName === "H2") {
        return paragraphXml(text, { bold: true, size: 28 });
      }
      if (node.nodeName === "H3") {
        return paragraphXml(text, { bold: true, size: 24 });
      }
      if (node.nodeName === "LI") {
        return paragraphXml(`• ${text}`);
      }
      return paragraphXml(text);
    };

    const contentToWordBodyXml = (record) => {
      const content = sanitizeRichText(record?.contentHtml || "");
      const document = new DOMParser().parseFromString(`<body>${content}</body>`, "text/html");
      const metadata = generatedMetadata(record);
      const metadataXml = metadata ? paragraphXml(metadata, { align: "center", size: 20 }) : "";
      const contentXml = Array.from(document.body.childNodes).map(nodeToWordXml).join("");
      return `${metadataXml}${contentXml}`;
    };

    const buildDocumentXml = (record) => {
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${contentToWordBodyXml(record)}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
  </w:body>
</w:document>`;
    };

    const buildDocxBlob = async (record) => {
      const zip = new JSZip();
      zip.file(
        "[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
      );
      zip.folder("_rels").file(
        ".rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
      );
      zip.folder("word").file("document.xml", buildDocumentXml(record));
      return zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    };

    const downloadWord = async (record) => {
      if (!canDownloadWord(record)) {
        proxy.$message.warning("暂无可下载的预案正文");
        return;
      }
      const blob = await buildDocxBlob(record);
      saveAs(blob, `${normalizeFileName(record.name)}.docx`);
    };

    const clearPlanTasks = () => {
      planTasks.value = [];
      taskWarnings.value = [];
    };

    const confirmTaskReplacement = () =>
      new Promise((resolve) => {
        if (!planTasks.value.length) {
          resolve(true);
          return;
        }
        Modal.confirm({
          title: "重新拆解任务",
          content: "重新拆解会替换当前任务草稿，是否继续？",
          okText: "继续拆解",
          cancelText: "取消",
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

    const firstFileId = (value) => {
      if (Array.isArray(value)) {
        return String(value[0] || "").trim();
      }
      return String(value || "")
        .split(",")[0]
        .trim();
    };

    const documentFileName = (record) => {
      const file = Array.isArray(record.documentFileVOS) ? record.documentFileVOS[0] : null;
      return file?.name || file?.fileName || file?.originalName || null;
    };

    const decomposeRecord = async (gDetailForm) => {
      const record = getDetailRecord(gDetailForm);
      if (!record?.name?.trim()) {
        proxy.$message.warning("请先填写文件名称");
        return;
      }
      const sourceType = record.generated ? "RICH_TEXT" : "FILE";
      const contentHtml = record.generated ? sanitizeRichText(record.contentHtml || "") : null;
      const fileId = record.generated ? null : firstFileId(record.documentFileId);
      if (sourceType === "RICH_TEXT" && !contentHtml) {
        proxy.$message.warning("预案正文不能为空");
        return;
      }
      if (sourceType === "FILE" && !fileId) {
        proxy.$message.warning("请先上传附件文件");
        return;
      }
      if (!(await confirmTaskReplacement())) {
        return;
      }
      try {
        taskDecomposing.value = true;
        const result = await decomposeEmergencyPlanTasks({
          sourceType,
          contentHtml,
          fileId,
          fileName: record.generated ? `${record.name.trim()}.docx` : documentFileName(record),
          planContext: {
            name: record.name.trim(),
            levelCode: record.levelCode || null,
            fileTypeName: record.emergencyFileTypeName || null,
            emergencyEventTypeCode: record.emergencyEventTypeCode || null,
            emergencyEventTypeName: record.emergencyEventTypeName || null,
          },
        });
        planTasks.value = result.tasks;
        taskWarnings.value = result.warnings;
        taskDrawerVisible.value = true;
        proxy.$message.success(`已拆解生成${result.tasks.length}个任务`);
      } catch (error) {
        proxy.$message.error(error instanceof Error ? error.message : "任务拆解失败，请稍后重试");
      } finally {
        taskDecomposing.value = false;
      }
    };

    const afterGet = (res) => {
      generatedFile.value = Boolean(res.generated);
      const draftState = res.status === "DRAFT" ? parsePlanDraftState(res.draftStateJson) : null;
      planTasks.value = draftState ? draftState.planTasks : normalizeStoredPlanTasks(res.tasks || []);
      const documentFileVOS = (res.documentFileVOS || []).map((item) => {
        return { ...item, url: item.path };
      });
      const processFileVOS = (res.processFileVOS || []).map((item) => {
        return { ...item, url: item.path };
      });
      const contentFileVOS = (res.contentFileVOS || []).map((item) => {
        return { ...item, url: item.path };
      });
      return {
        ...res,
        documentFileVOS,
        processFileVOS,
        contentFileVOS,
        contentFileIds: res.contentFileIds || "",
        contentHtml: res.contentHtml || "",
        expirationDate: res.expirationDate ? moment(res.expirationDate).format("YYYY-MM-DD") : null,
      };
    };

    /*保存数据*/
    const saveRecord = async (gDetailForm) => {
      await gDetailForm.formRef.validate();
      const taskError = validatePlanTasks(planTasks.value);
      if (taskError) {
        proxy.$message.warning(taskError);
        taskDrawerVisible.value = true;
        return;
      }
      try {
        saveLoading.value = true;
        if (gDetailForm.form.generated) {
          gDetailForm.form.contentHtml = sanitizeRichText(gDetailForm.form.contentHtml);
        }
        const payload = {
          ...(type === "edit" ? { id: gDetailForm.form.id } : {}),
          file: gDetailForm.form,
          tasks: toApprovalTasks(planTasks.value),
        };
        await proxy.$api[state.api.add](payload, "post");
        proxy.$message.success(type === "edit" ? "预案修订已提交审批" : "预案已提交审批");
        router.replace("/planApproval/list");
      } catch (error) {
        proxy.$message.error(error instanceof Error ? error.message : "保存失败，请稍后重试");
      } finally {
        saveLoading.value = false;
      }
    };

    return {
      ...toRefs(state),
      afterGet,
      type,
      saveRecord,
      saveLoading,
      taskDecomposing,
      taskDrawerVisible,
      planTasks,
      taskWarnings,
      decomposeRecord,
      clearPlanTasks,
      GLOBAL_SCENE_CODE,
      pickerPopupContainer,
      generatedMetadata,
      getDetailRecord,
      canDownloadWord,
      downloadWord,
    };
  },
});
</script>

<style lang="less" scoped>
.file-txt {
  display: block;
}

.task-warning {
  margin-bottom: 12px;
}

:deep(.ant-form-inline .ant-form-item) {
  width: 40% !important;
}

:deep(.plan-doc-expiration-date) {
  width: 100%;
  max-width: 300px;
}

:deep(.generated-content-item) {
  display: flex;
  width: 100% !important;
  margin: 18px 0 0;
}

:deep(.generated-content-item .ant-form-item-control) {
  flex: 1;
  max-width: calc(100% - 105px);
}
</style>

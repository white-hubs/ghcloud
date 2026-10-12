<template>
  <g-layout class="task-template-page" :title="pageTitle || '任务模板配置'">
    <template #header-btn>
      <a-button type="primary" @click="openCreate">+ 新建模板</a-button>
    </template>

    <template #content-left>
      <aside class="template-sidebar">
        <a-input-search v-model:value="query.name" allow-clear placeholder="搜索模板..." @search="searchTemplates" />

        <a-spin :spinning="listLoading" class="template-list-spin">
          <div v-if="templates.length" class="template-list">
            <button
              v-for="item in templates"
              :key="item.id"
              type="button"
              class="template-item"
              :class="{ active: selectedId === item.id }"
              @click="selectTemplate(item.id)"
            >
              <span class="template-item-name">{{ item.name }}</span>
              <span class="step-count">{{ item.stepCount || 0 }}步</span>
            </button>
          </div>
          <a-empty v-else :image="simpleImage" description="暂无模板" />
        </a-spin>

        <a-pagination
          v-if="total > query.pageSize"
          v-model:current="query.pageNumber"
          simple
          :page-size="query.pageSize"
          :total="total"
          @change="changePage"
        />
        <div class="template-total">共 {{ total }} 个模板</div>
      </aside>
    </template>

    <template #content-table>
      <main class="template-editor">
        <a-spin :spinning="detailLoading">
          <template v-if="editor.id">
            <div class="editor-heading">
              <div>
                <h2>{{ editor.name }}</h2>
                <p>通过关键词匹配模板，自动填充标准步骤和装备</p>
              </div>
            </div>

            <a-form layout="vertical" :model="editor">
              <div class="field-grid">
                <a-form-item label="匹配关键词" required>
                  <a-input v-model:value="editor.matchingKeywordsText" placeholder="用逗号或顿号分隔" />
                  <div class="field-help">命中任一关键词即可匹配此模板</div>
                </a-form-item>
                <a-form-item label="适用场景">
                  <a-input v-model:value="editor.applicableScenesText" placeholder="留空表示全部场景" />
                </a-form-item>
              </div>

              <section class="form-section">
                <div class="section-heading">
                  <span>标准步骤</span>
                  <a-button size="small" @click="addStep(editor.standardSteps)">+ 添加步骤</a-button>
                </div>
                <div class="step-list">
                  <div v-for="(_, index) in editor.standardSteps" :key="index" class="step-row">
                    <span class="step-number">{{ index + 1 }}</span>
                    <a-input v-model:value="editor.standardSteps[index]" size="small" :placeholder="`请输入第${index + 1}个步骤`" />
                    <a-button type="link" class="remove-step" @click="removeStep(editor.standardSteps, index)"> 删除 </a-button>
                  </div>
                </div>
              </section>

              <a-form-item label="标准装备" required class="equipment-field">
                <a-textarea
                  v-model:value="editor.standardEquipmentText"
                  :rows="3"
                  placeholder="用逗号、顿号或换行分隔，如：对讲机×1、检测仪×2"
                />
                <div class="field-help">按实际情况填写执行任务所需装备</div>
              </a-form-item>
            </a-form>
          </template>
          <a-empty v-else description="请选择或新建模板" />
        </a-spin>
      </main>
    </template>

    <template #footer-btn>
      <a-popconfirm v-if="editor.id" :title="`确认删除模板“${editor.name}”？`" ok-text="删除" cancel-text="取消" @confirm="removeTemplate">
        <a-button>删除此模板</a-button>
      </a-popconfirm>
    </template>

    <template #footer-page>
      <a-space v-if="editor.id">
        <a-button :disabled="saving" @click="resetEditor">重置</a-button>
        <a-button type="primary" :loading="saving" @click="saveTemplate">保存模板</a-button>
      </a-space>
    </template>
  </g-layout>

  <a-modal
    v-model:visible="createVisible"
    title="新建任务模板"
    width="640px"
    wrap-class-name="task-template-modal"
    :confirm-loading="creating"
    :mask-closable="false"
    ok-text="创建模板"
    cancel-text="取消"
    @ok="createTemplate"
    @cancel="closeCreate"
  >
    <a-form layout="vertical" :model="createForm">
      <a-form-item label="模板名称" required>
        <a-input v-model:value="createForm.name" placeholder="如：现场监测、警戒巡逻" />
      </a-form-item>

      <div class="field-grid">
        <a-form-item label="匹配关键词" required>
          <a-input v-model:value="createForm.matchingKeywordsText" placeholder="用逗号或顿号分隔" />
          <div class="field-help">命中任一关键词即可匹配此模板</div>
        </a-form-item>
        <a-form-item label="适用场景">
          <a-input v-model:value="createForm.applicableScenesText" placeholder="留空表示全部场景" />
        </a-form-item>
      </div>

      <section class="form-section create-step-section">
        <div class="section-heading">
          <span>初始步骤</span>
          <a-button size="small" @click="addStep(createForm.standardSteps)">+ 添加步骤</a-button>
        </div>
        <div class="step-list">
          <div v-for="(_, index) in createForm.standardSteps" :key="index" class="step-row">
            <span class="step-number">{{ index + 1 }}</span>
            <a-input v-model:value="createForm.standardSteps[index]" size="small" :placeholder="`请输入第${index + 1}个步骤`" />
            <a-button type="link" class="remove-step" @click="removeStep(createForm.standardSteps, index)"> 删除 </a-button>
          </div>
        </div>
      </section>

      <a-form-item label="初始装备" required class="equipment-field">
        <a-textarea
          v-model:value="createForm.standardEquipmentText"
          :rows="2"
          placeholder="用逗号、顿号或换行分隔，如：对讲机×1、检测仪×2"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="jsx">
import { Empty, message } from "ant-design-vue";
import { defineComponent, onMounted, reactive, toRefs } from "vue";

import { usePageName } from "@ghcloud/cube-utils";

import { addTaskTemplate, deleteTaskTemplate, editTaskTemplate, taskTemplateDetail, taskTemplatePage } from "@/api";

const emptyForm = () => ({
  id: null,
  name: "",
  matchingKeywordsText: "",
  applicableScenesText: "",
  standardSteps: [""],
  standardEquipmentText: "",
});

const joinValues = (values) => (Array.isArray(values) ? values.filter(Boolean).join("、") : "");

const splitValues = (value) =>
  String(value || "")
    .split(/[，,、；;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const toEditor = (detail) => ({
  id: detail.id,
  name: detail.name || "",
  matchingKeywordsText: joinValues(detail.matchingKeywords),
  applicableScenesText: joinValues(detail.applicableScenes),
  standardSteps: Array.isArray(detail.standardSteps) ? [...detail.standardSteps] : [],
  standardEquipmentText: joinValues(detail.standardEquipment),
});

const toPayload = (form) => ({
  name: form.name.trim(),
  matchingKeywords: splitValues(form.matchingKeywordsText),
  applicableScenes: splitValues(form.applicableScenesText),
  standardSteps: form.standardSteps.map((item) => String(item || "").trim()).filter(Boolean),
  standardEquipment: splitValues(form.standardEquipmentText),
});

const validateForm = (form, includeName = false) => {
  const payload = toPayload(form);
  if (includeName && !payload.name) {
    message.warning("请输入模板名称");
    return null;
  }
  if (!payload.matchingKeywords.length) {
    message.warning("请输入匹配关键词");
    return null;
  }
  if (!payload.standardSteps.length) {
    message.warning("请至少填写一个标准步骤");
    return null;
  }
  if (!payload.standardEquipment.length) {
    message.warning("请输入标准装备");
    return null;
  }
  return payload;
};

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle,
      listLoading: false,
      detailLoading: false,
      saving: false,
      creating: false,
      createVisible: false,
      templates: [],
      selectedId: null,
      total: 0,
      query: {
        name: "",
        pageNumber: 1,
        pageSize: 20,
      },
      editor: emptyForm(),
      createForm: emptyForm(),
    });

    const loadDetail = async (id) => {
      state.detailLoading = true;
      try {
        const detail = await taskTemplateDetail(id);
        if (state.selectedId === id) {
          state.editor = toEditor(detail);
        }
      } finally {
        state.detailLoading = false;
      }
    };

    const loadTemplates = async () => {
      state.listLoading = true;
      try {
        const result = await taskTemplatePage(state.query);
        state.templates = result?.records || [];
        state.total = Number(result?.total || 0);
        const selected = state.templates.find((item) => item.id === state.selectedId) || state.templates[0];
        if (selected) {
          state.selectedId = selected.id;
          await loadDetail(selected.id);
        } else {
          state.selectedId = null;
          state.editor = emptyForm();
        }
      } finally {
        state.listLoading = false;
      }
    };

    const selectTemplate = async (id) => {
      state.selectedId = id;
      await loadDetail(id);
    };

    const searchTemplates = () => {
      state.query.pageNumber = 1;
      loadTemplates();
    };

    const changePage = (page) => {
      state.query.pageNumber = page;
      loadTemplates();
    };

    const addStep = (steps) => {
      steps.push("");
    };

    const removeStep = (steps, index) => {
      steps.splice(index, 1);
    };

    const resetEditor = () => {
      if (state.selectedId) {
        loadDetail(state.selectedId);
      }
    };

    const saveTemplate = async () => {
      const payload = validateForm(state.editor);
      if (!payload) {
        return;
      }
      state.saving = true;
      try {
        await editTaskTemplate(state.editor.id, payload);
        message.success("模板已保存");
        await loadTemplates();
      } finally {
        state.saving = false;
      }
    };

    const removeTemplate = async () => {
      await deleteTaskTemplate(state.editor.id);
      message.success("模板已删除");
      state.selectedId = null;
      if (state.templates.length === 1 && state.query.pageNumber > 1) {
        state.query.pageNumber -= 1;
      }
      await loadTemplates();
    };

    const openCreate = () => {
      state.createForm = emptyForm();
      state.createVisible = true;
    };

    const closeCreate = () => {
      if (!state.creating) {
        state.createVisible = false;
      }
    };

    const createTemplate = async () => {
      const payload = validateForm(state.createForm, true);
      if (!payload) {
        return;
      }
      state.creating = true;
      try {
        const id = await addTaskTemplate(payload);
        message.success("模板已创建");
        state.createVisible = false;
        state.selectedId = id;
        state.query.name = "";
        state.query.pageNumber = 1;
        await loadTemplates();
      } finally {
        state.creating = false;
      }
    };

    onMounted(loadTemplates);

    return {
      ...toRefs(state),
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      selectTemplate,
      searchTemplates,
      changePage,
      addStep,
      removeStep,
      resetEditor,
      saveTemplate,
      removeTemplate,
      openCreate,
      closeCreate,
      createTemplate,
    };
  },
});
</script>

<style lang="less" scoped>
.task-template-page {
  :deep(.content-left) {
    width: 256px;
    flex: 0 0 256px;
    padding-right: 16px;
    border-right: 1px solid #f0f0f0;
  }

  :deep(.content-right) {
    padding-left: 16px;
  }

  :deep(.content-table),
  :deep(.content-table > .template-editor) {
    height: 100%;
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.content-table .ant-form.ant-form-vertical .ant-form-item .ant-form-item-label) {
    width: 100% !important;
    max-width: none !important;
    margin-right: 0 !important;
    overflow: visible;
  }
}

.template-sidebar {
  display: flex;
  width: 240px;
  height: 100%;
  flex-direction: column;

  :deep(.ant-pagination) {
    margin-top: 8px;
    text-align: center;
  }
}

.template-list-spin {
  flex: 1;
  min-height: 0;
  margin-top: 8px;

  :deep(.ant-spin-container) {
    height: 100%;
  }
}

.template-list {
  max-height: 100%;
  overflow-y: auto;
}

.template-item {
  display: flex;
  width: 100%;
  height: 36px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  outline: none;
  color: #595959;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;

  &:hover {
    color: #595959;
    background: #f5f5f5;
  }

  &.active {
    color: var(--emergency-management-migrate-primary-color);
    background: var(--emergency-management-migrate-primary-1);
    font-weight: 500;
  }
}

.template-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-count {
  flex-shrink: 0;
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 8px;
  color: #8c8c8c;
  background: #f0f0f0;
  font-size: 11px;
  font-weight: 400;
  line-height: 18px;
}

.template-total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  color: #8c8c8c;
  font-size: 12px;
}

.template-editor {
  min-width: 0;
  padding-top: 16px;
  padding-right: 2px;
  overflow-y: auto;

  > :deep(.ant-spin-nested-loading),
  > :deep(.ant-spin-nested-loading > .ant-spin-container) {
    min-height: 100%;
  }

  :deep(.ant-empty) {
    margin-top: 120px;
  }
}

.editor-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;

  h2 {
    margin: 0;
    color: #262626;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  p {
    margin: 2px 0 0;
    color: #8c8c8c;
    font-size: 12px;
  }
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-help {
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 18px;
}

.form-section {
  margin-bottom: 16px;
}

.create-step-section {
  margin-bottom: 24px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #595959;
  font-size: 13px;
  font-weight: 500;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.step-number {
  display: inline-flex;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #595959;
  background: #f0f0f0;
  font-size: 11px;
}

.remove-step {
  flex: 0 0 auto;
  padding-right: 0;
}

.equipment-field {
  margin-bottom: 0 !important;
}

@media (max-width: 900px) {
  .task-template-page {
    :deep(.content-left) {
      width: 226px;
      flex-basis: 226px;
    }
  }

  .template-sidebar {
    width: 210px;
  }

  .field-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>

<style lang="less">
.task-template-modal {
  .ant-modal-body {
    padding: 20px 24px 8px;
  }

  .ant-form-vertical .ant-form-item {
    margin-bottom: 16px !important;
  }

  .ant-modal-body .ant-form.ant-form-vertical .ant-form-item .ant-form-item-label {
    width: 100% !important;
    max-width: none !important;
    margin-right: 0 !important;
    padding: 0 0 4px;
    line-height: 20px;
    text-align: left;
    white-space: nowrap;
    overflow: visible;
  }

  .ant-form-vertical .ant-form-item-label > label {
    height: 20px;
  }
}
</style>

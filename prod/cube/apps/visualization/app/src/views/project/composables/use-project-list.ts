import { message, Modal } from "ant-design-vue";
import { onMounted, reactive, ref, type Ref } from "vue";
import { useRouter } from "vue-router";

import {
  copyVisualProject,
  createVisualProject,
  deleteVisualProject,
  listVisualProjects,
  updateVisualProject,
} from "@ghcloud/cube-services-client/visualization.client";

import {
  buildPreviewLink,
  CONFIG_DEFAULT_TAB,
  CONFIG_SHELL_PATH,
  DEFAULT_PROJECT_FORM,
  type ConfigGroup,
  type ProjectFormState,
  type ProjectRecord,
} from "../project.const";
import { useAuthRequest } from "@/hooks/auth-request";
import { saveProjectListQuery, type ProjectListQueryCache } from "@/hooks/use-list-return-query";

interface UseProjectListOptions {
  /** 列表数据变更后回调（如刷新表格） */
  onListChanged?: () => void;
}

export const useProjectList = (options: UseProjectListOptions = {}) => {
  const router = useRouter();
  const loading = ref(false);
  const allProjects: Ref<ProjectRecord[]> = ref([]);

  const formModal = reactive({
    open: false,
    mode: "create" as "create" | "edit" | "copy",
    submitting: false,
  });
  const formState = reactive<ProjectFormState>({ ...DEFAULT_PROJECT_FORM });

  const notifyChanged = (): void => {
    options.onListChanged?.();
  };

  const buildCopyName = (projectName: string): string => {
    const suffix = "-副本";
    const base = (projectName || "未命名项目").trim() || "未命名项目";
    const maxBaseLen = Math.max(1, 20 - suffix.length);
    return `${base.slice(0, maxBaseLen)}${suffix}`;
  };

  const loadData = async (): Promise<ProjectRecord[]> => {
    loading.value = true;
    try {
      allProjects.value = await useAuthRequest(() => listVisualProjects());
      return allProjects.value;
    } catch {
      message.error("加载项目列表失败");
      allProjects.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const openCreate = (): void => {
    Object.assign(formState, DEFAULT_PROJECT_FORM);
    formModal.mode = "create";
    formModal.open = true;
  };

  const openEdit = (record: ProjectRecord): void => {
    formState.id = record.id;
    formState.projectName = record.projectName;
    formState.canvas = record.canvas || "16:9";
    formState.mainStructure = record.mainStructure || "structure-one";
    formModal.mode = "edit";
    formModal.open = true;
  };

  const openCopy = (record: ProjectRecord): void => {
    formState.id = record.id;
    formState.projectName = buildCopyName(record.projectName);
    formState.canvas = record.canvas || "16:9";
    formState.mainStructure = record.mainStructure || "structure-one";
    formModal.mode = "copy";
    formModal.open = true;
  };

  const closeForm = (): void => {
    formModal.open = false;
    Object.assign(formState, DEFAULT_PROJECT_FORM);
  };

  const submitForm = async (): Promise<void> => {
    const name = formState.projectName.trim();
    if (!name) {
      message.warning("请输入项目名称");
      return;
    }
    if (name.length > 20) {
      message.warning("项目名称最多 20 个字");
      return;
    }
    const mode = formModal.mode;
    formModal.submitting = true;
    try {
      if (mode === "create") {
        await useAuthRequest(() =>
          createVisualProject({
            projectName: name,
            canvas: formState.canvas || "16:9",
            mainStructure: "structure-one",
          }),
        );
        await loadData();
        message.success("新增成功");
      } else if (mode === "copy") {
        const sourceId = formState.id;
        const beforeIds = new Set(allProjects.value.map((item) => item.id));
        await useAuthRequest(() => copyVisualProject(sourceId));
        const list = await loadData();
        const created = list.find((item) => !beforeIds.has(item.id));
        if (created && created.projectName !== name) {
          await useAuthRequest(() =>
            updateVisualProject({
              id: created.id,
              projectName: name,
              canvas: created.canvas || formState.canvas || "16:9",
              mainStructure: created.mainStructure || "structure-one",
            }),
          );
          await loadData();
        }
        message.success("复制成功");
      } else {
        await useAuthRequest(() =>
          updateVisualProject({
            id: formState.id,
            projectName: name,
            canvas: formState.canvas || "16:9",
            mainStructure: "structure-one",
          }),
        );
        await loadData();
        message.success("保存成功");
      }
      closeForm();
      notifyChanged();
    } catch {
      const failText = mode === "create" ? "新增失败" : mode === "copy" ? "复制失败" : "保存失败";
      message.error(failText);
    } finally {
      formModal.submitting = false;
    }
  };

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // 非安全上下文 / 权限不足时回退到 execCommand
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async (record: ProjectRecord): Promise<void> => {
    const link = buildPreviewLink(record.id);
    const ok = await copyTextToClipboard(link);
    if (ok) {
      message.success("链接已复制到剪贴板");
      return;
    }
    Modal.info({
      title: "获取链接",
      content: link,
      okText: "关闭",
      width: 520,
    });
    message.warning("自动复制失败，请手动复制弹窗中的链接");
  };

  const handleDelete = (record: ProjectRecord): void => {
    Modal.confirm({
      title: "删除项目",
      content: `确定删除「${record.projectName}」吗？删除后不可恢复。`,
      okText: "删除",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await useAuthRequest(() => deleteVisualProject(record.id));
          message.success("删除成功");
          await loadData();
          notifyChanged();
        } catch {
          message.error("删除失败");
        }
      },
    });
  };

  const goConfig = (record: ProjectRecord, group: ConfigGroup, listQuery?: ProjectListQueryCache): void => {
    if (listQuery) {
      saveProjectListQuery(listQuery);
    }
    void router.push({
      path: CONFIG_SHELL_PATH[group],
      query: {
        projectId: record.id,
        projectName: record.projectName,
        tab: CONFIG_DEFAULT_TAB[group],
      },
    });
  };

  onMounted(() => {
    void loadData().then(() => {
      notifyChanged();
    });
  });

  return {
    loading,
    allProjects,
    formModal,
    formState,
    loadData,
    openCreate,
    openEdit,
    openCopy,
    closeForm,
    submitForm,
    handleCopyLink,
    handleDelete,
    goConfig,
  };
};

import type { TenantDescriptorKind } from "@cube-ai/contracts";
import { defineComponent, ref, watch } from "vue";

import { Button, Modal, Textarea, message } from "@ghcloud/cube-ui";

import { agentConsoleClient } from "@/api/agent-console-client";
import { describeApiError } from "@/api/api-error";
import {
  extractDescriptorName,
  formatDescriptorDocumentFrontmatter,
  hasDescriptorFrontmatter,
  isValidDescriptorName,
  normalizeDescriptorNameSlug,
  slugifyDescriptorName,
} from "@/views/descriptor-document-format";

type ImportableDescriptorKind = Extract<TenantDescriptorKind, "agent" | "skill">;

const DESCRIPTOR_COPY: Record<
  ImportableDescriptorKind,
  {
    title: string;
    placeholder: string;
    success: string;
  }
> = {
  agent: {
    title: "导入智能体 Markdown",
    placeholder: [
      "---",
      "name: my-agent",
      "displayName: 我的智能体",
      "---",
      "",
      "# 我的智能体",
      "",
      "在这里粘贴 AGENT.md / Descriptor Document 原文。",
    ].join("\n"),
    success: "智能体导入成功",
  },
  skill: {
    title: "导入技能 Markdown",
    placeholder: [
      "---",
      "name: my-skill",
      "displayName: 我的技能",
      "activation:",
      "  mode: semantic",
      "---",
      "",
      "# 我的技能",
      "",
      "在这里粘贴 SKILL.md / Descriptor Document 原文。",
    ].join("\n"),
    success: "技能导入成功",
  },
};

export const DescriptorDocumentImportModal = defineComponent({
  name: "DescriptorDocumentImportModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    kind: {
      type: String as () => ImportableDescriptorKind,
      required: true,
    },
  },
  emits: ["update:visible", "success"],
  setup(props, { emit }) {
    const rawDocument = ref("");
    const submitting = ref(false);

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          rawDocument.value = "";
        }
      },
    );

    const close = (): void => {
      if (!submitting.value) {
        emit("update:visible", false);
      }
    };

    const updateRawDocument = (value: string | Event): void => {
      if (typeof value === "string") {
        rawDocument.value = value;
        return;
      }
      rawDocument.value = value.target instanceof HTMLTextAreaElement ? value.target.value : "";
    };

    const formatFrontmatter = (): void => {
      const raw = rawDocument.value;
      if (!hasDescriptorFrontmatter(raw)) {
        message.warning("未检测到 YAML 头部：请确认文档以 --- 开头、并有 --- 结束的 frontmatter");
        return;
      }
      const formatted = formatDescriptorDocumentFrontmatter(raw);
      if (formatted === raw) {
        message.info("头部已是规范格式，无需调整");
        return;
      }
      rawDocument.value = formatted;
      message.success("已格式化头部 YAML");
    };

    /** name 现在必须是 fail-closed slug（ADR-0033）；就地把中文/大写/空格等非法 name 折成合法 slug。 */
    const fixDescriptorName = (): void => {
      const raw = rawDocument.value;
      const name = extractDescriptorName(raw);
      if (!name) {
        message.warning("未在 frontmatter 中找到 name 字段");
        return;
      }
      if (isValidDescriptorName(name)) {
        message.info("name 已是合法 slug，无需调整");
        return;
      }
      const fixed = normalizeDescriptorNameSlug(raw);
      rawDocument.value = fixed;
      message.success(`已把 name 由 "${name}" 修正为 "${extractDescriptorName(fixed)}"`);
    };

    /** 提交前的客户端预校验：name 缺失/非法都会被服务端拒绝，先在本地拦截并给出可操作的提示。 */
    const validateBeforeSubmit = (raw: string): boolean => {
      if (!hasDescriptorFrontmatter(raw)) {
        message.warning("未检测到 YAML 头部：请确认文档以 --- 开头、并有 --- 结束的 frontmatter，且包含 name 字段");
        return false;
      }
      const name = extractDescriptorName(raw);
      if (!name) {
        message.error("frontmatter 缺少 name 字段：name 是租户内唯一标识（小写字母数字、连字符分隔），必须显式给出");
        return false;
      }
      if (!isValidDescriptorName(name)) {
        message.error(
          `name "${name}" 不是合法 slug（需小写字母数字+连字符，无空格/中文/大写/首尾连字符），建议改为 "${slugifyDescriptorName(name)}"，可点击「自动修正 name」`,
        );
        return false;
      }
      return true;
    };

    const submit = async (): Promise<void> => {
      const raw = rawDocument.value.trim();
      if (!raw) {
        message.warning("请先粘贴 Markdown 原文");
        return;
      }
      if (!validateBeforeSubmit(raw)) {
        return;
      }

      submitting.value = true;
      try {
        await agentConsoleClient.createFromDocument(props.kind, raw);
        message.success(DESCRIPTOR_COPY[props.kind].success);
        emit("success");
      } catch (error) {
        message.error(`导入失败：${describeApiError(error)}`);
      } finally {
        submitting.value = false;
      }
    };

    return () => {
      const copy = DESCRIPTOR_COPY[props.kind];
      return (
        <Modal
          title={copy.title}
          visible={props.visible}
          onCancel={close}
          width={760}
          centered
          footer={null}
          bodyStyle={{ padding: "20px 24px 16px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ color: "#667085", fontSize: "13px", lineHeight: "20px" }}>
              粘贴完整 Markdown 文档后导入。服务端会按 Descriptor Document 解析并创建或更新草稿。
            </div>
            <Textarea
              value={rawDocument.value}
              placeholder={copy.placeholder}
              rows={18}
              showCount={false}
              maxlength={100_000}
              onChange={updateRawDocument}
              onUpdate:value={updateRawDocument}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={formatFrontmatter} disabled={submitting.value}>
                  格式化头部 YAML
                </Button>
                <Button onClick={fixDescriptorName} disabled={submitting.value}>
                  自动修正 name
                </Button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={close} disabled={submitting.value}>
                  取消
                </Button>
                <Button type="primary" loading={submitting.value} onClick={() => void submit()}>
                  导入
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      );
    };
  },
});

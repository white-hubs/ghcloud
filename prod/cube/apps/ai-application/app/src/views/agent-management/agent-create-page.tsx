import type { TenantDescriptorView } from "@cube-ai/contracts";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";
import { FileUpload } from "@ghcloud/cube-app-design";
import { ArrowLeftOutlined, Button, Input, PopConfirm, Select, Spin, Textarea, message } from "@ghcloud/cube-ui";

import {
  buildAgentContentFromForm,
  deriveDescriptorName,
  formatAgentSavedTime,
  formatDescriptorStatusLabel,
  isCurrentUserAuthoredAgent,
  parseAgentContentToForm,
  resolveAgentEditId,
  resolveAgentEditPath,
} from "./agent-data";
import { AgentDebugPreview } from "./agent-debug-preview";
import { resolveAgentHubPath } from "./agent-hub-page";
import type { AgentKnowledgeRef } from "./agent-knowledge-refs";
import {
  agentConsoleClient,
  createTenantAgent,
  publishTenantAgent,
  syncListedAgentToLibrary,
  updateTenantAgent,
} from "@/api/agent-console-client";
import { describeApiError } from "@/api/api-error";
import { fetchAssistantLlmOptions, pickDefaultLlmModelCode } from "@/api/assistant-llm-options";
import { cubeKnowledgeDocumentService } from "@/api/service";
import { fetchAssistantSkillReferences } from "@/views/assistant/assistant-skill-references";

import styles from "./agent-management.module.less";

const AGENT_PROMPT_MAX_LENGTH = 20_000;

function knowledgeRefsKey(refs: readonly AgentKnowledgeRef[]): string {
  return refs
    .map((ref) => ref.kbId)
    .sort()
    .join("\u0001");
}

const AGENT_PROMPT_TEXTAREA_PROPS = {
  showCount: false,
  maxlength: AGENT_PROMPT_MAX_LENGTH,
} as const;

function applyProposeContent(
  form: {
    name: string;
    description: string;
    prompt: string;
    skillRefs: string[];
    ruleRefs: string[];
    temperature: number | null;
    maxDepth: number | null;
    model: string;
  },
  content: unknown,
): void {
  if (!content || typeof content !== "object") {
    return;
  }
  const proposed = content as TenantAgentContentInput;
  if (typeof proposed.prompt === "string" && proposed.prompt.trim()) {
    form.prompt = proposed.prompt.trim();
  }
  if (!form.description.trim() && typeof proposed.description === "string" && proposed.description.trim()) {
    form.description = proposed.description.trim();
  }
  if (!form.name.trim() && typeof proposed.displayName === "string" && proposed.displayName.trim()) {
    form.name = proposed.displayName.trim();
  }
  if (Array.isArray(proposed.skillRefs) && proposed.skillRefs.length > 0) {
    form.skillRefs = [...proposed.skillRefs];
  }
  if (Array.isArray(proposed.ruleRefs) && proposed.ruleRefs.length > 0) {
    form.ruleRefs = [...proposed.ruleRefs];
  }
  if (proposed.maxDepth != null && Number.isFinite(proposed.maxDepth)) {
    form.maxDepth = proposed.maxDepth;
  }
  const temperature = proposed.modelConfig?.temperature;
  if (temperature != null && Number.isFinite(temperature)) {
    form.temperature = temperature;
  }
  const model = proposed.modelConfig?.model?.trim();
  if (model && !form.model.trim()) {
    form.model = model;
  }
}

export const AgentCreatePage = defineComponent({
  name: "AgentCreatePage",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const saving = ref(false);
    const publishing = ref(false);
    const proposing = ref(false);
    const agentId = ref<string | null>(null);
    const agentView = ref<TenantDescriptorView | null>(null);
    const lastSavedAt = ref<number | null>(null);

    const form = reactive({
      name: "",
      description: "",
      model: "",
      prompt: "",
      skillRefs: [] as string[],
      ruleRefs: [] as string[],
      temperature: null as number | null,
      maxDepth: null as number | null,
      tags: [] as string[],
      knowledgeRefs: [] as AgentKnowledgeRef[],
      avatarUrl: "",
      avatarFileId: "",
    });
    const avatarFiles = ref<{ id?: string; path?: string }[]>([]);
    const knowledgeOptions = ref<AgentKnowledgeRef[]>([]);
    const knowledgeLoading = ref(false);
    const skillOptions = ref<{ id: string; name: string; description: string }[]>([]);
    const skillLoading = ref(false);

    watch(
      () => [form.avatarUrl, form.avatarFileId] as const,
      ([avatarUrl, avatarFileId]) => {
        const url = avatarUrl.trim();
        if (!url) {
          if (avatarFiles.value.length > 0) {
            avatarFiles.value = [];
          }
          return;
        }
        const current = avatarFiles.value[0];
        if (current?.path === url && String(current?.id ?? "") === avatarFileId) {
          return;
        }
        avatarFiles.value = [{ path: url, ...(avatarFileId ? { id: avatarFileId } : {}) }];
      },
      { immediate: true },
    );

    const syncAvatarFromFiles = (files: { id?: string; path?: string }[] | undefined): void => {
      const file = files?.[0];
      form.avatarUrl = file?.path?.trim() ?? "";
      form.avatarFileId = file?.id != null ? String(file.id) : "";
      avatarFiles.value = files ?? [];
    };

    const isEditMode = computed(() => Boolean(resolveAgentEditId(route)));
    const pageTitle = computed(() => {
      if (isEditMode.value) {
        return form.name.trim() || "编辑智能体";
      }
      return form.name.trim() || "新建智能体";
    });
    const savedHint = computed(() => {
      const time = formatAgentSavedTime(lastSavedAt.value);
      return time ? `已自动保存 ${time}` : "";
    });
    const statusHint = computed(() => {
      if (!agentView.value) {
        return "";
      }
      return formatDescriptorStatusLabel(agentView.value);
    });

    const loadModels = async (): Promise<void> => {
      try {
        const options = await fetchAssistantLlmOptions("agent-create-page");
        if (!form.model.trim()) {
          form.model = pickDefaultLlmModelCode(options);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[agent-create-page] 加载模型列表失败", error);
      }
    };

    const loadKnowledgeOptions = async (): Promise<void> => {
      knowledgeLoading.value = true;
      try {
        const page = await cubeKnowledgeDocumentService.getKnowledgeDocumentList({
          pageNumber: 1,
          pageSize: 100,
          status: true,
        });
        const records = Array.isArray(page.records) ? page.records : [];
        knowledgeOptions.value = records.map((doc) => ({
          kbId: doc.id,
          displayName: doc.name?.trim() || doc.id,
        }));
        ensureKnowledgeOptionOrphans();
      } catch (error) {
        knowledgeOptions.value = [];
        // eslint-disable-next-line no-console
        console.warn("[agent-create-page] 加载知识库列表失败", error);
      } finally {
        knowledgeLoading.value = false;
      }
    };

    const loadSkillOptions = async (): Promise<void> => {
      skillLoading.value = true;
      try {
        // 与聊天技能芯片同源：一次 mySkills（+必要 browse），不含平台默认技能
        const refs = await fetchAssistantSkillReferences();
        skillOptions.value = refs.map((ref) => ({
          id: ref.id,
          name: ref.label,
          description: ref.description,
        }));
        ensureSkillOptionOrphans();
      } catch (error) {
        skillOptions.value = [];
        // eslint-disable-next-line no-console
        console.warn("[agent-create-page] 加载技能列表失败", error);
      } finally {
        skillLoading.value = false;
      }
    };

    const knowledgeSelectValue = computed(() => form.knowledgeRefs.map((ref) => ref.kbId));

    /** 仅依赖 skillOptions，避免每次勾选重建 options 导致多选卡死 */
    const skillSelectOptions = computed(() =>
      skillOptions.value.map((option) => ({
        label: option.name,
        value: option.id,
      })),
    );

    /** 编辑回填的技能若不在「我的技能」中，补一条可选 option（不随勾选反复重建） */
    const ensureSkillOptionOrphans = (): void => {
      const known = new Set(skillOptions.value.map((item) => item.id));
      const missing = form.skillRefs.filter((id) => {
        const skillId = id.trim();
        return Boolean(skillId) && !known.has(skillId);
      });
      if (missing.length === 0) {
        return;
      }
      skillOptions.value = [
        ...skillOptions.value,
        ...missing.map((id) => ({
          id,
          name: id,
          description: "已绑定（当前不在我的技能中）",
        })),
      ];
    };

    /** 仅依赖 knowledgeOptions，避免多选时反复重建 options */
    const knowledgeSelectOptions = computed(() =>
      knowledgeOptions.value.map((option) => ({
        label: option.displayName,
        value: option.kbId,
      })),
    );

    const ensureKnowledgeOptionOrphans = (): void => {
      const known = new Set(knowledgeOptions.value.map((item) => item.kbId));
      const missing = form.knowledgeRefs.filter((ref) => ref.kbId.trim() && !known.has(ref.kbId));
      if (missing.length === 0) {
        return;
      }
      knowledgeOptions.value = [
        ...knowledgeOptions.value,
        ...missing.map((ref) => ({
          kbId: ref.kbId,
          displayName: ref.displayName || ref.kbId,
        })),
      ];
    };

    const skillRefsKey = (refs: readonly string[]): string =>
      refs
        .map((id) => id.trim())
        .filter(Boolean)
        .sort()
        .join("\u0001");

    const onSkillSelectChange = (value: unknown): void => {
      const selectedIds = Array.isArray(value) ? value.map((item) => String(item ?? "").trim()).filter(Boolean) : [];
      if (skillRefsKey(selectedIds) === skillRefsKey(form.skillRefs)) {
        return;
      }
      form.skillRefs = selectedIds;
    };

    const onKnowledgeSelectChange = (value: unknown): void => {
      const selectedIds = Array.isArray(value) ? value.map((item) => String(item ?? "").trim()).filter(Boolean) : [];
      const nextKey = [...selectedIds].sort().join("\u0001");
      if (nextKey === knowledgeRefsKey(form.knowledgeRefs)) {
        return;
      }
      const optionById = new Map(knowledgeOptions.value.map((option) => [option.kbId, option]));
      const previousById = new Map(form.knowledgeRefs.map((ref) => [ref.kbId, ref]));
      form.knowledgeRefs = selectedIds.map((kbId) => {
        const fromOptions = optionById.get(kbId);
        if (fromOptions) {
          return { kbId, displayName: fromOptions.displayName };
        }
        const previous = previousById.get(kbId);
        return { kbId, displayName: previous?.displayName || kbId };
      });
    };

    const ensureAgentId = async (): Promise<string | null> => saveDraft(false);

    const getKnowledgeRefs = (): AgentKnowledgeRef[] => form.knowledgeRefs;

    const syncAgentView = (view: TenantDescriptorView): void => {
      agentId.value = view.id;
      agentView.value = view;
      lastSavedAt.value = view.updateTime;
      Object.assign(form, parseAgentContentToForm(view));
      ensureSkillOptionOrphans();
      ensureKnowledgeOptionOrphans();
    };

    const loadAgent = async (id: string): Promise<void> => {
      loading.value = true;
      try {
        const canEdit = await isCurrentUserAuthoredAgent(id);
        if (!canEdit) {
          message.error("无权编辑该智能体，仅可编辑本人创作的智能体");
          void router.push(resolveAgentHubPath());
          return;
        }
        const view = await agentConsoleClient.getAgent(id);
        syncAgentView(view);
      } catch (error) {
        message.error(`加载智能体失败：${describeApiError(error)}`);
        void router.push(resolveAgentHubPath());
      } finally {
        loading.value = false;
      }
    };

    const loadAgentIfNeeded = (): void => {
      const id = resolveAgentEditId(route);
      if (id) {
        void loadAgent(id);
      }
    };

    const validateForm = (): boolean => {
      if (!form.name.trim()) {
        message.warning("请填写智能体名称");
        return false;
      }
      if (!form.prompt.trim()) {
        message.warning("请填写提示词");
        return false;
      }
      if (form.prompt.length > AGENT_PROMPT_MAX_LENGTH) {
        message.warning(`提示词不能超过 ${AGENT_PROMPT_MAX_LENGTH.toLocaleString("zh-CN")} 字`);
        return false;
      }
      return true;
    };

    const upsertAgent = async (): Promise<string | null> => {
      if (!validateForm()) {
        return null;
      }
      const content = buildAgentContentFromForm(form);
      if (agentId.value) {
        const canEdit = await isCurrentUserAuthoredAgent(agentId.value);
        if (!canEdit) {
          message.error("无权保存该智能体");
          return null;
        }
        const view = await updateTenantAgent(agentId.value, content);
        syncAgentView(view);
        return view.id;
      }
      const view = await createTenantAgent(deriveDescriptorName(form.name.trim()), content);
      syncAgentView(view);
      return view.id;
    };

    const saveDraft = async (showSuccess = false): Promise<string | null> => {
      saving.value = true;
      try {
        const hadAgentId = Boolean(agentId.value);
        const id = await upsertAgent();
        if (!id) {
          return null;
        }
        if (!hadAgentId) {
          void router.replace(resolveAgentEditPath(id));
        }
        if (showSuccess) {
          message.success("草稿已保存");
        }
        return id;
      } catch (error) {
        message.error(`保存失败：${describeApiError(error)}`);
        return null;
      } finally {
        saving.value = false;
      }
    };

    const publishForSelfUse = async (): Promise<void> => {
      publishing.value = true;
      try {
        const id = await upsertAgent();
        if (!id) {
          return;
        }
        const view = await publishTenantAgent(id);
        const syncedToLibrary = await syncListedAgentToLibrary(id, view);
        message.success(syncedToLibrary ? "发布成功，智能体库已同步更新" : "发布成功，可在对话与助手中使用该智能体");
        void router.push(resolveAgentHubPath());
      } catch (error) {
        message.error(`发布失败：${describeApiError(error)}`);
      } finally {
        publishing.value = false;
      }
    };

    const proposePrompt = async (): Promise<void> => {
      if (!form.name.trim() && !form.description.trim()) {
        message.warning("请先填写智能体名称或简介，以便 AI 生成提示词");
        return;
      }
      if (!form.model.trim()) {
        await loadModels();
      }
      if (!form.model.trim()) {
        message.warning("未获取到可用模型，无法 AI 生成提示词");
        return;
      }
      proposing.value = true;
      const previousPrompt = form.prompt;
      form.prompt = "";
      try {
        const intent =
          form.description.trim() || `创建一个名为「${form.name.trim()}」的智能体，${form.name.trim()} 应能专业、清晰地回答用户问题。`;
        const base = previousPrompt.trim() ? buildAgentContentFromForm({ ...form, prompt: previousPrompt }) : undefined;
        const result = await agentConsoleClient.propose(
          "agent",
          {
            intent,
            ...(base ? { base } : {}),
            ...(form.model.trim() ? { modelCode: form.model.trim() } : {}),
          },
          {
            onDelta: (delta: string) => {
              form.prompt += delta;
            },
          },
        );
        if (result.valid) {
          applyProposeContent(form, result.content);
          message.success("提示词已生成，请确认后保存");
          return;
        }
        form.prompt = previousPrompt;
        const issues = result.issues?.join("；") ?? "生成结果无效";
        message.warning(`AI 生成未完成：${issues}`);
      } catch (error) {
        form.prompt = previousPrompt;
        message.error(`AI 生成失败：${describeApiError(error)}`);
      } finally {
        proposing.value = false;
      }
    };

    onMounted(() => {
      void loadModels();
      void loadKnowledgeOptions();
      void loadSkillOptions();
      loadAgentIfNeeded();
    });

    watch(
      () => resolveAgentEditId(route),
      (id, previousId) => {
        // 首次保存后 router.replace 会触发 watch；此时 syncAgentView 已写入 agentId，勿再 getAgent
        if (id && id !== previousId && id !== agentId.value) {
          void loadAgent(id);
        }
      },
    );

    return () => (
      <div class={styles.createPageWrap}>
        <Spin spinning={loading.value}>
          <div class={styles.createPage}>
            <header class={styles.createHeader}>
              <div class={styles.createTitleWrap}>
                <button
                  type="button"
                  class={styles.backButton}
                  onClick={() => {
                    void router.push(resolveAgentHubPath());
                  }}
                >
                  <ArrowLeftOutlined />
                </button>
                <h2>{pageTitle.value}</h2>
                {statusHint.value ? <span class={styles.createStatusHint}>{statusHint.value}</span> : null}
                {savedHint.value ? <span>{savedHint.value}</span> : null}
              </div>
              <div class={styles.createHeaderActions}>
                <Button loading={saving.value} disabled={publishing.value} onClick={() => void saveDraft(true)}>
                  保存草稿
                </Button>
                <Button
                  type="primary"
                  class={styles.publishButton}
                  loading={publishing.value}
                  disabled={saving.value}
                  onClick={() => void publishForSelfUse()}
                >
                  发布
                </Button>
              </div>
            </header>
            <main class={styles.createMain}>
              <section class={styles.configPane}>
                <h3 class={styles.sectionHeading}>{isEditMode.value ? "编辑智能体" : "基础信息"}</h3>
                <div class={styles.avatarBox}>
                  <FileUpload
                    sceneCode="AI_APPLICATION_CENTE::FILE"
                    value={avatarFiles.value}
                    onUpdate:value={(files: { id?: string; path?: string }[]) => {
                      syncAvatarFromFiles(files);
                    }}
                    maxCount={1}
                    type="picture-card"
                    size={72}
                    showText={false}
                    customText="上传头像|支持 png/jpg/jpeg/webp/svg"
                    typeList={[".png", ".jpg", ".jpeg", ".svg", ".webp"]}
                  />
                </div>
                <label class={styles.fieldBlock}>
                  <span class={styles.required}>智能体名称</span>
                  <Input
                    value={form.name}
                    maxlength={32}
                    showCount
                    placeholder="请输入智能体名称"
                    onUpdate:value={(value: string) => {
                      form.name = value ?? "";
                    }}
                  />
                </label>
                <label class={styles.fieldBlock}>
                  <span>智能体简介</span>
                  <Textarea
                    value={form.description}
                    maxlength={200}
                    showCount
                    rows={3}
                    placeholder="请输入智能体简介"
                    onUpdate:value={(value: string) => {
                      form.description = value ?? "";
                    }}
                  />
                </label>
                <div class={styles.fieldBlock}>
                  <span>绑定知识库</span>
                  <small>使用该智能体聊天时将默认携带所选知识库（用户无需在对话中手动引用）</small>
                  <Select
                    class={styles.fullWidthSelect}
                    mode="multiple"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    maxTagCount={3}
                    virtual
                    listHeight={320}
                    loading={knowledgeLoading.value}
                    value={knowledgeSelectValue.value}
                    options={knowledgeSelectOptions.value}
                    placeholder={
                      knowledgeLoading.value
                        ? "知识库加载中…"
                        : knowledgeOptions.value.length === 0
                          ? "暂无可用知识库"
                          : "请选择知识库（可多选）"
                    }
                    disabled={!knowledgeLoading.value && knowledgeOptions.value.length === 0}
                    onUpdate:value={onKnowledgeSelectChange}
                  />
                </div>
                <div class={styles.fieldBlock}>
                  <span>绑定技能</span>
                  <small>对话时默认勾选；用户可在聊天技能条取消。平台默认推理/出图能力无需绑定。</small>
                  <Select
                    class={styles.fullWidthSelect}
                    mode="multiple"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    maxTagCount={3}
                    // 技能多时关闭整表重绘：virtual + 稳定 options，避免勾选卡死
                    virtual
                    listHeight={320}
                    loading={skillLoading.value}
                    value={form.skillRefs}
                    options={skillSelectOptions.value}
                    placeholder={
                      skillLoading.value
                        ? "技能加载中…"
                        : skillOptions.value.length === 0
                          ? "暂无可用技能，请先在「我的技能」中添加"
                          : "请选择技能（可多选）"
                    }
                    onUpdate:value={onSkillSelectChange}
                  />
                </div>
                <label class={styles.fieldBlock}>
                  <div class={styles.promptFieldHeader}>
                    <span class={styles.required}>提示词编辑</span>
                    <div class={styles.proposeActions}>
                      <PopConfirm
                        title="生成过程可能需等待数十秒，确定继续吗？"
                        okText="继续生成"
                        cancelText="取消"
                        disabled={proposing.value}
                        onConfirm={() => void proposePrompt()}
                      >
                        <button type="button" class={styles.proposeLink} disabled={proposing.value}>
                          {proposing.value ? "生成中…" : "AI 辅助生成"}
                        </button>
                      </PopConfirm>
                    </div>
                  </div>
                  <small>
                    指令会影响智能体的回答；「发布」会先保存当前内容，成功后返回我的智能体列表；建议保持精炼，最多{" "}
                    {AGENT_PROMPT_MAX_LENGTH.toLocaleString("zh-CN")} 字
                  </small>
                  <Textarea
                    class={styles.promptTextarea}
                    value={form.prompt}
                    rows={12}
                    placeholder="请输入智能体提示词"
                    disabled={proposing.value}
                    {...AGENT_PROMPT_TEXTAREA_PROPS}
                    onUpdate:value={(value: string) => {
                      form.prompt = value ?? "";
                    }}
                  />
                </label>
              </section>
              <section class={styles.previewPane}>
                <h3 class={styles.sectionHeading}>调试预览</h3>
                {!loading.value ? (
                  <div v-memo={[agentId.value, form.model]}>
                    <AgentDebugPreview
                      agentId={agentId.value}
                      modelCode={form.model}
                      getKnowledgeRefs={getKnowledgeRefs}
                      onUpdate:modelCode={(code: string) => {
                        form.model = code;
                      }}
                      ensureAgentId={ensureAgentId}
                    />
                  </div>
                ) : (
                  <div class={styles.previewHint}>智能体加载中…</div>
                )}
              </section>
            </main>
          </div>
        </Spin>
      </div>
    );
  },
});

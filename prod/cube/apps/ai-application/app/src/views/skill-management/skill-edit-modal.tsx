import type { LlmOption } from "@cube-ai/agent-sdk-client-assistant";
import { defineComponent, nextTick, ref, watch, type PropType } from "vue";

import { Button, Checkbox, Input, Modal, Select, Textarea, message } from "@ghcloud/cube-ui";
import { RobotOutlined, SendOutlined, UserOutlined } from "@ghcloud/cube-ui";

import {
  formatActivationGlobsText,
  parseActivationGlobsText,
  SKILL_ACTIVATION_OPTIONS,
  type SkillActivationMode,
} from "./skill-activation";
import { SkillConfigChatInput } from "./skill-config-chat-input";
import type { SkillFormState } from "./skill-data";
import {
  CATEGORY_OPTIONS,
  SIX_CONFIG_DESCRIPTIONS,
  SIX_CONFIG_LABELS,
  applySkillProposeContent,
  buildFocusedConfigProposeFocus,
  buildSkillContentFromForm,
  buildSkillContentFromGenerated,
  formStateToGeneratedConfig,
  generatedConfigToFormState,
  getSkillEditWelcomeMessage,
  hasProposeUpdatesForKeys,
  isConfirmSaveMessage,
  resolveConfigKeyFromLabel,
  validateSixConfig,
  withSkillProposeLanguageHint,
  SKILL_LONG_TEXTAREA_PROPS,
  SKILL_META_TEXTAREA_AUTO_SIZE,
  type SixConfigKey,
  type SkillCategoryCode,
  type SkillGeneratedConfig,
} from "./skill-data";
import { hasSkillReferenceContent, parseSkillReference } from "./skill-reference";
import { SkillReferenceEditor } from "./skill-reference-editor";
import { listTenantSkill, publishTenantSkill, agentConsoleClient, updateTenantSkill } from "@/api/agent-console-client";
import { describeApiError } from "@/api/api-error";
import { fetchAssistantLlmOptions, pickDefaultLlmModelCode } from "@/api/assistant-llm-options";

import styles from "./skill-management.module.less";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

const CONFIG_ITEMS: {
  key: SixConfigKey;
  label: string;
  required: boolean;
}[] = [
  { key: "usageExample", label: SIX_CONFIG_LABELS.usageExample, required: true },
  { key: "outputSpec", label: SIX_CONFIG_LABELS.outputSpec, required: true },
  { key: "inputReq", label: SIX_CONFIG_LABELS.inputReq, required: true },
  { key: "pitfallGuide", label: SIX_CONFIG_LABELS.pitfallGuide, required: true },
  { key: "checklist", label: SIX_CONFIG_LABELS.checklist, required: true },
  { key: "reference", label: SIX_CONFIG_LABELS.reference, required: false },
];

export const SkillEditModal = defineComponent({
  name: "SkillEditModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    initialData: {
      type: Object as PropType<SkillFormState>,
      default: null,
    },
  },
  emits: ["update:visible", "success"],
  setup(props, { emit }) {
    const chatInput = ref("");
    const messages = ref<ChatMessage[]>([]);
    const publishToLibrary = ref(false);
    const saving = ref(false);
    const generating = ref(false);
    const generatedConfig = ref<SkillGeneratedConfig | null>(null);
    const selectedConfig = ref<SixConfigKey | null>(null);
    const streamingPreview = ref("");
    const modelCode = ref("");
    const llmOptions = ref<LlmOption[]>([]);
    const skillId = ref<string | undefined>(undefined);
    const configBlockRefs = ref<Partial<Record<SixConfigKey, HTMLDivElement>>>({});

    const chatAreaRef = ref<HTMLDivElement | null>(null);

    const loadModels = async (): Promise<void> => {
      try {
        const options = await fetchAssistantLlmOptions("skill-edit-modal");
        llmOptions.value = options;
        if (!modelCode.value.trim()) {
          modelCode.value = pickDefaultLlmModelCode(options);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[skill-edit-modal] 加载模型列表失败", error);
      }
    };

    const ensureModelCode = async (): Promise<string | null> => {
      if (!modelCode.value.trim()) {
        await loadModels();
      }
      const code = modelCode.value.trim();
      if (!code) {
        message.warning("未获取到可用对话模型，请先在模型管理中配置并启用模型");
        messages.value.push({
          role: "ai",
          content:
            "当前租户没有可用的对话模型，无法调用 AI 修改。请先在「模型管理」中配置并启用模型，或在上方选择<strong>创作模型</strong>后重试；你也可以直接在左侧手动编辑后保存。",
        });
        scrollToBottom();
        return null;
      }
      return code;
    };

    const resetDialog = (data: SkillFormState): void => {
      chatInput.value = "";
      skillId.value = data.id;
      publishToLibrary.value = data.published;
      generatedConfig.value = formStateToGeneratedConfig(data);
      selectedConfig.value = "usageExample";
      streamingPreview.value = "";
      generating.value = false;
      modelCode.value = pickDefaultLlmModelCode(llmOptions.value);
      messages.value = [{ role: "ai", content: getSkillEditWelcomeMessage(data.name) }];
    };

    watch(
      () => [props.visible, props.initialData] as const,
      ([visible, data]) => {
        if (visible && data) {
          resetDialog(data);
          void loadModels();
        }
      },
      { immediate: true },
    );

    watch(selectedConfig, (key) => {
      if (!key) {
        return;
      }
      nextTick(() => {
        configBlockRefs.value[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const scrollToBottom = (): void => {
      nextTick(() => {
        if (chatAreaRef.value) {
          chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
        }
      });
    };

    const setConfigBlockRef = (key: SixConfigKey, el: HTMLDivElement | null): void => {
      if (el) {
        configBlockRefs.value[key] = el;
      }
    };

    const updateConfigField = (key: SixConfigKey, value: string): void => {
      if (!generatedConfig.value) {
        return;
      }
      generatedConfig.value = {
        ...generatedConfig.value,
        [key]: value,
      };
    };

    const updateMetaField = <K extends "name" | "description" | "intro" | "category" | "activationMode" | "activationGlobs">(
      key: K,
      value: SkillGeneratedConfig[K],
    ): void => {
      if (!generatedConfig.value) {
        return;
      }
      generatedConfig.value = {
        ...generatedConfig.value,
        [key]: value,
      };
    };

    const getConfigStatusLabel = (key: SixConfigKey, required: boolean): string | null => {
      if (!generatedConfig.value?.finished) {
        return null;
      }
      if (key === "reference") {
        const reference = parseSkillReference(generatedConfig.value.reference);
        if (hasSkillReferenceContent(reference)) {
          return "已填写";
        }
        return null;
      }
      const value = generatedConfig.value[key]?.trim();
      if (value) {
        return "已填写";
      }
      return required ? "待完善" : null;
    };

    const handleClose = (): void => {
      emit("update:visible", false);
    };

    const handleSave = async (): Promise<void> => {
      if (!generatedConfig.value) {
        return;
      }

      const form = generatedConfigToFormState(generatedConfig.value, {
        ...(skillId.value !== undefined ? { id: skillId.value } : {}),
        published: publishToLibrary.value,
      });

      if (!form.name.trim()) {
        message.error("技能名称不能为空");
        return;
      }
      if (!form.description.trim()) {
        message.error("技能描述不能为空");
        return;
      }
      if (!form.category) {
        message.error("请选择技能分类");
        return;
      }
      if (form.activationMode === "path" && form.activationGlobs.length === 0) {
        message.error("路径匹配激活方式必须填写至少一个路径规则");
        return;
      }

      const sixConfigCheck = validateSixConfig(form);
      if (!sixConfigCheck.valid && form.published) {
        message.error(`发布前必须填写以下必填配置：${sixConfigCheck.missing.map((f) => f.label).join("、")}`);
        selectedConfig.value = sixConfigCheck.missing[0]?.key ?? null;
        return;
      }

      if (!form.id?.startsWith("skl_")) {
        message.error("缺少技能 ID");
        return;
      }

      saving.value = true;
      try {
        const content = buildSkillContentFromForm(form);
        await updateTenantSkill(form.id, content);
        if (form.published) {
          const published = await publishTenantSkill(form.id);
          const versionNo = published.publishedVersionNo ?? published.headVersionNo;
          if (versionNo > 0) {
            await listTenantSkill(form.id, versionNo);
          }
        }
        message.success(`技能更新成功${form.published ? "并已发布到技能库" : ""}`);
        emit("success");
      } catch (error) {
        message.error(`保存失败：${describeApiError(error)}`);
      } finally {
        saving.value = false;
      }
    };

    const runPropose = async (focus: string, options?: { onlyKeys?: readonly SixConfigKey[] }): Promise<boolean> => {
      if (!generatedConfig.value) {
        return false;
      }

      generating.value = true;
      streamingPreview.value = "";
      const focusedLabel = options?.onlyKeys?.length === 1 ? SIX_CONFIG_LABELS[options.onlyKeys[0]] : null;
      const resolvedModelCode = await ensureModelCode();
      if (!resolvedModelCode) {
        generating.value = false;
        return false;
      }

      try {
        const result = await agentConsoleClient.propose(
          "skill",
          {
            base: buildSkillContentFromGenerated({
              ...generatedConfig.value,
              category: generatedConfig.value.category ?? "WORK_EXECUTION",
            }),
            focus: withSkillProposeLanguageHint(focus),
            modelCode: resolvedModelCode,
          },
          {
            onDelta: (delta: string) => {
              if (focusedLabel) {
                streamingPreview.value = `正在更新【${focusedLabel}】…`;
              } else {
                streamingPreview.value += delta;
              }
            },
          },
        );

        if (!result.valid) {
          message.warning(result.issues?.join("；") || "AI 修改未完成");
          messages.value.push({
            role: "ai",
            content: "AI 修改未完全通过校验，请调整描述后重试，或在左侧手动编辑。",
          });
          return false;
        }

        const content = result.content as {
          displayName?: string;
          description?: string;
          instructions?: string;
        };

        if (options?.onlyKeys?.length && !hasProposeUpdatesForKeys(content.instructions ?? "", options.onlyKeys)) {
          const labels = options.onlyKeys.map((key) => SIX_CONFIG_LABELS[key]).join("、");
          message.warning(`未能识别 AI 返回的【${labels}】更新内容`);
          messages.value.push({
            role: "ai",
            content: `AI 已回复，但未能识别【${labels}】的有效更新（可能整篇重写了非标准格式）。请更具体地描述修改意见，或直接在左侧对应配置框中编辑。`,
          });
          return false;
        }

        generatedConfig.value = applySkillProposeContent(generatedConfig.value, content, options);
        return true;
      } catch (error) {
        const errorText = describeApiError(error);
        message.error(`AI 修改失败：${errorText}`);
        const isModelError = /catalog entry|no catalog|model=/i.test(errorText);
        messages.value.push({
          role: "ai",
          content: isModelError
            ? "创作模型不可用，请检查「模型管理」或在上方切换<strong>创作模型</strong>后重试。"
            : "AI 服务暂不可用，请稍后重试或在左侧手动编辑。",
        });
        return false;
      } finally {
        generating.value = false;
        streamingPreview.value = "";
        scrollToBottom();
      }
    };

    const handleConfigDirective = async (text: string): Promise<void> => {
      const directiveBody = text.slice(1).trim();
      const configName = directiveBody.split(/\s+/)[0] ?? "";
      const configKey = resolveConfigKeyFromLabel(configName);

      if (!configKey) {
        messages.value.push({
          role: "ai",
          content: "未找到配置项，可用：使用示例、输出规范、输入要求、避坑指南、自检清单、参考资源",
        });
        scrollToBottom();
        return;
      }

      const configItem = CONFIG_ITEMS.find((item) => item.key === configKey);
      if (!configItem) {
        return;
      }

      const ok = await runPropose(buildFocusedConfigProposeFocus(configKey, text), {
        onlyKeys: [configKey],
      });
      if (ok) {
        selectedConfig.value = configKey;
        messages.value.push({
          role: "ai",
          content: `已根据你的意见更新【${configItem.label}】，请在左侧查看并可直接修改。`,
        });
        scrollToBottom();
      }
    };

    const handleGeneralEdit = async (text: string): Promise<void> => {
      const ok = await runPropose(text);
      if (ok) {
        messages.value.push({
          role: "ai",
          content: "已根据你的描述更新技能配置。请在左侧查看各项内容，如需继续调整可继续对话，或回复「确认保存」。",
        });
        scrollToBottom();
      }
    };

    const handleSend = (): void => {
      const text = chatInput.value.trim();
      if (!text || generating.value || saving.value) {
        return;
      }

      messages.value.push({ role: "user", content: text });
      chatInput.value = "";
      scrollToBottom();

      if (isConfirmSaveMessage(text)) {
        void handleSave();
        return;
      }

      if (text.startsWith("@")) {
        void handleConfigDirective(text);
        return;
      }

      void handleGeneralEdit(text);
    };

    return () => {
      const config = generatedConfig.value;
      const activeKey = selectedConfig.value;

      if (!config) {
        return (
          <Modal
            title="编辑技能"
            visible={props.visible}
            onCancel={handleClose}
            width={1320}
            footer={null}
            centered
            class={styles.editSkillModal}
            bodyStyle={{ padding: 0, overflow: "hidden" }}
          />
        );
      }

      return (
        <Modal
          title="编辑技能"
          visible={props.visible}
          onCancel={handleClose}
          width={1320}
          footer={null}
          centered
          class={styles.editSkillModal}
          bodyStyle={{ padding: 0, overflow: "hidden" }}
        >
          <div class={styles.editDialog}>
            <div class={styles.editDialogBody}>
              <div class={styles.editDialogLeftScroll}>
                <div class={styles.editDialogMeta}>
                  <div class={styles.editDialogMetaGrid}>
                    <div class={styles.editDialogMetaItem}>
                      <label class={styles.editDialogMetaLabel}>
                        技能名称<span class={styles.requiredMark}>*</span>
                      </label>
                      <Input
                        value={config.name}
                        placeholder="请输入技能名称"
                        maxLength={50}
                        onUpdate:value={(value: string) => {
                          updateMetaField("name", value ?? "");
                        }}
                      />
                    </div>
                    <div class={styles.editDialogMetaItem}>
                      <label class={styles.editDialogMetaLabel}>
                        分类<span class={styles.requiredMark}>*</span>
                      </label>
                      <Select
                        value={config.category}
                        placeholder="请选择分类"
                        options={CATEGORY_OPTIONS.map((opt) => ({
                          label: opt.label,
                          value: opt.value,
                        }))}
                        onChange={(value: SkillCategoryCode) => {
                          updateMetaField("category", value);
                        }}
                      />
                    </div>
                    <div class={styles.editDialogMetaItem}>
                      <label class={styles.editDialogMetaLabel}>激活方式</label>
                      <Select
                        value={config.activationMode}
                        placeholder="请选择激活方式"
                        options={SKILL_ACTIVATION_OPTIONS.map((opt) => ({
                          label: opt.label,
                          value: opt.value,
                        }))}
                        onChange={(value: SkillActivationMode) => {
                          updateMetaField("activationMode", value);
                        }}
                      />
                    </div>
                    {config.activationMode === "path" ? (
                      <div class={[styles.editDialogMetaItem, styles.editDialogMetaWide]}>
                        <label class={styles.editDialogMetaLabel}>
                          路径规则<span class={styles.requiredMark}>*</span>
                        </label>
                        <Textarea
                          class={styles.editDialogMetaTextarea}
                          value={formatActivationGlobsText(config.activationGlobs)}
                          placeholder={"每行一个 glob，例如：\nsrc/**/*.ts\ndocs/**/*.md"}
                          autoSize={SKILL_META_TEXTAREA_AUTO_SIZE}
                          onUpdate:value={(value: string) => {
                            updateMetaField("activationGlobs", parseActivationGlobsText(value ?? ""));
                          }}
                        />
                      </div>
                    ) : null}
                    <div class={[styles.editDialogMetaItem, styles.editDialogMetaWide]}>
                      <label class={styles.editDialogMetaLabel}>
                        技能描述<span class={styles.requiredMark}>*</span>
                      </label>
                      <Textarea
                        class={styles.editDialogMetaTextarea}
                        value={config.description}
                        placeholder="请输入技能描述，说明用途与业务价值"
                        autoSize={SKILL_META_TEXTAREA_AUTO_SIZE}
                        {...SKILL_LONG_TEXTAREA_PROPS}
                        onUpdate:value={(value: string) => {
                          updateMetaField("description", value ?? "");
                        }}
                      />
                    </div>
                    <div class={[styles.editDialogMetaItem, styles.editDialogMetaWide]}>
                      <label class={styles.editDialogMetaLabel}>技能详情</label>
                      <Textarea
                        class={styles.editDialogMetaTextarea}
                        value={config.intro ?? ""}
                        placeholder="请输入技能详情，支持查看原始描述信息"
                        autoSize={SKILL_META_TEXTAREA_AUTO_SIZE}
                        {...SKILL_LONG_TEXTAREA_PROPS}
                        onUpdate:value={(value: string) => {
                          updateMetaField("intro", value ?? "");
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div class={styles.editDialogConfigSection}>
                  <h4 class={styles.editDialogConfigTitle}>六项配置</h4>
                  {CONFIG_ITEMS.map((item) => {
                    const statusLabel = getConfigStatusLabel(item.key, item.required);
                    const isActive = activeKey === item.key;
                    return (
                      <div
                        key={item.key}
                        ref={(el) => setConfigBlockRef(item.key, el as HTMLDivElement | null)}
                        class={[styles.editConfigBlock, isActive ? styles.editConfigBlockActive : undefined]}
                        onClick={() => {
                          selectedConfig.value = item.key;
                        }}
                      >
                        <div class={styles.editConfigBlockHeader}>
                          <div>
                            <div class={styles.editConfigBlockTitle}>
                              {item.label}
                              {item.required && <span class={styles.requiredMark}>*</span>}
                              {!item.required && <span class={styles.optionalMark}>（可选）</span>}
                            </div>
                            <div class={styles.editConfigBlockDesc}>{SIX_CONFIG_DESCRIPTIONS[item.key]}</div>
                          </div>
                          {statusLabel ? (
                            <span
                              class={[
                                styles.configStatusBadge,
                                statusLabel === "已填写" ? styles.configStatusDone : styles.configStatusWarn,
                              ]}
                            >
                              {statusLabel}
                            </span>
                          ) : null}
                        </div>
                        {item.key === "reference" ? (
                          <div class={styles.editConfigEditor} onClick={(event: MouseEvent) => event.stopPropagation()}>
                            <SkillReferenceEditor
                              value={config.reference ?? ""}
                              noteRows={2}
                              onUpdate:value={(value: string) => {
                                updateConfigField("reference", value ?? "");
                              }}
                            />
                          </div>
                        ) : (
                          <Textarea
                            class={styles.editConfigTextarea}
                            value={config[item.key] ?? ""}
                            rows={5}
                            placeholder={`请输入${item.label}…`}
                            {...SKILL_LONG_TEXTAREA_PROPS}
                            onClick={(event: MouseEvent) => event.stopPropagation()}
                            onUpdate:value={(value: string) => {
                              updateConfigField(item.key, value ?? "");
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div class={styles.editDialogChatColumn}>
                <div class={styles.createDialogHeader}>
                  <span class={styles.createDialogHeaderLabel}>创作模型</span>
                  <Select
                    value={modelCode.value || undefined}
                    placeholder="选择模型"
                    style={{ width: "160px" }}
                    options={llmOptions.value.map((opt) => ({
                      label: opt.displayName,
                      value: opt.modelCode,
                    }))}
                    onChange={(value: string) => {
                      modelCode.value = value ?? "";
                    }}
                  />
                  <span class={styles.createDialogHeaderHint}>@配置项 定向修改</span>
                </div>

                <div ref={chatAreaRef} class={styles.createDialogChat}>
                  {messages.value.map((msg, index) => (
                    <div key={index} class={[styles.chatMessage, msg.role === "user" ? styles.chatMessageUser : undefined]}>
                      <div class={[styles.chatAvatar, msg.role === "ai" ? styles.chatAvatarAi : styles.chatAvatarUser]}>
                        {msg.role === "ai" ? <RobotOutlined /> : <UserOutlined />}
                      </div>
                      <div
                        class={[styles.chatBubble, msg.role === "ai" ? styles.chatBubbleAi : styles.chatBubbleUser]}
                        v-html={msg.content}
                      />
                    </div>
                  ))}
                  {generating.value && (
                    <div class={styles.chatMessage}>
                      <div class={[styles.chatAvatar, styles.chatAvatarAi]}>
                        <RobotOutlined />
                      </div>
                      <div class={[styles.chatBubble, styles.chatBubbleAi]}>
                        {streamingPreview.value ? (
                          <span style="white-space: pre-wrap;">
                            {streamingPreview.value.slice(0, 200)}
                            {streamingPreview.value.length > 200 ? "…" : ""}
                          </span>
                        ) : (
                          <span style="color: #9ca3af;">AI 正在修改配置…</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div class={styles.editDialogChatInput}>
                  <div class={styles.createDialogInputRow}>
                    <SkillConfigChatInput
                      class={styles.createChatTextarea}
                      value={chatInput.value}
                      placeholder="描述修改需求；输入 @ 选择配置项定向修改，或回复「确认保存」"
                      disabled={generating.value || saving.value}
                      onUpdate:value={(value: string) => {
                        chatInput.value = value ?? "";
                      }}
                      onSend={handleSend}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      loading={generating.value}
                      disabled={saving.value}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class={[styles.editDialogFooter, styles.editDialogFooterSplit]}>
              <Checkbox
                checked={publishToLibrary.value}
                onUpdate:checked={(checked: boolean) => {
                  publishToLibrary.value = checked;
                }}
                disabled={saving.value || generating.value}
              >
                <span class={styles.createDialogFooterHint}>发布到技能库</span>
              </Checkbox>
              <div class={styles.createDialogFooterActions}>
                <Button onClick={handleClose} disabled={saving.value}>
                  取消
                </Button>
                <Button type="primary" loading={saving.value} disabled={generating.value} onClick={() => void handleSave()}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      );
    };
  },
});

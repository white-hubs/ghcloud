import type { LlmOption } from "@cube-ai/agent-sdk-client-assistant";
import { computed, defineComponent, nextTick, ref, watch } from "vue";

import { Button, Checkbox, Input, Modal, Select, Textarea, message } from "@ghcloud/cube-ui";
import { RobotOutlined, SendOutlined, UserOutlined } from "@ghcloud/cube-ui";

import {
  formatActivationGlobsText,
  parseActivationGlobsText,
  SKILL_ACTIVATION_OPTIONS,
  type SkillActivationMode,
} from "./skill-activation";
import { SkillConfigChatInput } from "./skill-config-chat-input";
import {
  CATEGORY_OPTIONS,
  SIX_CONFIG_DESCRIPTIONS,
  SIX_CONFIG_LABELS,
  buildGeneratedConfigFromPropose,
  buildSkillContentFromGenerated,
  applySkillProposeContent,
  buildFocusedConfigProposeFocus,
  deriveDescriptorName,
  getSkillCreateWelcomeMessage,
  hasProposeUpdatesForKeys,
  isConfirmCreateMessage,
  parseSkillCreateInput,
  parseSkillInstructions,
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
import { createTenantSkill, listTenantSkill, publishTenantSkill, agentConsoleClient } from "@/api/agent-console-client";
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

function createWelcomeMessages(): ChatMessage[] {
  return [{ role: "ai", content: getSkillCreateWelcomeMessage() }];
}

export const SkillCreateModal = defineComponent({
  name: "SkillCreateModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:visible", "success"],
  setup(props, { emit }) {
    const chatInput = ref("");
    const messages = ref<ChatMessage[]>(createWelcomeMessages());
    const category = ref<SkillCategoryCode | undefined>(undefined);
    const publishToLibrary = ref(false);
    const creating = ref(false);
    const generating = ref(false);
    const generatedConfig = ref<SkillGeneratedConfig | null>(null);
    const selectedConfig = ref<SixConfigKey | null>(null);
    const streamingPreview = ref("");
    const modelCode = ref("");
    const llmOptions = ref<LlmOption[]>([]);
    const configBlockRefs = ref<Partial<Record<SixConfigKey, HTMLDivElement>>>({});

    const chatAreaRef = ref<HTMLDivElement | null>(null);

    const loadModels = async (): Promise<void> => {
      try {
        const options = await fetchAssistantLlmOptions("skill-create-modal");
        llmOptions.value = options;
        if (!modelCode.value.trim()) {
          modelCode.value = pickDefaultLlmModelCode(options);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[skill-create-modal] 加载模型列表失败", error);
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
            "当前租户没有可用的对话模型，无法调用 AI 生成。请先在「模型管理」中配置并启用模型，或在上方选择<strong>创作模型</strong>后重试；你也可以直接使用左侧默认模板手动编辑后创建。",
        });
        scrollToBottom();
        return null;
      }
      return code;
    };

    const resetDialog = (): void => {
      chatInput.value = "";
      messages.value = createWelcomeMessages();
      category.value = undefined;
      publishToLibrary.value = false;
      creating.value = false;
      generating.value = false;
      generatedConfig.value = null;
      selectedConfig.value = "usageExample";
      streamingPreview.value = "";
      modelCode.value = pickDefaultLlmModelCode(llmOptions.value);
    };

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          resetDialog();
          void loadModels();
        }
      },
    );

    watch(selectedConfig, (key) => {
      if (!key || !generatedConfig.value?.finished) {
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

    const validationResult = computed(() => {
      if (!generatedConfig.value?.finished) {
        return { valid: false, missing: [] as { key: SixConfigKey; label: string }[] };
      }
      return validateSixConfig(generatedConfig.value);
    });

    const canCreate = computed(() => {
      return category.value !== undefined && validationResult.value.valid;
    });

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

    const updateMetaField = <K extends "name" | "description" | "intro" | "activationMode" | "activationGlobs">(
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
        return "待生成";
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

    const handleCreate = async (): Promise<void> => {
      if (!category.value) {
        message.warning("请先选择技能分类");
        return;
      }
      if (!generatedConfig.value?.finished) {
        message.warning("请先通过对话生成技能配置");
        return;
      }

      const check = validateSixConfig(generatedConfig.value);
      if (!check.valid) {
        message.error(`请先完善：${check.missing.map((item) => item.label).join("、")}`);
        selectedConfig.value = check.missing[0]?.key ?? null;
        return;
      }

      const config = generatedConfig.value;
      if (config.activationMode === "path" && config.activationGlobs.length === 0) {
        message.error("路径匹配激活方式必须填写至少一个路径规则");
        return;
      }
      const content = buildSkillContentFromGenerated({
        ...config,
        category: category.value,
      });

      creating.value = true;
      try {
        const view = await createTenantSkill(deriveDescriptorName(config.name.trim() || "skill"), content);
        if (publishToLibrary.value) {
          const published = await publishTenantSkill(view.id);
          const versionNo = published.publishedVersionNo ?? published.headVersionNo;
          if (versionNo > 0) {
            await listTenantSkill(view.id, versionNo);
          }
        }
        message.success(publishToLibrary.value ? "技能创建成功并已发布到技能库" : "技能创建成功");
        emit("success");
      } catch (error) {
        message.error(`创建失败：${describeApiError(error)}`);
      } finally {
        creating.value = false;
      }
    };

    const handleConfigDirective = async (text: string): Promise<void> => {
      if (!generatedConfig.value?.finished) {
        messages.value.push({
          role: "ai",
          content: "请先生成技能配置，再使用 @配置项名称 定向修改。",
        });
        scrollToBottom();
        return;
      }

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

      generating.value = true;
      streamingPreview.value = "";
      const resolvedModelCode = await ensureModelCode();
      if (!resolvedModelCode) {
        generating.value = false;
        return;
      }

      const focusedFocus = buildFocusedConfigProposeFocus(configKey, text);

      try {
        const configCategory = category.value ?? generatedConfig.value.category;
        const baseConfig = {
          ...generatedConfig.value,
          ...(configCategory !== undefined ? { category: configCategory } : {}),
        };
        const result = await agentConsoleClient.propose(
          "skill",
          {
            base: buildSkillContentFromGenerated(baseConfig),
            focus: withSkillProposeLanguageHint(focusedFocus),
            modelCode: resolvedModelCode,
          },
          {
            onDelta: () => {
              streamingPreview.value = `正在更新【${configItem.label}】…`;
            },
          },
        );

        if (!result.valid) {
          message.warning(result.issues?.join("；") || "配置优化失败");
          messages.value.push({
            role: "ai",
            content: "配置优化未完成，请调整修改意见后重试。",
          });
          return;
        }

        const content = result.content as {
          displayName?: string;
          description?: string;
          instructions?: string;
        };

        if (!hasProposeUpdatesForKeys(content.instructions ?? "", [configKey])) {
          message.warning(`未能识别 AI 返回的【${configItem.label}】更新内容`);
          messages.value.push({
            role: "ai",
            content: `AI 已回复，但未能识别【${configItem.label}】的有效更新。请更具体地描述修改意见，或直接在左侧编辑器中修改。`,
          });
          return;
        }

        generatedConfig.value = applySkillProposeContent(generatedConfig.value, content, {
          onlyKeys: [configKey],
        });
        selectedConfig.value = configKey;

        messages.value.push({
          role: "ai",
          content: `已根据你的意见重新生成【${configItem.label}】，请在左侧编辑器查看并可直接修改。`,
        });
      } catch (error) {
        message.error(`配置优化失败：${describeApiError(error)}`);
      } finally {
        generating.value = false;
        streamingPreview.value = "";
        scrollToBottom();
      }
    };

    const generateSkill = async (text: string): Promise<void> => {
      const parsedInput = parseSkillCreateInput(text);
      if (!parsedInput) {
        messages.value.push({
          role: "ai",
          content:
            '请同时提供<strong>技能名称</strong>和<strong>功能描述</strong>，例如："隐患整改通知单生成，根据巡检结果自动填入整改项目"。',
        });
        scrollToBottom();
        return;
      }

      generating.value = true;
      streamingPreview.value = "";

      const resolvedModelCode = await ensureModelCode();
      if (!resolvedModelCode) {
        generating.value = false;
        return;
      }

      try {
        const result = await agentConsoleClient.propose(
          "skill",
          { intent: withSkillProposeLanguageHint(text), modelCode: resolvedModelCode },
          {
            onDelta: (delta: string) => {
              streamingPreview.value += delta;
            },
          },
        );

        const content = result.content as {
          displayName?: string;
          description?: string;
          instructions?: string;
        };

        const skillName = content.displayName?.trim() || parsedInput.name;
        const skillDescription = content.description?.trim() || parsedInput.description;

        const parsed = parseSkillInstructions(content.instructions ?? "");
        generatedConfig.value = buildGeneratedConfigFromPropose(parsed, {
          name: skillName,
          description: skillDescription,
          ...(category.value !== undefined ? { category: category.value } : {}),
        });
        selectedConfig.value = "usageExample";

        if (!result.valid) {
          messages.value.push({
            role: "ai",
            content: "AI 生成结果未完全通过校验，已为你填充默认六项配置模板，请在左侧逐项查看并修改。",
          });
        } else {
          messages.value.push({
            role: "ai",
            content: `已为「${skillName}」自动生成<strong>六项配置</strong>初稿。请在左侧逐项查看并可直接编辑；如需 AI 调整，输入 <code>@配置项名称</code> + 修改意见；确认无误后选择技能分类，回复「确认创建」或点击右下角按钮。`,
          });
        }
      } catch (error) {
        const errorText = describeApiError(error);
        message.error(`AI 生成失败：${errorText}`);
        generatedConfig.value = buildGeneratedConfigFromPropose(
          {},
          {
            name: parsedInput.name,
            description: parsedInput.description,
            ...(category.value !== undefined ? { category: category.value } : {}),
          },
        );
        selectedConfig.value = "usageExample";
        const isModelError = /catalog entry|no catalog|model=/i.test(errorText);
        messages.value.push({
          role: "ai",
          content: isModelError
            ? "创作模型不可用（请检查「模型管理」中是否已启用该模型，或在上方切换<strong>创作模型</strong>）。已为你填充默认六项配置模板，可在左侧编辑后确认创建。"
            : "AI 服务暂不可用，已为你填充默认六项配置模板，请在左侧编辑后确认创建。",
        });
      } finally {
        generating.value = false;
        streamingPreview.value = "";
        scrollToBottom();
      }
    };

    const handleSend = (): void => {
      const text = chatInput.value.trim();
      if (!text || generating.value || creating.value) {
        return;
      }

      messages.value.push({ role: "user", content: text });
      chatInput.value = "";
      scrollToBottom();

      if (isConfirmCreateMessage(text)) {
        void handleCreate();
        return;
      }

      if (text.startsWith("@")) {
        void handleConfigDirective(text);
        return;
      }

      void generateSkill(text);
    };

    return () => {
      const config = generatedConfig.value;
      const activeKey = selectedConfig.value;
      const finished = Boolean(config?.finished);

      const renderConfigBlock = (item: (typeof CONFIG_ITEMS)[number]) => {
        const statusLabel = getConfigStatusLabel(item.key, item.required);
        const isActive = finished && activeKey === item.key;
        const isReference = item.key === "reference";

        return (
          <div
            key={item.key}
            ref={(el) => setConfigBlockRef(item.key, el as HTMLDivElement | null)}
            class={[
              styles.editConfigBlock,
              isActive ? styles.editConfigBlockActive : undefined,
              !finished ? styles.editConfigBlockPending : undefined,
            ]}
            onClick={() => {
              if (finished) {
                selectedConfig.value = item.key;
              }
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
                    statusLabel === "已填写" ? styles.configStatusDone : statusLabel === "待完善" ? styles.configStatusWarn : undefined,
                  ]}
                >
                  {statusLabel}
                </span>
              ) : null}
            </div>
            {!finished ? (
              <div class={styles.editConfigBlockPendingBody}>{isReference ? "生成后可上传图片、文档等参考资料" : "待 AI 生成"}</div>
            ) : isReference ? (
              <div class={styles.editConfigEditor} onClick={(event: MouseEvent) => event.stopPropagation()}>
                <SkillReferenceEditor
                  value={config!.reference ?? ""}
                  noteRows={2}
                  onUpdate:value={(value: string) => {
                    updateConfigField("reference", value ?? "");
                  }}
                />
              </div>
            ) : (
              <Textarea
                class={styles.editConfigTextarea}
                value={config![item.key] ?? ""}
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
      };

      return (
        <Modal
          title="对话创建技能"
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
                {finished && config ? (
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
                          value={category.value}
                          placeholder="请选择分类"
                          options={CATEGORY_OPTIONS.map((opt) => ({
                            label: opt.label,
                            value: opt.value,
                          }))}
                          onChange={(v: SkillCategoryCode) => {
                            category.value = v;
                            generatedConfig.value = {
                              ...generatedConfig.value!,
                              category: v,
                            };
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
                    </div>
                  </div>
                ) : (
                  <div class={styles.createDialogPlaceholder}>
                    请先在右侧对话输入<strong>技能名称 + 功能描述</strong>，AI 生成后可在下方六项配置中直接编辑；「参考资源」支持上传附件。
                  </div>
                )}

                <div class={styles.editDialogConfigSection}>
                  <h4 class={styles.editDialogConfigTitle}>六项配置</h4>
                  {CONFIG_ITEMS.map((item) => renderConfigBlock(item))}
                </div>
              </div>

              <div class={styles.editDialogChatColumn}>
                <div class={styles.createDialogHeader}>
                  <span class={styles.createDialogHeaderLabel}>创作模型</span>
                  <Select
                    value={modelCode.value || undefined}
                    placeholder="选择模型"
                    style={{ width: "180px" }}
                    options={llmOptions.value.map((opt) => ({
                      label: opt.displayName,
                      value: opt.modelCode,
                    }))}
                    onChange={(v: string) => {
                      modelCode.value = v ?? "";
                    }}
                  />
                  <span class={styles.createDialogHeaderHint}>{finished ? "@配置项 定向修改" : "生成后须选定分类再创建"}</span>
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
                          <span style="white-space: pre-wrap;">{streamingPreview.value}</span>
                        ) : (
                          <span style="color: #9ca3af;">AI 正在生成配置…</span>
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
                      placeholder="输入技能名称+功能描述；生成后可用 @配置项名称 定向修改，或回复「确认创建」"
                      disabled={generating.value || creating.value}
                      onUpdate:value={(value: string) => {
                        chatInput.value = value ?? "";
                      }}
                      onSend={handleSend}
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={generating.value} />
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
              >
                <span class={styles.createDialogFooterHint}>发布到技能库</span>
              </Checkbox>
              <div class={styles.createDialogFooterActions}>
                <Button onClick={handleClose}>取消</Button>
                <Button
                  type="primary"
                  loading={creating.value}
                  disabled={!canCreate.value || creating.value || generating.value}
                  onClick={() => void handleCreate()}
                >
                  确认创建
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      );
    };
  },
});

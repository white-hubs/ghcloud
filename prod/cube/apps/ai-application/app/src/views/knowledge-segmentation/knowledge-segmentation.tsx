import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  KnowledgeChunkingPayload,
  KnowledgeDocumentSegmentItem,
  KnowledgeDocumentSegmentPreviewItem,
} from "@ghcloud/cube-ai-application-service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { AntModal, Button, Form, FormItem, Input, message, Select, Spin, Textarea, Tooltip } from "@ghcloud/cube-ui";

import type { KnowledgeDocumentModel } from "../../../../../knowledge-document/service/src/types";
import { cubeAiApplicationService, cubeKnowledgeDocumentService } from "@/api/service";

import styles from "./knowledge-segmentation.module.less";

const DEFAULT_CHUNK_SIZE = "1000";
const DEFAULT_CHUNK_OVERLAP = "200";
const PRESET_SEPARATORS = [
  { label: "双换行", value: "\\n\\n" },
  { label: "换行", value: "\\n" },
  { label: "空格", value: " " },
  { label: "。", value: "。" },
  { label: "，", value: "，" },
];
const TEXT_CHUNK_MODE_OPTIONS = [
  { label: "系统默认", value: "" },
  { label: "auto - 自动（默认）", value: "auto" },
  { label: "block - 按块", value: "block" },
  { label: "merge - 合并", value: "merge" },
];
const TABLE_CHUNK_MODE_OPTIONS = [
  { label: "系统默认", value: "" },
  { label: "auto - 自动（默认）", value: "auto" },
  { label: "row - 按行", value: "row" },
  { label: "window - 按窗口", value: "window" },
];
const SEPARATOR_TIP = "用于在全文里先把文字拆成多段再入库切分。支持如 \\n\\n、\\n、空格或自定义符号。";
const CHUNK_SIZE_TIP = "每个分段允许的最大字符数，建议控制在 50 - 1800 范围内。";
const CHUNK_OVERLAP_TIP = "相邻两段之间重复的字符数，用于保持上下文衔接。须小于“分块长度”；留空则使用系统默认。";
const TEXT_CHUNK_MODE_TIP = "文本二次分段策略（在解析得到的段落上再切分）；未传时服务端默认 auto。";
const TABLE_CHUNK_MODE_TIP = "表格分段模式（主要影响 Excel、CSV 等表格类文件），对 PDF、Word、PPT 的表格块影响有限。";

function formatOptionalNumber(value: number | null | undefined): string {
  return value == null ? "--" : String(value);
}

function resolveChunkId(item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem): string {
  return item.chunkId ?? item.chunk_id ?? "";
}

/** 后端 chunkIndex 多为 0 起始，界面展示从 1 开始 */
function resolveChunkIndex(item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem): string {
  const index = item.chunkIndex ?? item.chunk_index;
  if (index == null) {
    return "--";
  }
  const n = typeof index === "number" ? index : Number.parseInt(String(index), 10);
  if (!Number.isFinite(n)) {
    return String(index);
  }
  return String(n + 1);
}

function resolveChunkText(item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem): string {
  return item.text?.trim() || "--";
}

function resolveChunkType(item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem): string {
  return item.chunkType ?? item.chunk_type ?? "--";
}

function resolveChunkCharCount(item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem): string {
  return formatOptionalNumber(item.charCount ?? item.char_count);
}

function resolveHeadingPath(item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem): string {
  const headingPath = item.headingPath ?? item.heading_path;
  if (!Array.isArray(headingPath) || headingPath.length === 0) {
    return "--";
  }
  return headingPath.join(" / ");
}

function parseCommaValues(value: string): string[] | null {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return items.length > 0 ? items : null;
}

function resolveSeparatorValue(value: string): string {
  return value.replaceAll("\\n", "\n");
}

function resolveRouteDocumentName(value: unknown): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "").trim();
  }

  return typeof value === "string" ? value.trim() : "";
}

function resolveDocumentFileName(document: KnowledgeDocumentModel | null): string {
  const firstFile = Array.isArray(document?.fileList) ? document.fileList[0] : null;
  return firstFile?.name?.trim() || "";
}

function renderLabel(title: string, options?: { required?: boolean; tip?: string }): JSX.Element {
  const titleNode = <span class={[styles.labelText, options?.tip && styles.labelTextWithTip]}>{title}</span>;

  return (
    <span class={styles.labelWrap}>
      {options?.required && <span class={styles.requiredMark}>*</span>}
      {options?.tip ? <Tooltip title={options.tip}>{titleNode}</Tooltip> : titleNode}
    </span>
  );
}

function renderSegmentCard(
  item: KnowledgeDocumentSegmentItem | KnowledgeDocumentSegmentPreviewItem,
  styles: Record<string, string>,
): JSX.Element {
  return (
    <div key={resolveChunkId(item) || resolveChunkIndex(item)} class={styles.segmentCard}>
      <div class={styles.segmentMeta}>
        <span>序号：{resolveChunkIndex(item)}</span>
        <span>字符数：{resolveChunkCharCount(item)}</span>
      </div>
      <div class={styles.segmentText}>
        <div class={styles.segmentTextInner}>{resolveChunkText(item)}</div>
      </div>
    </div>
  );
}

function buildChunkingPayload(form: {
  mode: "default" | "custom";
  separator: string;
  chunkSize: string;
  chunkOverlap: string;
  tableChunkMode: string;
  textChunkMode: string;
}): KnowledgeChunkingPayload {
  if (form.mode === "default") {
    return {};
  }
  const payload: KnowledgeChunkingPayload = {};
  const separator = resolveSeparatorValue(form.separator);
  const chunkSize = Number.parseInt(form.chunkSize, 10);
  const chunkOverlap = Number.parseInt(form.chunkOverlap, 10);
  const tableChunkMode = form.tableChunkMode.trim();
  const textChunkMode = form.textChunkMode.trim();
  if (form.separator.length > 0) {
    payload.separator = separator;
  }
  if (Number.isFinite(chunkSize)) {
    payload.chunkSize = chunkSize;
  }
  if (Number.isFinite(chunkOverlap)) {
    payload.chunkOverlap = chunkOverlap;
  }
  if (tableChunkMode) {
    payload.tableChunkMode = tableChunkMode;
  }
  if (textChunkMode) {
    payload.textChunkMode = textChunkMode;
  }
  return payload;
}

export const KnowledgeSegmentation = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const bizDocumentId = String(route.params.bizDocumentId ?? "").trim();
    const routeDocumentName = resolveRouteDocumentName(route.query.documentName);
    const routeFileName = resolveRouteDocumentName(route.query.fileName);
    const pageLoading = ref(false);
    const actionLoading = ref(false);
    const segmentEditLoading = ref(false);
    const documentDetail = ref<KnowledgeDocumentModel | null>(null);
    const currentView = ref<"preview" | "saved">("preview");
    const previewChunkCount = ref<number | null>(null);
    const previewItems = ref<KnowledgeDocumentSegmentPreviewItem[]>([]);
    const savedSegments = ref<KnowledgeDocumentSegmentItem[]>([]);
    const editModalVisible = ref(false);
    const editingSegment = ref<KnowledgeDocumentSegmentItem | null>(null);
    const previousLayoutContentStyle = {
      overflowY: "",
      display: "",
      flexDirection: "",
      minHeight: "",
    };

    const chunkingForm = reactive({
      mode: "default" as "default" | "custom",
      separator: "",
      chunkSize: DEFAULT_CHUNK_SIZE,
      chunkOverlap: DEFAULT_CHUNK_OVERLAP,
      tableChunkMode: "",
      textChunkMode: "",
    });

    const editForm = reactive({
      text: "",
      keywordsAdd: "",
      keywordsRemove: "",
    });

    const loadDocumentDetail = async (): Promise<void> => {
      pageLoading.value = true;
      try {
        documentDetail.value = await cubeKnowledgeDocumentService.getKnowledgeDocumentDetails({ id: bizDocumentId });
      } finally {
        pageLoading.value = false;
      }
    };

    const lockLayoutContentScroll = (): void => {
      const layoutContent = document.getElementById("cube-layout-content");
      if (!layoutContent) {
        return;
      }

      previousLayoutContentStyle.overflowY = layoutContent.style.overflowY;
      previousLayoutContentStyle.display = layoutContent.style.display;
      previousLayoutContentStyle.flexDirection = layoutContent.style.flexDirection;
      previousLayoutContentStyle.minHeight = layoutContent.style.minHeight;
      layoutContent.style.overflowY = "hidden";
      layoutContent.style.display = "flex";
      layoutContent.style.flexDirection = "column";
      layoutContent.style.minHeight = "0";
    };

    const restoreLayoutContentScroll = (): void => {
      const layoutContent = document.getElementById("cube-layout-content");
      if (!layoutContent) {
        return;
      }

      layoutContent.style.overflowY = previousLayoutContentStyle.overflowY;
      layoutContent.style.display = previousLayoutContentStyle.display;
      layoutContent.style.flexDirection = previousLayoutContentStyle.flexDirection;
      layoutContent.style.minHeight = previousLayoutContentStyle.minHeight;
    };

    const validateChunkingForm = (): boolean => {
      if (chunkingForm.mode === "custom" && chunkingForm.separator.length === 0) {
        message.error("自定义分段时，分段标识符不能为空");
        return false;
      }

      return true;
    };

    const handlePreview = async (): Promise<void> => {
      if (!validateChunkingForm()) {
        return;
      }
      actionLoading.value = true;
      try {
        const result = await cubeAiApplicationService.previewKnowledgeDocumentSegments(bizDocumentId, buildChunkingPayload(chunkingForm));
        previewItems.value = Array.isArray(result.items) ? result.items : [];
        previewChunkCount.value = result.chunkCount ?? previewItems.value.length;
        currentView.value = "preview";
        message.success("预览分段完成");
      } finally {
        actionLoading.value = false;
      }
    };

    const handleSegment = async (): Promise<void> => {
      if (!validateChunkingForm()) {
        return;
      }
      actionLoading.value = true;
      try {
        const result = await cubeAiApplicationService.segmentKnowledgeDocument(bizDocumentId, buildChunkingPayload(chunkingForm));
        savedSegments.value = Array.isArray(result.chunks) ? result.chunks : [];
        currentView.value = "saved";
        message.success("确认分段成功，已重新上传业务文件");
      } finally {
        actionLoading.value = false;
      }
    };

    const handleBack = (): void => {
      void router.push({ name: "knowledge-document-list" });
    };

    const applySeparatorPreset = (value: string): void => {
      if (chunkingForm.mode === "default") {
        chunkingForm.mode = "custom";
      }
      chunkingForm.separator = value;
    };

    const openEditModal = (segment: KnowledgeDocumentSegmentItem): void => {
      editingSegment.value = segment;
      editForm.text = segment.text ?? "";
      editForm.keywordsAdd = "";
      editForm.keywordsRemove = "";
      editModalVisible.value = true;
    };

    const handleSubmitSegmentEdit = async (): Promise<void> => {
      const currentSegment = editingSegment.value;
      const segmentId = currentSegment ? resolveChunkId(currentSegment) : "";
      if (!segmentId) {
        message.error("当前分段缺少ID，无法编辑");
        return;
      }
      segmentEditLoading.value = true;
      try {
        const updatedSegment = await cubeAiApplicationService.updateKnowledgeDocumentSegment(bizDocumentId, segmentId, {
          text: editForm.text.trim() || null,
          keywordsAdd: parseCommaValues(editForm.keywordsAdd),
          keywordsRemove: parseCommaValues(editForm.keywordsRemove),
        });
        savedSegments.value = savedSegments.value.map((item) => (resolveChunkId(item) === segmentId ? updatedSegment : item));
        editModalVisible.value = false;
        editingSegment.value = null;
        message.success("分段内容已更新");
      } finally {
        segmentEditLoading.value = false;
      }
    };

    onMounted(() => {
      lockLayoutContentScroll();
      void loadDocumentDetail();
    });

    onBeforeUnmount(() => {
      restoreLayoutContentScroll();
    });

    return (): JSX.Element => {
      const documentName = routeDocumentName || documentDetail.value?.name || bizDocumentId || "文档分段";
      const documentFileName = routeFileName || resolveDocumentFileName(documentDetail.value) || documentName;
      const previewCount = previewChunkCount.value ?? previewItems.value.length;

      return (
        <CubeLayout
          title="文档分段"
          showHeader={false}
          showFooter={false}
          v-slots={{
            "layout-content": () => (
              <div class={styles.pageShell}>
                <div class={styles.page}>
                  <div class={styles.pageHeaderBar}>
                    <button type="button" class={styles.pageHeader} onClick={handleBack}>
                      <span class={styles.backIcon} aria-hidden="true">
                        <svg viewBox="0 0 16 16">
                          <path d="M14 8H3.5"></path>
                          <path d="M7 3.5 2.5 8 7 12.5"></path>
                        </svg>
                      </span>
                      <span class={styles.pageHeaderTitle}>{documentName}</span>
                    </button>
                  </div>

                  <Spin spinning={pageLoading.value}>
                    <div class={styles.content}>
                      <div class={styles.leftPanel}>
                        <div class={styles.panelTitle}>文本设置</div>
                        <div class={styles.settingsCard}>
                          <div
                            class={[styles.modePanel, chunkingForm.mode === "default" && styles.modePanelActive]}
                            onClick={() => {
                              chunkingForm.mode = "default";
                            }}
                          >
                            <button type="button" class={styles.modeHeaderButton}>
                              <span class={[styles.radioMarker, chunkingForm.mode === "default" && styles.radioMarkerActive]}></span>
                              <span class={styles.modeTitle}>默认分段</span>
                            </button>
                          </div>

                          <div
                            class={[styles.modePanel, styles.modePanelExpanded, chunkingForm.mode === "custom" && styles.modePanelActive]}
                            onClick={() => {
                              chunkingForm.mode = "custom";
                            }}
                          >
                            <button type="button" class={styles.modeHeaderButton}>
                              <span class={[styles.radioMarker, chunkingForm.mode === "custom" && styles.radioMarkerActive]}></span>
                              <span class={styles.modeTitle}>自定义分段</span>
                            </button>

                            <div class={styles.modeBody}>
                              <div class={styles.formIntro}>以下参数用于控制文档入库时的文本切分。若留空，将使用系统默认配置。</div>

                              <div class={styles.configForm}>
                                <div class={styles.fieldItem}>
                                  <div class={styles.fieldLabel}>
                                    {renderLabel("分段标识符", { required: chunkingForm.mode === "custom", tip: SEPARATOR_TIP })}
                                  </div>
                                  <div class={styles.fieldControl}>
                                    <Input
                                      disabled={chunkingForm.mode === "default"}
                                      value={chunkingForm.separator}
                                      placeholder="例如 \\n\\n 或两段换行"
                                      maxlength={80}
                                      onUpdate:value={(value: string) => {
                                        chunkingForm.separator = value ?? "";
                                      }}
                                    />
                                    <div class={styles.presetList}>
                                      {PRESET_SEPARATORS.map((item) => (
                                        <button
                                          key={item.label}
                                          type="button"
                                          class={styles.presetButton}
                                          disabled={chunkingForm.mode === "default"}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            applySeparatorPreset(item.value);
                                          }}
                                        >
                                          {item.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div class={styles.fieldItem}>
                                  <div class={styles.fieldLabel}>{renderLabel("分段最大长度", { tip: CHUNK_SIZE_TIP })}</div>
                                  <div class={styles.fieldControl}>
                                    <Input
                                      disabled={chunkingForm.mode === "default"}
                                      value={chunkingForm.chunkSize}
                                      placeholder="留空为系统默认"
                                      maxlength={20}
                                      onUpdate:value={(value: string) => {
                                        chunkingForm.chunkSize = value ?? "";
                                      }}
                                    />
                                  </div>
                                </div>

                                <div class={styles.fieldItem}>
                                  <div class={styles.fieldLabel}>{renderLabel("分段重叠长度", { tip: CHUNK_OVERLAP_TIP })}</div>
                                  <div class={styles.fieldControl}>
                                    <Input
                                      disabled={chunkingForm.mode === "default"}
                                      value={chunkingForm.chunkOverlap}
                                      placeholder="留空为系统默认"
                                      maxlength={20}
                                      onUpdate:value={(value: string) => {
                                        chunkingForm.chunkOverlap = value ?? "";
                                      }}
                                    />
                                  </div>
                                </div>

                                <div class={styles.fieldItem}>
                                  <div class={styles.fieldLabel}>{renderLabel("文本二次分段", { tip: TEXT_CHUNK_MODE_TIP })}</div>
                                  <div class={styles.fieldControl}>
                                    <Select
                                      disabled={chunkingForm.mode === "default"}
                                      value={chunkingForm.textChunkMode}
                                      options={TEXT_CHUNK_MODE_OPTIONS}
                                      placeholder="系统默认"
                                      onUpdate:value={(value: string) => {
                                        chunkingForm.textChunkMode = value ?? "";
                                      }}
                                    />
                                  </div>
                                </div>

                                <div class={styles.fieldItem}>
                                  <div class={styles.fieldLabel}>{renderLabel("表格分段模式", { tip: TABLE_CHUNK_MODE_TIP })}</div>
                                  <div class={styles.fieldControl}>
                                    <Select
                                      disabled={chunkingForm.mode === "default"}
                                      value={chunkingForm.tableChunkMode}
                                      options={TABLE_CHUNK_MODE_OPTIONS}
                                      placeholder="系统默认"
                                      onUpdate:value={(value: string) => {
                                        chunkingForm.tableChunkMode = value ?? "";
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class={styles.actionPanel}>
                            <Button
                              loading={actionLoading.value}
                              onClick={() => {
                                void handlePreview();
                              }}
                            >
                              预览
                            </Button>
                            <Button
                              type="primary"
                              loading={actionLoading.value}
                              onClick={() => {
                                void handleSegment();
                              }}
                            >
                              开始处理
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div class={styles.rightPanel}>
                        <div class={styles.resultDetailWrap}>
                          <div class={styles.resultCard}>
                            <div class={styles.resultHeader}>
                              <div class={styles.resultHeaderMain}>
                                <div class={styles.sectionTitle}>分段结果</div>
                                <div class={styles.resultDescFileName}>{documentFileName}</div>
                                <div class={styles.resultDescStat}>
                                  {currentView.value === "preview"
                                    ? `当前预览 ${previewCount} 段`
                                    : `当前已保存 ${savedSegments.value.length} 段`}
                                </div>
                              </div>
                            </div>

                            <div class={styles.resultViewport}>
                              <div class={styles.resultBody}>
                                {currentView.value === "preview" && previewItems.value.length === 0 && (
                                  <div class={styles.empty}>暂无预览结果，请点击左侧「预览」查看。</div>
                                )}

                                {currentView.value === "saved" && savedSegments.value.length === 0 && (
                                  <div class={styles.empty}>暂无已保存分段，请先点击左侧「开始处理」。</div>
                                )}

                                {currentView.value === "preview" && previewItems.value.length > 0 && (
                                  <div class={styles.segmentList}>{previewItems.value.map((item) => renderSegmentCard(item, styles))}</div>
                                )}

                                {currentView.value === "saved" && savedSegments.value.length > 0 && (
                                  <div class={styles.segmentList}>{savedSegments.value.map((item) => renderSegmentCard(item, styles))}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Spin>
                </div>

                <AntModal
                  v-model:visible={editModalVisible.value}
                  title="编辑分段"
                  width={680}
                  okText="保存"
                  cancelText="取消"
                  maskClosable={false}
                  confirmLoading={segmentEditLoading.value}
                  onOk={() => {
                    void handleSubmitSegmentEdit();
                  }}
                  onCancel={() => {
                    editModalVisible.value = false;
                    editingSegment.value = null;
                  }}
                >
                  <Form labelCol={{ style: { width: "120px" } }}>
                    <FormItem label="分段内容：">
                      <Textarea
                        rows={8}
                        value={editForm.text}
                        placeholder="请输入新的分段内容"
                        onUpdate:value={(value: string) => {
                          editForm.text = value ?? "";
                        }}
                      />
                    </FormItem>
                    <FormItem label="新增关键词：">
                      <Input
                        value={editForm.keywordsAdd}
                        placeholder="多个关键词用英文逗号分隔"
                        onUpdate:value={(value: string) => {
                          editForm.keywordsAdd = value ?? "";
                        }}
                      />
                    </FormItem>
                    <FormItem label="移除关键词：">
                      <Input
                        value={editForm.keywordsRemove}
                        placeholder="多个关键词用英文逗号分隔"
                        onUpdate:value={(value: string) => {
                          editForm.keywordsRemove = value ?? "";
                        }}
                      />
                    </FormItem>
                  </Form>
                </AntModal>
              </div>
            ),
          }}
        />
      );
    };
  },
});

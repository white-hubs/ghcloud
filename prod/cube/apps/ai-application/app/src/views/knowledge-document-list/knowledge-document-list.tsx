import { Pagination } from "ant-design-vue/es";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeAiApplicationService } from "@ghcloud/cube-ai-application-service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { AntModal, Button, Checkbox, Input, Progress, SearchOutlined, Select, Spin, message } from "@ghcloud/cube-ui";

import type { KnowledgeDocumentModel, KnowledgeDocumentTypeModel } from "../../../../../knowledge-document/service/src/types";
import { authStore } from "@/api/auth-store";
import { cubeKnowledgeDocumentService } from "@/api/service";

import styles from "./knowledge-document-list.module.less";

const STATUS_ALL = "all";
const STATUS_ENABLED = "enabled";
const STATUS_DISABLED = "disabled";
const STATUS_OPTIONS = [
  { label: "启用", value: STATUS_ENABLED },
  { label: "禁用", value: STATUS_DISABLED },
];

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hour = padDatePart(date.getHours());
  const minute = padDatePart(date.getMinutes());
  const second = padDatePart(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function formatBytes(size: number | null | undefined): string {
  if (!size || size <= 0) {
    return "--";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function normalizeStatusFilter(value: string): boolean | undefined {
  if (value === STATUS_ENABLED) {
    return true;
  }
  if (value === STATUS_DISABLED) {
    return false;
  }
  return undefined;
}

function getStatusSwitchValue(value: boolean | string | null | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "enabled" || normalized === "enable" || normalized === "1";
  }
  return false;
}

function getStatusTagLabel(value: boolean | string | null | undefined): "启用" | "禁用" {
  return getStatusSwitchValue(value) ? "启用" : "禁用";
}

interface BatchSegmentFailure {
  documentId: string;
  documentName: string;
  errorMessage: string;
}

const aiApplicationService = new CubeAiApplicationService(authStore);

function resolveErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "toJSON" in error && typeof error.toJSON === "function") {
    try {
      const json = error.toJSON() as { errorMessage?: string };
      if (json.errorMessage?.trim()) {
        return json.errorMessage.trim();
      }
    } catch {
      // ignore malformed service error
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return "分段失败";
}

export const KnowledgeDocumentList = defineComponent({
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const typeTreeLoading = ref(false);
    const documents = ref<KnowledgeDocumentModel[]>([]);
    const typeOptions = ref<KnowledgeDocumentTypeModel[]>([]);
    const typeKeyword = ref("");
    const selectedTypeId = ref("");
    const selectedDocumentId = ref("");
    const selectedRowKeys = ref<string[]>([]);
    const expandedKeys = ref<string[]>([]);
    const switchingDocumentIds = ref<string[]>([]);
    const state = reactive({
      keyword: "",
      status: STATUS_ALL,
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      jumpPage: "1",
    });

    const displayedTotal = computed(() => state.total);
    const totalPages = computed(() => {
      const pageCount = Math.ceil(displayedTotal.value / state.pageSize);
      return Math.max(pageCount, 1);
    });

    const selectedDocument = computed(() => {
      const targetId = selectedRowKeys.value[0] ?? selectedDocumentId.value;
      return documents.value.find((document) => document.id === targetId) ?? null;
    });
    const hasSelectedDocument = computed(() => Boolean(selectedDocument.value?.id));
    const hasBatchSelection = computed(() => selectedRowKeys.value.length > 0);

    const batchSegmentModalVisible = ref(false);
    const batchSegmentRunning = ref(false);
    const batchSegmentTotal = ref(0);
    const batchSegmentFinished = ref(0);
    const batchSegmentSuccessCount = ref(0);
    const batchSegmentFailureCount = ref(0);
    const batchSegmentFailures = ref<BatchSegmentFailure[]>([]);
    const batchSegmentCurrentName = ref("");

    const batchSegmentProgress = computed(() => {
      if (batchSegmentTotal.value <= 0) {
        return 0;
      }
      return Math.round((batchSegmentFinished.value / batchSegmentTotal.value) * 100);
    });

    const batchSegmentProgressStatus = computed((): "active" | "success" | "exception" => {
      if (batchSegmentRunning.value) {
        return "active";
      }
      return batchSegmentFailureCount.value > 0 ? "exception" : "success";
    });

    const selectableIds = computed(() => documents.value.map((document) => document.id).filter((id): id is string => Boolean(id)));

    const allRowsSelected = computed(() => {
      const ids = selectableIds.value;
      return ids.length > 0 && ids.every((id) => selectedRowKeys.value.includes(id));
    });

    const toggleSelectAll = (checked: boolean): void => {
      selectedRowKeys.value = checked ? [...selectableIds.value] : [];
    };

    const toggleRowSelected = (documentId: string, checked: boolean): void => {
      if (checked) {
        if (!selectedRowKeys.value.includes(documentId)) {
          selectedRowKeys.value = [...selectedRowKeys.value, documentId];
        }
      } else {
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== documentId);
      }
    };

    const loadDocuments = async (): Promise<void> => {
      loading.value = true;
      try {
        const keyword = state.keyword.trim();
        const status = normalizeStatusFilter(state.status);
        const payload: {
          pageNumber: number;
          pageSize: number;
          name: string | null;
          status?: boolean;
          typeId: string | null;
          deptId: string | null;
          productId: string | null;
        } = {
          pageNumber: state.pageNumber,
          pageSize: state.pageSize,
          name: keyword,
          typeId: selectedTypeId.value,
          deptId: "",
          productId: "",
        };
        if (status !== undefined) {
          payload.status = status;
        }
        const response = await cubeKnowledgeDocumentService.getKnowledgeDocumentList(payload);
        documents.value = Array.isArray(response.records) ? response.records : [];
        if (!documents.value.some((document) => document.id === selectedDocumentId.value)) {
          selectedDocumentId.value = "";
        }
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => documents.value.some((document) => document.id === id));
        state.total = response.total ?? 0;
        state.jumpPage = String(state.pageNumber);
      } finally {
        loading.value = false;
      }
    };

    const hasChildren = (item: KnowledgeDocumentTypeModel): boolean => Array.isArray(item.children) && item.children.length > 0;

    /** 为选中类型展开祖先链路；若自身有子级也展开 */
    const resolveExpandKeysForType = (items: KnowledgeDocumentTypeModel[], typeId: string, parents: string[] = []): string[] | null => {
      for (const item of items) {
        if (!item.id) {
          continue;
        }
        if (item.id === typeId) {
          const keys = [...parents];
          if (hasChildren(item)) {
            keys.push(item.id);
          }
          return keys;
        }
        const childKeys = resolveExpandKeysForType(Array.isArray(item.children) ? item.children : [], typeId, [...parents, item.id]);
        if (childKeys) {
          return childKeys;
        }
      }
      return null;
    };

    const loadTypeTree = async (): Promise<void> => {
      typeTreeLoading.value = true;
      try {
        const response = !typeKeyword.value.trim()
          ? await cubeKnowledgeDocumentService.getKnowledgeTypeTreeList()
          : await cubeKnowledgeDocumentService.getKnowledgeTypeTreeList({ name: typeKeyword.value.trim() });
        typeOptions.value = Array.isArray(response) ? response : [];
        if (selectedTypeId.value) {
          expandedKeys.value = resolveExpandKeysForType(typeOptions.value, selectedTypeId.value) ?? [];
        } else {
          expandedKeys.value = [];
        }
      } finally {
        typeTreeLoading.value = false;
      }
    };

    const isExpanded = (itemId: string): boolean => expandedKeys.value.includes(itemId);

    const toggleExpanded = (itemId: string): void => {
      expandedKeys.value = isExpanded(itemId) ? expandedKeys.value.filter((id) => id !== itemId) : [...expandedKeys.value, itemId];
    };

    const handleTypeSelect = (item: KnowledgeDocumentTypeModel): void => {
      if (!item.id) {
        return;
      }
      const sameItemSelected = selectedTypeId.value === item.id;
      if (hasChildren(item)) {
        toggleExpanded(item.id);
      }
      selectedTypeId.value = sameItemSelected ? "" : item.id;
      state.pageNumber = 1;
      void loadDocuments();
    };

    const renderTypeMenu = (items: KnowledgeDocumentTypeModel[], level = 0): JSX.Element[] =>
      items.map((item) => {
        const children = Array.isArray(item.children) ? item.children : [];
        const expanded = isExpanded(item.id);
        const selected = selectedTypeId.value === item.id;
        const rootItem = level === 0;
        return (
          <div key={item.id} class={styles.treeNode}>
            <div
              class={[
                styles.treeItem,
                rootItem ? styles.treeRootItem : styles.treeChildItem,
                selected ? (rootItem ? styles.treeRootItemActive : styles.treeChildItemActive) : undefined,
                rootItem && expanded ? styles.treeRootItemExpanded : undefined,
              ]}
              onClick={() => {
                handleTypeSelect(item);
              }}
            >
              {rootItem ? (
                <span class={[styles.treeArrow, expanded ? styles.menuArrowExpanded : styles.menuArrowCollapsed]} />
              ) : (
                <span class={styles.treeArrowPlaceholder} />
              )}
              <span class={[styles.treeLabel, rootItem ? styles.treeLabelLevel1 : styles.treeLabelLevel2]}>{item.name}</span>
            </div>
            {rootItem && expanded && children.length > 0 && <div class={styles.treeChildren}>{renderTypeMenu(children, level + 1)}</div>}
          </div>
        );
      });

    const handleSearch = (): void => {
      state.pageNumber = 1;
      void loadDocuments();
    };

    const handleTypeKeywordSearch = (): void => {
      void loadTypeTree();
    };

    const handleReset = (): void => {
      state.keyword = "";
      state.status = STATUS_ALL;
      selectedTypeId.value = "";
      selectedDocumentId.value = "";
      selectedRowKeys.value = [];
      state.pageNumber = 1;
      void loadDocuments();
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      state.pageNumber = pageNumber;
      state.pageSize = pageSize;
      state.jumpPage = String(pageNumber);
      void loadDocuments();
    };

    const handleDocumentStatusSwitch = async (checked: boolean, document: KnowledgeDocumentModel): Promise<void> => {
      if (!document.id || switchingDocumentIds.value.includes(document.id)) {
        return;
      }
      switchingDocumentIds.value = [...switchingDocumentIds.value, document.id];
      try {
        await cubeKnowledgeDocumentService.switchKnowledgeDocumentStatus({
          id: document.id,
          status: checked,
        });
        documents.value = documents.value.map((item) => {
          if (item.id !== document.id) {
            return item;
          }
          return {
            ...item,
            status: checked,
          };
        });
        message.success("状态更新成功");
      } finally {
        switchingDocumentIds.value = switchingDocumentIds.value.filter((id) => id !== document.id);
      }
    };

    const handleJumpPage = (): void => {
      const pageNumber = Number.parseInt(state.jumpPage.trim(), 10);
      if (!Number.isFinite(pageNumber)) {
        state.jumpPage = String(state.pageNumber);
        return;
      }
      const nextPage = Math.min(Math.max(pageNumber, 1), totalPages.value);
      if (nextPage === state.pageNumber) {
        state.jumpPage = String(nextPage);
        return;
      }
      state.pageNumber = nextPage;
      state.jumpPage = String(nextPage);
      void loadDocuments();
    };

    const goSegmentation = (document: KnowledgeDocumentModel): void => {
      if (!document.id) {
        return;
      }
      void router.push({
        name: "knowledge-segmentation",
        params: {
          bizDocumentId: document.id,
        },
        query: {
          documentName: document.name ?? "",
          fileName: document.fileList?.[0]?.name ?? "",
        },
      });
    };

    const goRetrievalTest = (document: KnowledgeDocumentModel): void => {
      if (!document.id) {
        return;
      }
      void router.push({
        name: "knowledge-retrieval-test",
        params: {
          bizDocumentId: document.id,
        },
      });
    };

    const runBatchSegmentation = async (): Promise<void> => {
      const targets = selectedRowKeys.value
        .map((id) => documents.value.find((document) => document.id === id))
        .filter((document): document is KnowledgeDocumentModel => Boolean(document?.id));

      if (targets.length === 0) {
        message.warning("请先勾选要分段的文档");
        return;
      }

      batchSegmentModalVisible.value = true;
      batchSegmentRunning.value = true;
      batchSegmentTotal.value = targets.length;
      batchSegmentFinished.value = 0;
      batchSegmentSuccessCount.value = 0;
      batchSegmentFailureCount.value = 0;
      batchSegmentFailures.value = [];
      batchSegmentCurrentName.value = "";

      for (const document of targets) {
        const documentId = document.id!;
        const documentName = document.name?.trim() || documentId;
        batchSegmentCurrentName.value = documentName;
        try {
          await aiApplicationService.segmentKnowledgeDocument(documentId, {});
          batchSegmentSuccessCount.value += 1;
        } catch (error) {
          batchSegmentFailureCount.value += 1;
          batchSegmentFailures.value = [
            ...batchSegmentFailures.value,
            {
              documentId,
              documentName,
              errorMessage: resolveErrorMessage(error),
            },
          ];
        } finally {
          batchSegmentFinished.value += 1;
        }
      }

      batchSegmentRunning.value = false;
      batchSegmentCurrentName.value = "";
      await loadDocuments();

      if (batchSegmentFailureCount.value === 0) {
        message.success(`批量分段完成，成功 ${batchSegmentSuccessCount.value} 个`);
        return;
      }
      if (batchSegmentSuccessCount.value === 0) {
        message.error(`批量分段失败，${batchSegmentFailureCount.value} 个文档均未成功`);
        return;
      }
      message.warning(`批量分段完成：成功 ${batchSegmentSuccessCount.value} 个，失败 ${batchSegmentFailureCount.value} 个`);
    };

    const handleTopRetrievalTest = (): void => {
      if (!selectedDocument.value) {
        return;
      }
      goRetrievalTest(selectedDocument.value);
    };

    const previousLayoutContentStyle = {
      overflowY: "",
      display: "",
      flexDirection: "",
      minHeight: "",
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

    onMounted(() => {
      lockLayoutContentScroll();
      const typeIdFromQuery = typeof route.query.typeId === "string" ? route.query.typeId.trim() : "";
      if (typeIdFromQuery) {
        selectedTypeId.value = typeIdFromQuery;
      }
      const keywordFromQuery = typeof route.query.keyword === "string" ? route.query.keyword.trim() : "";
      if (keywordFromQuery) {
        state.keyword = keywordFromQuery;
      }
      void loadTypeTree();
      void loadDocuments();
    });

    onBeforeUnmount(() => {
      restoreLayoutContentScroll();
    });

    const renderHeaderActions = (): JSX.Element => (
      <div class={styles.headerActions}>
        <Button
          type="primary"
          class={styles.headerPrimaryBtn}
          disabled={!hasBatchSelection.value || batchSegmentRunning.value}
          onClick={() => {
            void runBatchSegmentation();
          }}
        >
          <img class={styles.headerActionImg} src="/resource/v1/ai-application/batchSegmented.png" alt="" aria-hidden />
          <span class={styles.headerPrimaryBtnLabel}>批量分段处理</span>
        </Button>
        <Button
          type="primary"
          class={[styles.headerPrimaryBtn, styles.headerPrimaryBtnRecall]}
          disabled={!hasSelectedDocument.value}
          onClick={handleTopRetrievalTest}
        >
          <img class={styles.headerActionImg} src="/resource/v1/ai-application/retrievalTest.png" alt="" aria-hidden />
          <span class={[styles.headerPrimaryBtnLabel, styles.headerPrimaryBtnLabelRecall]}>召回测试</span>
        </Button>
      </div>
    );

    const renderFilterRow = (): JSX.Element => (
      <div class={styles.filterRow}>
        <div class={styles.filterGroup}>
          <div class={styles.filterField}>
            <span class={styles.filterLabel}>文件状态:</span>
            <Select
              class={styles.statusSelect}
              placeholder="请选择"
              allowClear
              value={state.status === STATUS_ALL ? undefined : state.status}
              options={STATUS_OPTIONS}
              onUpdate:value={(value: string | undefined) => {
                state.status = value ?? STATUS_ALL;
              }}
            />
          </div>
          <div class={styles.filterField}>
            <Input
              class={styles.keywordInput}
              value={state.keyword}
              placeholder="搜索"
              showCount={false}
              allowClear={false}
              maxlength={200}
              suffix={<SearchOutlined class={styles.searchIcon} />}
              onPressEnter={handleSearch}
              onUpdate:value={(value: string) => {
                state.keyword = value ?? "";
              }}
            />
          </div>
          <div class={styles.filterActions}>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </div>
        </div>
      </div>
    );

    const renderTable = (): JSX.Element => (
      <div class={styles.tableSection}>
        <Spin spinning={loading.value}>
          <table class={styles.table}>
            <thead>
              <tr>
                <th class={styles.checkboxColumn}>
                  <Checkbox
                    checked={allRowsSelected.value}
                    onUpdate:checked={(checked: boolean) => {
                      toggleSelectAll(checked);
                    }}
                  />
                </th>
                <th class={styles.nameColumn}>文件名称</th>
                <th class={styles.statusColumn}>状态</th>
                <th class={styles.sizeColumn}>大小</th>
                <th class={styles.timeColumn}>最近更新时间</th>
                <th class={styles.actionColumn}>操作</th>
              </tr>
            </thead>
            <tbody>
              {documents.value.length === 0 && (
                <tr class={styles.emptyRow}>
                  <td colspan={6}>
                    <div class={styles.empty}>暂无知识文档</div>
                  </td>
                </tr>
              )}
              {documents.value.map((document, index) => {
                const documentStatus = getStatusTagLabel(document.status);
                const documentId = document.id ?? "";
                const switching = documentId ? switchingDocumentIds.value.includes(documentId) : false;

                return (
                  <tr
                    key={document.id ?? document.name ?? String(index)}
                    class={selectedDocumentId.value === documentId ? styles.selectedRow : undefined}
                    onClick={() => {
                      selectedDocumentId.value = documentId;
                    }}
                  >
                    <td
                      class={styles.checkboxCell}
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();
                      }}
                    >
                      {documentId && (
                        <Checkbox
                          checked={selectedRowKeys.value.includes(documentId)}
                          onUpdate:checked={(checked: boolean) => {
                            toggleRowSelected(documentId, checked);
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <div class={styles.primaryText}>{document.name || "--"}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        class={[styles.statusToggle, documentStatus === "启用" ? styles.statusEnabled : styles.statusDisabled]}
                        disabled={switching}
                        onClick={(event: MouseEvent) => {
                          event.stopPropagation();
                          void handleDocumentStatusSwitch(!getStatusSwitchValue(document.status), document);
                        }}
                      >
                        {switching ? "处理中" : documentStatus}
                      </button>
                    </td>
                    <td>{formatBytes(document.size)}</td>
                    <td>{formatDateTime(document.updateTime)}</td>
                    <td>
                      <div
                        class={styles.actions}
                        onClick={(event: MouseEvent) => {
                          event.stopPropagation();
                        }}
                      >
                        <button
                          type="button"
                          class={styles.actionLink}
                          onClick={() => {
                            goSegmentation(document);
                          }}
                        >
                          设置分段
                        </button>
                        <span class={styles.actionDivider}>|</span>
                        <button
                          type="button"
                          class={styles.actionLink}
                          onClick={() => {
                            goRetrievalTest(document);
                          }}
                        >
                          召回测试
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Spin>
      </div>
    );

    const renderPagination = (): JSX.Element => (
      <div class={styles.paginationRow}>
        <div class={styles.paginationGroup}>
          <span class={styles.totalText}>
            共{displayedTotal.value}条数据，第{state.pageNumber}/{totalPages.value}页
          </span>
          <Pagination
            current={state.pageNumber}
            pageSize={state.pageSize}
            total={displayedTotal.value}
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={() => ""}
            hideOnSinglePage={false}
            onChange={handlePageChange}
          />
        </div>
        <div class={styles.quickJumper}>
          <span>跳至</span>
          <Input
            class={styles.quickJumperInput}
            value={state.jumpPage}
            showCount={false}
            allowClear={false}
            maxlength={6}
            onPressEnter={handleJumpPage}
            onBlur={handleJumpPage}
            onUpdate:value={(value: string) => {
              state.jumpPage = value ?? "";
            }}
          />
          <span>页</span>
        </div>
      </div>
    );

    const renderContent = (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.pageBody}>
          <aside class={styles.sidebar}>
            <div class={styles.sidebarSearchRow}>
              <Input
                class={styles.sidebarSearchInput}
                value={typeKeyword.value}
                placeholder="搜索"
                showCount={false}
                allowClear={false}
                maxlength={200}
                suffix={<SearchOutlined class={styles.searchIcon} />}
                onPressEnter={handleTypeKeywordSearch}
                onUpdate:value={(value: string) => {
                  typeKeyword.value = value ?? "";
                }}
              />
            </div>
            <div class={styles.sidebarTree}>
              <Spin spinning={typeTreeLoading.value}>
                {typeOptions.value.length > 0 ? (
                  <div class={styles.treeMenu}>{renderTypeMenu(typeOptions.value)}</div>
                ) : (
                  <div class={styles.sidebarEmpty}>暂无分类</div>
                )}
              </Spin>
            </div>
          </aside>

          <section class={styles.content}>
            <div class={styles.contentBody}>
              {renderFilterRow()}
              {renderTable()}
            </div>
            {renderPagination()}
          </section>
        </div>
      </div>
    );

    const renderBatchSegmentModal = (): JSX.Element => (
      <AntModal
        v-model:visible={batchSegmentModalVisible.value}
        title="批量分段处理"
        width={520}
        maskClosable={!batchSegmentRunning.value}
        closable={!batchSegmentRunning.value}
        footer={null}
        onCancel={() => {
          if (!batchSegmentRunning.value) {
            batchSegmentModalVisible.value = false;
          }
        }}
      >
        <div class={styles.batchSegmentModal}>
          <Progress percent={batchSegmentProgress.value} status={batchSegmentProgressStatus.value} />
          <div class={styles.batchSegmentStats}>
            <span>总数：{batchSegmentTotal.value}</span>
            <span>已完成：{batchSegmentFinished.value}</span>
            <span class={styles.batchSegmentSuccess}>成功：{batchSegmentSuccessCount.value}</span>
            <span class={styles.batchSegmentFailure}>失败：{batchSegmentFailureCount.value}</span>
          </div>
          {batchSegmentRunning.value && batchSegmentCurrentName.value && (
            <div class={styles.batchSegmentCurrent}>正在处理：{batchSegmentCurrentName.value}</div>
          )}
          {!batchSegmentRunning.value && batchSegmentFailures.value.length > 0 && (
            <div class={styles.batchSegmentFailureList}>
              <div class={styles.batchSegmentFailureTitle}>失败明细</div>
              {batchSegmentFailures.value.map((item) => (
                <div key={item.documentId} class={styles.batchSegmentFailureItem}>
                  <div class={styles.batchSegmentFailureName}>{item.documentName}</div>
                  <div class={styles.batchSegmentFailureReason}>{item.errorMessage}</div>
                </div>
              ))}
            </div>
          )}
          {!batchSegmentRunning.value && (
            <div class={styles.batchSegmentFooter}>
              <Button
                type="primary"
                onClick={() => {
                  batchSegmentModalVisible.value = false;
                }}
              >
                关闭
              </Button>
            </div>
          )}
        </div>
      </AntModal>
    );

    return (): JSX.Element => (
      <>
        <CubeLayout
          title="知识库"
          showFooter={false}
          v-slots={{
            "layout-header": renderHeaderActions,
            "layout-content": renderContent,
          }}
        />
        {renderBatchSegmentModal()}
      </>
    );
  },
});

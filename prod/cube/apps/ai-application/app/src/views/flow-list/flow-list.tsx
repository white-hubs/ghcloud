import { CubeLayout } from "@ghcloud/cube-app-design";
/** Page：cube-ui 封装，底层为 Ant Design Vue Pagination（与同应用分页列表一致） */
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import type { FlowSummaryItem } from "@ghcloud/cube-ai-application-service";
import { AntModal, Button, Form, FormItem, Input, Page, SearchOutlined, Spin, Textarea, message, type FormExpose } from "@ghcloud/cube-ui";

import { cubeAiApplicationService } from "@/api/service";

import styles from "./flow-list.module.less";

/** 描述列：与效果图一致展示完整文案，由 CSS 单行省略；无描述时显示 -- */
function describeCell(description: string | null | undefined): { label: string; titleAttr: string } {
  const raw = typeof description === "string" ? description.trim() : "";
  if (!raw) {
    return { label: "--", titleAttr: "" };
  }
  return { label: raw, titleAttr: raw };
}

export const FlowList = defineComponent({
  name: "FlowList",
  setup() {
    const router = useRouter();
    const creating = ref(false);
    const createModalVisible = ref(false);
    const createFlowFormRef = ref<FormExpose | null>(null);
    const createForm = reactive({
      name: "",
      description: "",
    });
    const loading = ref(false);
    const flows = ref<FlowSummaryItem[]>([]);
    const state = reactive({
      keyword: "",
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

    const loadFlows = async (): Promise<void> => {
      loading.value = true;
      try {
        let page = state.pageNumber;
        const kw = state.keyword.trim();
        const result = await cubeAiApplicationService.listFlowsPage({
          pageNumber: page,
          pageSize: state.pageSize,
          keyword: kw,
        });
        state.total = result.total ?? 0;
        const records = Array.isArray(result.records) ? result.records : [];
        const maxPage = Math.max(1, Math.ceil(state.total / state.pageSize) || 1);
        if (page > maxPage && maxPage >= 1) {
          page = maxPage;
          state.pageNumber = maxPage;
          const retry = await cubeAiApplicationService.listFlowsPage({
            pageNumber: page,
            pageSize: state.pageSize,
            keyword: kw,
          });
          flows.value = Array.isArray(retry.records) ? retry.records : [];
          state.total = retry.total ?? 0;
        } else {
          flows.value = records;
        }
        state.jumpPage = String(state.pageNumber);
      } finally {
        loading.value = false;
      }
    };

    const openCreateModal = (): void => {
      createForm.name = "";
      createForm.description = "";
      createModalVisible.value = true;
      void nextTick(() => {
        createFlowFormRef.value?.clearValidate?.();
      });
    };

    const submitCreateFlow = async (): Promise<void> => {
      try {
        await createFlowFormRef.value?.validate?.();
      } catch {
        return Promise.reject(new Error("validation"));
      }
      const name = createForm.name.trim();
      const description = createForm.description.trim();
      creating.value = true;
      try {
        const flow = await cubeAiApplicationService.createFlow({
          name,
          description,
          editorFlowJson: {
            schemaVersion: "ai-application-flow/v1",
            nodes: [],
            edges: [],
            metadata: {},
          },
        });
        createModalVisible.value = false;
        await router.push(`/flows/${flow.id}/editor`);
      } finally {
        creating.value = false;
      }
    };

    const handleSearch = (): void => {
      state.pageNumber = 1;
      void loadFlows();
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      state.pageNumber = pageNumber;
      state.pageSize = pageSize;
      state.jumpPage = String(pageNumber);
      void loadFlows();
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
      void loadFlows();
    };

    const editFlow = async (flowId: string): Promise<void> => {
      await router.push(`/flows/${flowId}/editor`);
    };

    const removeFlow = async (flowId: string): Promise<void> => {
      const before = flows.value.length;
      await cubeAiApplicationService.deleteFlow(flowId);
      message.success("流程已删除");
      if (before <= 1 && state.pageNumber > 1) {
        state.pageNumber -= 1;
      }
      await loadFlows();
    };

    onMounted(() => {
      void loadFlows();
    });

    const renderFilterRow = (): JSX.Element => (
      <div class={styles.filterRow}>
        <div class={styles.filterGroup}>
          <Input
            class={styles.keywordInput}
            value={state.keyword}
            placeholder="搜索工作流名称、描述"
            showCount={false}
            allowClear={false}
            maxlength={200}
            suffix={<SearchOutlined class={styles.searchIcon} />}
            onPressEnter={handleSearch}
            onUpdate:value={(value: string) => {
              state.keyword = value ?? "";
            }}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </div>
        <div class={styles.filterActions}>
          <Button class={styles.addFlowBtn} disabled={creating.value} onClick={openCreateModal}>
            {creating.value ? (
              <span class={styles.addFlowCreating}>创建中…</span>
            ) : (
              <>
                <span class={styles.addFlowIconWrap} aria-hidden>
                  <svg class={styles.addFlowIconSvg} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle class={styles.addFlowIconCircle} cx="7" cy="7" r="6" />
                    <path class={styles.addFlowIconCross} d="M7 4.25v5.5M4.25 7h5.5" />
                  </svg>
                </span>
                <span class={styles.addFlowLabel}>新建工作流</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );

    const renderTable = (): JSX.Element => (
      <div class={styles.tableSection}>
        <Spin spinning={loading.value}>
          <table class={styles.table}>
            <colgroup>
              <col class={styles.colName} />
              <col class={styles.colDesc} />
              <col class={styles.colAction} />
            </colgroup>
            <thead>
              <tr>
                <th class={styles.nameColumn}>
                  <span class={styles.thText}>工作流名称</span>
                </th>
                <th class={styles.descColumn}>
                  <span class={styles.thText}>工作流描述</span>
                </th>
                <th class={styles.actionColumn}>
                  <span class={styles.thText}>操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {flows.value.length === 0 && (
                <tr class={styles.emptyRow}>
                  <td colspan={3}>
                    <div class={styles.empty}>{loading.value ? "加载中…" : "暂无工作流，点击「新建工作流」开始创建。"}</div>
                  </td>
                </tr>
              )}
              {flows.value.map((item, index) => {
                const desc = describeCell(item.description);
                return (
                  <tr key={item.id ?? String(index)}>
                    <td class={styles.tdName} title={item.name}>
                      <span class={styles.cellText}>{item.name}</span>
                    </td>
                    <td class={styles.tdDesc} {...(desc.titleAttr ? { title: desc.titleAttr } : {})}>
                      <span class={styles.cellTextDesc}>{desc.label}</span>
                    </td>
                    <td class={styles.tdAction}>
                      <div class={styles.actions} onClick={(event: MouseEvent) => event.stopPropagation()}>
                        <button type="button" class={styles.actionLink} onClick={() => void editFlow(item.id)}>
                          编辑
                        </button>
                        <span class={styles.actionDivider}>|</span>
                        <button type="button" class={[styles.actionLink, styles.actionLinkDanger]} onClick={() => void removeFlow(item.id)}>
                          删除
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
        <div class={styles.totalText}>
          <span>共{displayedTotal.value}条数据</span>
          <span class={styles.pageMeta}>
            ，第{state.pageNumber}/{totalPages.value}页
          </span>
        </div>
        <Page
          current={state.pageNumber}
          pageSize={state.pageSize}
          showTotal={() => ""}
          total={displayedTotal.value}
          hideOnSinglePage={false}
          onPageChange={handlePageChange}
        />
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

    return () => (
      <CubeLayout
        title="工作流"
        showFooter={false}
        v-slots={{
          "layout-content": () => (
            <>
              <div class={styles.page}>
                <div class={styles.pageBody}>
                  <section class={styles.content}>
                    {renderFilterRow()}
                    {renderTable()}
                    {renderPagination()}
                  </section>
                </div>
              </div>
              <AntModal
                v-model:visible={createModalVisible.value}
                title="创建工作流"
                width={520}
                centered={true}
                wrapClassName={styles.createFlowModalWrap}
                getContainer={() => document.body}
                confirmLoading={creating.value}
                okText="确定"
                cancelText="取消"
                maskClosable={false}
                destroyOnClose={true}
                onOk={() => submitCreateFlow()}
                onCancel={() => {
                  createModalVisible.value = false;
                }}
              >
                <Form
                  ref={createFlowFormRef}
                  class={styles.createFlowForm}
                  model={createForm}
                  layout="horizontal"
                  labelCol={{ span: 5, offset: 0 }}
                  wrapperCol={{ span: 18 }}
                  rules={{
                    name: [{ required: true, message: "请输入工作流名称", whitespace: true }],
                    description: [{ required: true, message: "请输入工作流描述", whitespace: true }],
                  }}
                >
                  <FormItem label="工作流名称" name="name" required>
                    <Input
                      id="create-flow-name"
                      value={createForm.name}
                      placeholder="请输入"
                      showCount={false}
                      allowClear={false}
                      maxlength={200}
                      style={{ width: "100%", maxWidth: "100%" }}
                      onUpdate:value={(value: string) => {
                        createForm.name = value ?? "";
                      }}
                    />
                  </FormItem>
                  <FormItem label="工作流描述" name="description" required>
                    <Textarea
                      id="create-flow-desc"
                      value={createForm.description}
                      placeholder="请输入"
                      rows={4}
                      style={{ width: "100%", maxWidth: "100%" }}
                      onUpdate:value={(value: string) => {
                        createForm.description = value ?? "";
                      }}
                    />
                  </FormItem>
                </Form>
              </AntModal>
            </>
          ),
        }}
      />
    );
  },
});

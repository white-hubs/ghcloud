import { PlusOutlined, SettingOutlined, ToolOutlined } from "@ant-design/icons-vue";
import { Form, FormItem, Input, Modal, Space } from "ant-design-vue";
import { defineComponent } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, Tooltip } from "@ghcloud/cube-ui";

import { useProjectList } from "./composables/use-project-list";
import { type ConfigGroup, type ProjectRecord } from "./project.const";

import styles from "./project-list.module.less";

interface ProjectListQueryState {
  [key: string]: unknown;
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

const configEntryMeta = {
  business: {
    title: "业务配置",
    description: "维护可视化项目的业务入口、展示面板与设备数据关联关系。",
    items: ["业务菜单", "面板配置", "设备关联"],
  },
  model: {
    title: "模型配置",
    description: "配置渲染模型、场景视角、漫游路线及导览播放内容。",
    items: ["渲染设置", "引入模型", "视角配置", "漫游路线", "其他设置", "导览列表"],
  },
} as const;

const renderConfigTooltip = (group: keyof typeof configEntryMeta): JSX.Element => {
  const meta = configEntryMeta[group];
  return (
    <div class={[styles.configTooltip, group === "business" ? styles.configTooltipBusiness : styles.configTooltipModel]}>
      <div class={styles.configTooltipDescription}>{meta.description}</div>
      <div class={styles.configTooltipScope}>
        <div class={styles.configTooltipScopeLabel}>可配置内容</div>
        <div class={styles.configTooltipItems}>
          {meta.items.map((item) => (
            <span key={item}>
              <i aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 项目管理列表：CubeLayout + useCubeQueryState(URL) + useCubeForm + useCubeTable。
 */
export default defineComponent({
  name: "ProjectList",
  setup() {
    const queryState = useCubeQueryState<ProjectListQueryState>({
      storage: "url",
      initialState: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["keyword", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          const num = Number(raw);
          return Number.isFinite(num) && num > 0 ? num : field === "pageSize" ? 10 : 1;
        }
        return raw;
      },
    });

    const refreshTableRef = {
      current: null as null | (() => void),
    };

    const {
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
    } = useProjectList({
      onListChanged: () => {
        refreshTableRef.current?.();
      },
    });

    const openConfig = (record: ProjectRecord, group: ConfigGroup): void => {
      goConfig(record, group, {
        keyword: queryState.state.keyword,
        pageNumber: queryState.state.pageNumber,
        pageSize: queryState.state.pageSize,
      });
    };

    const handleConfigClick = (event: MouseEvent, record: ProjectRecord, group: ConfigGroup): void => {
      event.stopPropagation();
      openConfig(record, group);
    };

    const columns = [
      {
        title: "项目名称",
        dataIndex: "projectName",
        width: 420,
        align: "center" as const,
        ellipsis: true,
        customRender: ({ record }: { record: ProjectRecord }): JSX.Element => (
          <div class={styles.name}>
            <span class={styles.nameText}>{record.projectName || "--"}</span>
            <span class={styles.nameId}>{record.id}</span>
          </div>
        ),
      },
      // {
      //   title: '画布比例',
      //   dataIndex: 'canvas',
      //   width: 100,
      //   align: 'center' as const,
      //   customRender: ({ text }: { text: string; }): JSX.Element => (
      //     <Tag color='processing'>{text || '16:9'}</Tag>
      //   ),
      // },
      {
        title: "配置入口",
        dataIndex: "config",
        width: 320,
        align: "center" as const,
        customRender: ({ record }: { record: ProjectRecord }): JSX.Element => (
          <div class={styles.config}>
            <Tooltip
              placement="top"
              mouseEnterDelay={0.55}
              mouseLeaveDelay={0.05}
              color="#fff"
              overlayClassName={styles.configTooltipOverlay}
              title={renderConfigTooltip("business")}
            >
              <button
                type="button"
                aria-label="进入业务配置：业务菜单、面板配置、设备关联"
                class={[styles.configEntry, styles.configEntryBusiness]}
                onClick={(event) => handleConfigClick(event, record, "business")}
              >
                <SettingOutlined class={styles.configEntryIcon} aria-hidden="true" />
                <span>业务配置</span>
              </button>
            </Tooltip>
            <Tooltip
              placement="top"
              mouseEnterDelay={0.55}
              mouseLeaveDelay={0.05}
              color="#fff"
              overlayClassName={styles.configTooltipOverlay}
              title={renderConfigTooltip("model")}
            >
              <button
                type="button"
                aria-label="进入模型配置：渲染设置、模型、视角、漫游和导览"
                class={[styles.configEntry, styles.configEntryModel]}
                onClick={(event) => handleConfigClick(event, record, "model")}
              >
                <ToolOutlined class={styles.configEntryIcon} aria-hidden="true" />
                <span>模型配置</span>
              </button>
            </Tooltip>
          </div>
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 280,
        align: "left" as const,
        fixed: "right" as const,
        customRender: ({ record }: { record: ProjectRecord }): JSX.Element => (
          <Space size={0} class={styles.actions}>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => openCopy(record)}>
              复制
            </Button>
            <Button type="link" size="small" onClick={() => void handleCopyLink(record)}>
              获取链接
            </Button>
            <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const filterProjects = (): ProjectRecord[] => {
      const q = String(queryState.state.keyword ?? "")
        .trim()
        .toLowerCase();
      if (!q) {
        return allProjects.value;
      }
      return allProjects.value.filter((item) => (item.projectName ?? "").toLowerCase().includes(q));
    };

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      tableCode: "VISUALIZATION_PROJECT_LIST",
      fetchApi: async () => {
        if (allProjects.value.length === 0) {
          await loadData();
        }
        const filtered = filterProjects();
        const { pageNumber, pageSize } = queryState.state;
        const start = (pageNumber - 1) * pageSize;
        const records = filtered.slice(start, start + pageSize);
        return {
          records,
          total: filtered.length,
          pages: Math.max(1, Math.ceil(filtered.length / pageSize) || 1),
        };
      },
      fetchLoaded: (data) => {
        queryState.update({ total: data.total });
      },
    });

    refreshTableRef.current = () => {
      tableApi.query();
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };

    const [CubeForm] = useCubeForm({
      queryState: queryState as never,
      queryStateFields: ["keyword"],
      onHydratedQuery: () => {
        tableApi.query();
      },
      layout: "horizontal",
      schema: [
        {
          component: "Input",
          label: "项目名称",
          fieldName: "keyword",
          componentProps: {
            placeholder: "请输入项目名称",
            allowClear: true,
          },
        },
      ],
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={openCreate}>
          <PlusOutlined />
          新增项目
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-btn": (): JSX.Element => <span class={styles.total}>共 {queryState.state.total} 条</span>,
      "footer-page": (): JSX.Element => (
        <Page
          current={queryState.state.pageNumber}
          pageSize={queryState.state.pageSize}
          total={queryState.state.total}
          showTotal={() => ""}
          onPageChange={handlePageChange}
        />
      ),
    };

    return () => (
      <div class={styles.root}>
        <CubeLayout title="项目管理" v-slots={slots} />

        <Modal
          open={formModal.open}
          title={formModal.mode === "create" ? "新增项目" : formModal.mode === "copy" ? "复制项目" : "编辑项目"}
          confirmLoading={formModal.submitting}
          destroyOnClose
          okText={formModal.mode === "copy" ? "复制" : "确定"}
          cancelText="取消"
          onOk={() => void submitForm()}
          onCancel={closeForm}
        >
          <Form layout="horizontal" labelCol={{ style: { width: "88px" } }} wrapperCol={{ style: { flex: 1 } }} class={styles.modalForm}>
            <FormItem label="项目名称" required>
              <Input
                value={formState.projectName}
                maxlength={20}
                showCount
                placeholder="请输入项目名称"
                onUpdate:value={(val: string) => {
                  formState.projectName = (val ?? "").replace(/\s+/g, "");
                }}
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  },
});

import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeTable } from "@ghcloud/cube-app-design";
import type { WorkPermitTypePageVO } from "@ghcloud/cube-service-interface/work-permit";
import {
  deleteWorkPermitType,
  exportWorkPermitTypes,
  listWorkPermitLevels,
  listWorkPermitTypes,
} from "@ghcloud/cube-services-client/work-permit.client";
import { Button, Input, Page, PopConfirm, PopOver, SearchOutlined, Select, message } from "@ghcloud/cube-ui";

import { downloadBlob } from "@/utils/download";
import { filterEmptyValues } from "@/utils/filter-empty-values";

import styles from "./work-permit-type-config.module.less";

interface PageState {
  pageNumber: number;
  pageSize: number;
  total: number;
}

interface SelectOption {
  label: string;
  value: string;
}

const levelClassMap: Record<string, string> = {
  LEVEL_ONE: styles.levelOne,
  LEVEL_TWO: styles.levelTwo,
  LEVEL_THREE: styles.levelThree,
  LEVEL_FOUR: styles.levelFour,
};

export const WorkPermitTypeConfig = defineComponent({
  name: "WorkPermitTypeConfig",
  setup: () => {
    const router = useRouter();
    const levelOptions = ref<SelectOption[]>([]);
    const query = reactive({
      typeName: "",
      workPermitLevel: undefined as string | undefined,
    });
    const page = reactive<PageState>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const exportLoading = ref(false);

    const getLevelName = (code?: string): string => code ?? "--";

    const loadLevels = async (): Promise<void> => {
      const levels = await listWorkPermitLevels();
      levelOptions.value = levels.map((level) => ({ label: level, value: level }));
    };

    const openForm = (type: "add" | "edit" | "detail", id?: string): void => {
      router.push({
        path: "/work-permit-type-form",
        query: filterEmptyValues({ type, id }),
      });
    };

    const handleDelete = async (id: string): Promise<void> => {
      await deleteWorkPermitType(id);
      message.success("操作成功");
      if (page.total > 1 && page.total - 1 <= (page.pageNumber - 1) * page.pageSize) {
        page.pageNumber = Math.max(1, page.pageNumber - 1);
      }
      await Promise.all([Promise.resolve(tableApi.query()), loadLevels()]);
    };

    const columns = [
      {
        title: "作业类型",
        dataIndex: "typeName",
        ellipsis: true,
        customRender: ({ text }: { text?: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        title: "作业等级",
        dataIndex: "workPermitLevel",
        width: 160,
        customRender: ({ text }: { text?: string }): JSX.Element => (
          <span class={[styles.levelTag, levelClassMap[text ?? ""]]}>{getLevelName(text)}</span>
        ),
      },
      {
        title: "等级定义",
        dataIndex: "levelDefinition",
        ellipsis: true,
        customRender: ({ text }: { text?: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        title: "作业检查",
        dataIndex: "riskCheckCount",
        width: 130,
        customRender: ({ text }: { text?: number }): string => `${text ?? 0} 项`,
      },
      {
        title: "作业验收",
        dataIndex: "acceptanceCount",
        width: 130,
        customRender: ({ text }: { text?: number }): string => `${text ?? 0} 项`,
      },
      {
        title: "作业票有效时长",
        dataIndex: "permitValidHours",
        width: 160,
        customRender: ({ text }: { text?: number }): string => `${text ?? 0} 小时`,
      },
      {
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        width: 190,
        customRender: ({ record }: { record: WorkPermitTypePageVO }): JSX.Element => (
          <>
            <Button type="link" size="small" onClick={() => openForm("detail", record.id)}>
              详情
            </Button>
            <Button type="link" size="small" onClick={() => openForm("edit", record.id)}>
              编辑
            </Button>
            <PopConfirm title="确认删除该作业类型？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "WORK_PERMIT_TYPE_CONFIG",
      rowKey: "id",
      fetchApi: async () =>
        listWorkPermitTypes(
          filterEmptyValues({
            pageNumber: page.pageNumber,
            pageSize: page.pageSize,
            typeName: query.typeName,
            workPermitLevel: query.workPermitLevel,
          }),
        ),
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const search = (): void => {
      page.pageNumber = 1;
      tableApi.query();
    };

    const reset = (): void => {
      query.typeName = "";
      query.workPermitLevel = undefined;
      search();
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const handleExport = async (): Promise<void> => {
      exportLoading.value = true;
      try {
        const blob = await exportWorkPermitTypes(
          filterEmptyValues({
            typeName: query.typeName,
            workPermitLevel: query.workPermitLevel,
          }),
        );
        downloadBlob(blob, "作业类型配置.xlsx");
      } finally {
        exportLoading.value = false;
      }
    };

    onMounted(async () => {
      await loadLevels();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <div class={styles.headerActions}>
          <Button type="primary" onClick={() => openForm("add")}>
            新增
          </Button>
          <Button onClick={handleExport} loading={exportLoading.value}>
            导出
          </Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <div class={styles.page}>
          <div class={styles.toolbar}>
            <div class={styles.filterItem}>
              <span class={styles.filterLabel}>作业类型名称：</span>
              <Input
                class={styles.keyword}
                v-model:value={query.typeName}
                placeholder="请输入作业类型名称"
                prefix={<SearchOutlined />}
                allowClear
                onPressEnter={search}
              />
            </div>
            <div class={styles.filterItem}>
              <span class={styles.filterLabel}>作业等级：</span>
              <Select
                class={styles.levelSelect}
                v-model:value={query.workPermitLevel}
                allowClear
                placeholder="全部等级"
                options={levelOptions.value}
                onChange={search}
              />
            </div>
            <Button type="primary" onClick={search}>
              查询
            </Button>
            <Button onClick={reset}>重置</Button>
          </div>
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handlePageChange} />
      ),
    };

    return (): JSX.Element => <CubeLayout title="作业类型配置" v-slots={slots} />;
  },
});

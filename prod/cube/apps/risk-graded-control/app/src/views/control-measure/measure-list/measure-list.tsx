import { defineComponent, ref } from "vue";

import { pageControlMeasures } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { Button, Form, FormItem, Input, Space, Table, Tag, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { RiskLevelTag } from "@/components/risk-level-tag/risk-level-tag";
import { LIST_SEARCH_INPUT_PROPS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { ControlMeasureVO, RiskLevel } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { downloadBlob } from "@/utils/download-blob";
import { mapMeasureFromApi, mapRiskLevelFromApi, optionDisplayName } from "@/utils/risk-control-mapper";
import { exportRiskXlsx } from "@/utils/risk-export";

const EXEC_STATUS = {
  PENDING: { label: "待执行", color: "default" },
  EXECUTING: { label: "执行中", color: "processing" },
  DONE: { label: "已执行", color: "success" },
  OVERDUE: { label: "超期", color: "error" },
} as const;

interface MeasureListRow extends ControlMeasureVO {
  unitName: string;
  objectName: string;
  riskLevel?: RiskLevel;
}

const TABLE_SCROLL_X = 1100;

export const MeasureListPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const records = ref<MeasureListRow[]>([]);
    const { pageNumber, pageSize, total, onPageChange: bindPageChange, scheduleInitialLoad, rewindIfEmpty } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageControlMeasures({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
          }),
        );
        records.value = page.records.map((vo) => ({
          ...mapMeasureFromApi(vo),
          unitName: optionDisplayName(vo.unit) || String(vo.unitName ?? "").trim(),
          objectName: vo.objectName ?? "",
          riskLevel: mapRiskLevelFromApi(vo.controlRiskLevel ?? vo.inherentRiskLevel),
        }));
        total.value = page.total ?? 0;
        await rewindIfEmpty(records.value.length, loadList);
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    scheduleInitialLoad(loadList);

    const exportData = async (): Promise<void> => {
      if (total.value === 0) {
        message.warning("当前没有可导出的数据");
        return;
      }
      try {
        const blob = await useAuthRequest(() =>
          exportRiskXlsx("control-measures", {
            keyword: keyword.value.trim() || undefined,
          }),
        );
        downloadBlob(blob, "管控措施清单.xlsx");
        message.success("导出成功");
      } catch (e) {
        showApiError(e);
      }
    };

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onReset = (): void => {
      keyword.value = "";
      pageNumber.value = 1;
      void loadList();
    };

    const onPageChange = bindPageChange(loadList);

    const columns = [
      { title: "风险单元", dataIndex: "unitName", width: 160, ellipsis: true },
      { title: "风险对象", dataIndex: "objectName", width: 160, ellipsis: true },
      {
        title: "风险等级",
        dataIndex: "riskLevel",
        width: 100,
        customRender: ({ text }: { text: RiskLevel | undefined }) => <RiskLevelTag level={text} />,
      },
      { title: "管控类型", dataIndex: "controlType", width: 110 },
      { title: "管控层级", dataIndex: "controlLevel", width: 100 },
      { title: "执行人", dataIndex: "executor", width: 100 },
      { title: "措施内容", dataIndex: "content", ellipsis: true },
      {
        title: "执行状态",
        dataIndex: "execStatus",
        width: 100,
        customRender: ({ text }: { text: ControlMeasureVO["execStatus"] }) => {
          const status = EXEC_STATUS[text];
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => (
            <Button type="primary" onClick={exportData}>
              导出清单
            </Button>
          ),
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem label="关键词">
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="对象/措施/执行人"
                    allowClear
                    style={{ width: 200 }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem>
                  <Space>
                    <Button type="primary" onClick={onSearch}>
                      查询
                    </Button>
                    <Button onClick={onReset}>重置</Button>
                  </Space>
                </FormItem>
              </Form>
              <div class="tableWrap">
                <Table
                  columns={columns}
                  dataSource={records.value}
                  rowKey="id"
                  pagination={false}
                  loading={loading.value}
                  scroll={{ x: TABLE_SCROLL_X }}
                  tableLayout="fixed"
                />
              </div>
            </>
          ),
          "footer-page": () => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});

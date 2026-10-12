import { defineComponent, onMounted, ref } from "vue";

import { deleteCommittee, pageCommittees } from "@ghcloud/cube-services-client/safety-personnel.client";
import { Button, Form, FormItem, Input, Table, PopConfirm, Empty, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { ChangeLogModal } from "./change-log-modal";
import { CommitteeFormDrawer } from "./committee-form-drawer";
import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import { TABLE_PAGE_SIZE } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useLayoutTableScroll } from "@/hooks/use-layout-table-scroll";
import type { CommitteeRowUI } from "@/types/ui";
import { showApiError } from "@/utils/api-error";
import { mapCommitteeRow } from "@/utils/mappers";
import { resolvePageNumberWhenCurrentEmpty } from "@/utils/pagination";

import styles from "./index.module.less";

const COMMITTEE_TABLE_SCROLL_X = 1052;

export const CommitteePage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const { scrollY, recalc } = useLayoutTableScroll();
    const records = ref<CommitteeRowUI[]>([]);
    const total = ref(0);
    const pageNumber = ref(1);
    const keyword = ref("");
    const formRef = ref<InstanceType<typeof CommitteeFormDrawer> | null>(null);
    const logRef = ref<InstanceType<typeof ChangeLogModal> | null>(null);

    const loadList = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() =>
          pageCommittees({
            pageNumber: pageNumber.value,
            pageSize: TABLE_PAGE_SIZE,
            keyword: keyword.value.trim() || undefined,
          }),
        );
        records.value = page.records.map(mapCommitteeRow);
        total.value = page.total ?? 0;
        const nextPage = resolvePageNumberWhenCurrentEmpty(pageNumber.value, records.value.length, total.value, TABLE_PAGE_SIZE);
        if (nextPage !== pageNumber.value) {
          pageNumber.value = nextPage;
          await loadList();
          return;
        }
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        setTimeout(() => recalc(), 50);
      }
    };

    onMounted(() => {
      void loadList();
      setTimeout(() => recalc(), 100);
    });

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    const onReset = (): void => {
      keyword.value = "";
      onSearch();
    };

    const onDelete = async (id: string): Promise<void> => {
      try {
        await useAuthRequest(() => deleteCommittee(id));
        message.success("已删除");
        void loadList();
      } catch (e) {
        showApiError(e, "删除失败");
      }
    };

    const columns = [
      {
        title: "序号",
        width: 72,
        align: "center" as const,
        customRender: ({ index }: { index: number }) => (pageNumber.value - 1) * TABLE_PAGE_SIZE + index + 1,
      },
      { title: "安委会名称", dataIndex: "committeeName", width: 180, ellipsis: true },
      {
        title: "负责单位/部门",
        dataIndex: "deptName",
        width: 140,
        ellipsis: true,
        customRender: ({ text }: { text?: string }) => text || "--",
      },
      { title: "联系电话", dataIndex: "contactPhone", width: 120, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "简介", dataIndex: "intro", width: 160, ellipsis: true, customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "成员",
        dataIndex: "memberCount",
        width: 80,
        align: "center" as const,
        customRender: ({ text }: { text: number }) => `${text}人`,
      },
      {
        title: "附件",
        dataIndex: "attachmentName",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text?: string }) => text || "--",
      },
      {
        title: "操作",
        width: 200,
        fixed: "right" as const,
        customRender: ({ record }: { record: CommitteeRowUI }) => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                logRef.value?.open(record.committeeId);
              }}
            >
              变更记录
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                formRef.value?.openEdit(record.committeeId);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确定删除该安委会？"
              onConfirm={() => {
                void onDelete(record.committeeId);
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    return (): JSX.Element => {
      const layoutSlots = {
        "layout-header": (): JSX.Element => (
          <Button
            type="primary"
            onClick={() => {
              formRef.value?.openCreate();
            }}
          >
            新增
          </Button>
        ),
        "layout-content": (): JSX.Element => (
          <>
            <Form layout="inline" class={styles.searchForm} data-layout-toolbar>
              <FormItem class={styles.searchItem}>
                <Input
                  placeholder="安委会名称"
                  style={{ width: "200px" }}
                  showCount={false}
                  allowClear
                  value={keyword.value}
                  onUpdate:value={(v: string) => {
                    keyword.value = v;
                  }}
                  onPressEnter={onSearch}
                />
              </FormItem>
              <FormItem class={styles.searchItem}>
                <Button type="primary" onClick={onSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={onReset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <div class="tableWrap">
              <Table
                class={`safety-personnel-management-table ${styles.committeeTable}`}
                rowKey="committeeId"
                columns={columns}
                dataSource={records.value}
                scroll={{ x: COMMITTEE_TABLE_SCROLL_X, y: scrollY.value }}
                tableLayout="fixed"
                pagination={false}
                locale={{ emptyText: <Empty description="暂无数据" /> }}
              />
            </div>
          </>
        ),
        "footer-page": (): JSX.Element => (
          <GPagination
            total={total.value}
            current={pageNumber.value}
            pageSize={TABLE_PAGE_SIZE}
            onChange={(p) => {
              pageNumber.value = p;
              void loadList();
            }}
          />
        ),
      };

      return (
        <div class="page-route">
          <PageShell title={pageTitle} v-slots={layoutSlots} />
          <CommitteeFormDrawer
            ref={formRef}
            onSaved={() => {
              void loadList();
            }}
          />
          <ChangeLogModal ref={logRef} />
        </div>
      );
    };
  },
});

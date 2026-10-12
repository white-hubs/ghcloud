import { PlusOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { defineComponent, nextTick, reactive, shallowRef, type PropType, watch } from "vue";

import { useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Input, Modal, Page, PopConfirm } from "@ghcloud/cube-ui";

import type { MemoNote } from "./types";

interface MemoPageResult {
  total: number;
  pages: number;
  records: MemoNote[];
}

const formatTime = (timestamp: number): string => (timestamp ? dayjs(timestamp).format("YYYY/MM/DD HH:mm") : "--");

export default defineComponent({
  name: "MemoManagerModal",
  props: {
    visible: { type: Boolean, default: false },
    refreshKey: { type: Number, default: 0 },
    deletingId: { type: String, default: null },
    fetchPage: {
      type: Function as PropType<(query: { pageNumber: number; pageSize: number; keyword?: string }) => Promise<MemoPageResult>>,
      required: true,
    },
  },
  emits: ["cancel", "create", "edit", "delete"],
  setup(props, { emit }) {
    const pagination = reactive({ pageNumber: 1, pageSize: 10, total: 0 });
    const keyword = shallowRef("");
    const [CubeTable, tableApi] = useCubeTable({
      autoFetch: false,
      pagination: false,
      rowKey: "id",
      columns: [
        { title: "标题", dataIndex: "title", width: 160 },
        {
          title: "内容",
          dataIndex: "content",
          customRender: ({ text }: { text: string }) => <div class="memo-manager__content-cell">{text}</div>,
        },
        { title: "更新时间", dataIndex: "updatedAt", width: 180, customRender: ({ text }: { text: number }) => formatTime(text) },
        {
          title: "操作",
          dataIndex: "actions",
          width: 150,
          customRender: ({ record }: { record: MemoNote }) => (
            <div class="memo-manager__actions">
              <Button type="link" disabled={Boolean(props.deletingId)} onClick={() => emit("edit", record)}>
                编辑
              </Button>
              <PopConfirm title="确定删除这条备忘录吗？" okText="删除" cancelText="取消" onConfirm={() => emit("delete", record.id)}>
                <Button
                  danger
                  type="link"
                  loading={props.deletingId === record.id}
                  disabled={Boolean(props.deletingId) && props.deletingId !== record.id}
                >
                  删除
                </Button>
              </PopConfirm>
            </div>
          ),
        },
      ],
      fetchApi: async () => props.fetchPage({ ...pagination, keyword: keyword.value.trim() || undefined }),
      fetchLoaded: (page) => {
        pagination.total = page.total;
      },
    });
    const queryTable = (): void => tableApi.query();
    const search = (): void => {
      pagination.pageNumber = 1;
      queryTable();
    };
    const resetSearch = (): void => {
      keyword.value = "";
      pagination.pageNumber = 1;
      queryTable();
    };

    watch(
      () => [props.visible, props.refreshKey],
      ([visible]) => {
        if (!visible) return;
        void nextTick(queryTable);
      },
    );

    return (): JSX.Element => (
      <Modal visible={props.visible} title="全部备忘录" width="860px" footer={null as never} onCancel={() => emit("cancel")}>
        <div class="memo-manager">
          <div class="memo-manager__toolbar">
            <div class="memo-manager__search">
              <span class="memo-manager__search-label">关键词：</span>
              <Input
                class="memo-manager__search-input"
                value={keyword.value}
                allowClear
                placeholder="请输入标题或内容"
                onUpdate:value={(value: string) => (keyword.value = value)}
                onPressEnter={search}
              />
              <Button type="primary" onClick={search}>
                查询
              </Button>
              <Button onClick={resetSearch}>重置</Button>
            </div>
            <Button type="primary" onClick={() => emit("create")}>
              <PlusOutlined /> 新增备忘录
            </Button>
          </div>
          <div class="memo-manager__table">
            <CubeTable />
          </div>
          <div class="memo-manager__pagination">
            <Page
              current={pagination.pageNumber}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger={false}
              hideOnSinglePage={false}
              syncToUrl={false}
              disabled={tableApi.loading.value}
              onPageChange={(pageNumber: number, pageSize: number) => {
                pagination.pageNumber = pageNumber;
                pagination.pageSize = pageSize;
                tableApi.query();
              }}
            />
          </div>
        </div>
      </Modal>
    );
  },
});

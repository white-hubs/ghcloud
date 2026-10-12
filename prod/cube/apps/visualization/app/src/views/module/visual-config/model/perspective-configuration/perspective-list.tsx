import { defineComponent, onMounted, onUnmounted, shallowRef, type PropType } from "vue";

import { Button, Form, FormItem, Input, Page, PopConfirm, Space, Table } from "@ghcloud/cube-ui";

import type { PerspectiveAssociationSource } from "./perspective-association";

import styles from "./perspective-configuration.module.less";

const SMALL_TABLE_HEADER_HEIGHT = 40;
const MIN_TABLE_BODY_HEIGHT = 120;

export interface PerspectiveViewRow {
  key: string;
  scope: "park" | "area" | "unresolved";
  sourceIndex: number;
  id: string;
  areaId: string;
  area: string;
  label: string;
  camera: string;
  buildTagLocation?: string;
  hideActors?: string[];
  associationSource?: PerspectiveAssociationSource;
}

export const PerspectiveList = defineComponent({
  name: "PerspectiveList",
  props: {
    rows: {
      type: Array as PropType<PerspectiveViewRow[]>,
      default: () => [],
    },
    keywordInput: {
      type: String,
      default: "",
    },
    current: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  emits: ["keywordChange", "query", "reset", "edit", "rebind", "remove", "pageChange"],
  setup(props, { emit }) {
    const tableWrapRef = shallowRef<HTMLElement>();
    const tableScrollY = shallowRef(MIN_TABLE_BODY_HEIGHT);
    let tableResizeObserver: ResizeObserver | undefined;

    const updateTableScrollY = (): void => {
      const containerHeight = tableWrapRef.value?.clientHeight ?? 0;
      if (containerHeight <= 0) {
        return;
      }
      tableScrollY.value = Math.max(Math.floor(containerHeight - SMALL_TABLE_HEADER_HEIGHT), MIN_TABLE_BODY_HEIGHT);
    };

    const columns = [
      { title: "区域", dataIndex: "area", key: "area", width: 180, ellipsis: true },
      // {
      //   title: "关联状态",
      //   key: "associationSource",
      //   width: 130,
      //   customRender: ({ record }: { record: PerspectiveViewRow }) => {
      //     const labels: Partial<Record<PerspectiveAssociationSource, string>> = {
      //       "area-id": "已按区域ID关联",
      //       "legacy-id": "历史ID待升级",
      //       "exact-name": "历史名称待升级",
      //       ambiguous: "名称存在歧义",
      //       unresolved: "待重新绑定",
      //     };
      //     const status = record.associationSource ? labels[record.associationSource] : undefined;
      //     return <span class={record.scope === "unresolved" ? styles.associationWarning : styles.associationText}>{status ?? "--"}</span>;
      //   },
      // },
      { title: "视角名称", dataIndex: "label", key: "label", width: 180, ellipsis: true },
      { title: "视角参数", dataIndex: "camera", key: "camera", ellipsis: true },
      {
        title: "操作",
        key: "action",
        width: 180,
        fixed: "right",
        customRender: ({ record }: { record: PerspectiveViewRow }) => (
          <Space size={0}>
            {record.scope === "unresolved" ? (
              <Button type="link" size="small" onClick={() => emit("rebind", record)}>
                重新绑定
              </Button>
            ) : (
              <Button type="link" size="small" onClick={() => emit("edit", record)}>
                编辑
              </Button>
            )}
            <PopConfirm title="确定删除该视角吗？" onConfirm={() => emit("remove", record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    onMounted(() => {
      if (!tableWrapRef.value) {
        return;
      }
      tableResizeObserver = new ResizeObserver(updateTableScrollY);
      tableResizeObserver.observe(tableWrapRef.value);
      updateTableScrollY();
    });

    onUnmounted(() => {
      tableResizeObserver?.disconnect();
    });

    return () => (
      <section class={styles.listPane}>
        <div class={styles.listToolbar}>
          <Form layout="inline" class={styles.filterForm}>
            <FormItem label="视角名称">
              <Input
                value={props.keywordInput}
                maxlength={50}
                allowClear
                placeholder="请输入视角名称"
                class={styles.keywordInput}
                onUpdate:value={(value: string) => emit("keywordChange", value ?? "")}
                onPressEnter={() => emit("query")}
              />
            </FormItem>
            <FormItem>
              <Space size={8}>
                <Button type="primary" onClick={() => emit("query")}>
                  查询
                </Button>
                <Button onClick={() => emit("reset")}>重置</Button>
              </Space>
            </FormItem>
          </Form>
        </div>

        <div ref={tableWrapRef} class={styles.tableWrap}>
          <Table
            columns={columns}
            dataSource={props.rows}
            pagination={false}
            rowKey={(row: PerspectiveViewRow) => row.key}
            scrollY={tableScrollY.value}
            size="middle"
          />
        </div>

        <div class={styles.pagination}>
          <Page
            current={props.current}
            pageSize={props.pageSize}
            total={props.total}
            syncQuery={false}
            onPageChange={(pageNumber: number, pageSize: number) => {
              emit("pageChange", pageNumber, pageSize);
            }}
            onShowSizeChange={(pageNumber: number, pageSize: number) => {
              emit("pageChange", pageNumber, pageSize);
            }}
          />
        </div>
      </section>
    );
  },
});

export default PerspectiveList;

import { EventModal } from "./event-table-tsx/event-modal";
import styles from "./event-table.module.less";
import { cubeDeviceCenterService } from "@/api/service";
import { getTriggerTypeLabel } from "@/constants/trigger-type";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import { Button, PopOver, message, PopConfirm } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";
import { defineComponent, h, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

interface Props {
  id: string;
}

interface EventConfig {
  triggerType?: unknown;
  rules?: {
    op?: string;
  };
}

const getSafeTriggerTypeLabel = (eventConfig?: EventConfig): string => {
  const { triggerType } = eventConfig ?? {};
  if (typeof triggerType !== "string") {
    return "--";
  }
  return getTriggerTypeLabel(triggerType);
};

/** 产品事件列表（包含弹窗） */
export const EventTable = defineComponent({
  props: ["id"],
  setup: (props: Props) => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();
    const tableLoading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const conditionSource = ref<{ value: string; label: string }[]>([]);
    const eventModalRef = ref<{ openModal: (type: "add" | "edit" | "detail", record?: Record<string, string>) => void }>();

    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        message.loading("删除中");
        await cubeDeviceCenterService.delProductEvent(record.id);
        message.destroy();
        message.success("操作成功");
        getTableData();
      } catch {
        message.destroy();
        message.error("删除失败");
      }
    };

    /**
     * 查看事件详情
     */
    const showDetail = (record: Record<string, string>): void => {
      eventModalRef.value?.openModal("detail", record);
    };

    /**
     * 编辑事件
     */
    const editRow = (record: Record<string, string>): void => {
      eventModalRef.value?.openModal("edit", record);
    };

    const columns = [
      {
        title: "事件标识",
        dataIndex: "eventCode",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件分类",
        dataIndex: "categoryName",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "触发类型",
        dataIndex: "eventConfig",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: EventConfig }): JSX.Element => {
          const txt = getSafeTriggerTypeLabel(text);
          return h(PopOver, { content: txt }, txt);
        },
      },
      {
        title: "条件",
        dataIndex: "eventConfig",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: EventConfig }): JSX.Element => {
          const res = conditionSource.value.find((item) => item.value === text?.rules?.op)?.label;
          return <PopOver content={res || "--"}>{res || "--"}</PopOver>;
        },
      },
      {
        title: "是否启用",
        dataIndex: "statusName",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件描述",
        dataIndex: "remark",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 220,
        fixed: "right",
        customRender: ({ record }: { record: { id: string; eventConfig?: EventConfig } & Record<string, string> }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                showDetail(record);
              }}
            >
              查看
            </Button>
            {record.eventConfig?.triggerType !== "SETTING" && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record);
                }}
              >
                编辑
              </Button>
            )}
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                delRow(record);
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

    const getTableData = async (): Promise<void> => {
      try {
        tableLoading.value = true;
        await cubeDeviceCenterService.getProductEventList({ prodId: props.id });
        const [eventListRes, compareTypeRes] = await Promise.all([
          cubeDeviceCenterService.getProductEventList({ prodId: props.id }),
          cubeDeviceCenterService.getCompareType(),
        ]);

        const eventResult = (eventListRes as unknown as { records: unknown[] })?.records || eventListRes;
        if (Array.isArray(eventResult)) {
          dataSource.value = eventResult;
        }

        const compareResult = (compareTypeRes as unknown as { records: unknown[] })?.records || compareTypeRes;
        if (Array.isArray(compareResult)) {
          const compareItems = compareResult as { itemValue: string; itemLabel: string }[];
          conditionSource.value =
            compareItems?.map((item) => ({
              value: item.itemValue,
              label: item.itemLabel,
            })) ?? [];
        }
      } catch {
        // 静默失败
      } finally {
        tableLoading.value = false;
      }
    };

    /**
     * 新增事件
     */
    const handleAdd = (): void => {
      eventModalRef.value?.openModal("add");
    };

    /**
     * 弹窗操作完成后的回调
     */
    const handleModalEnter = (): void => {
      getTableData();
    };
    onMounted(() => {
      getTableData();
    });
    return (): JSX.Element => (
      <>
        <div class={styles["top-header"]} id="top-header">
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        </div>
        <AliasTable
          rowKey="id"
          columns={columns}
          loading={tableLoading.value}
          dataSource={dataSource.value}
          tableCode={`${tableCode}Event`}
          pagination={{
            total: dataSource.value.length,
            showTotal(total: string | number) {
              return `共 ${total} 条数据`;
            },
            showSizeChanger: true,
          }}
          scrollY={scrollY.value}
          applicationCode={__ENV__.applicationCode}
        />
        <EventModal ref={eventModalRef} productId={props.id} onEnter={handleModalEnter} />
      </>
    );
  },
});

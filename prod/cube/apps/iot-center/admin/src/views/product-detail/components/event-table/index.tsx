import { EventModal } from "./event-modal";
import { cubeDeviceIotCenterService } from "@/api/service";
import { getCompareTypeLabel } from "@/constants/compare-type";
import { getStatusLabel } from "@/constants/status";
import { getTriggerTypeLabel, TriggerType } from "@/constants/trigger-type";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import { useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopOver, PopConfirm, message } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

interface Props {
  id: string;
}

/** 产品事件表格 */
export const EventTable = defineComponent({
  props: ["id"],
  setup(props: Props) {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();
    const eventModalRef = ref<{ openModal: (type: "add" | "edit" | "detail", record?: unknown) => void }>();

    /**
     * 删除事件
     */
    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        message.loading("删除中");
        await cubeDeviceIotCenterService.deleteProductEvent(record.id);
        message.destroy();
        message.success("操作成功");
        tableApi.query();
      } catch {
        message.destroy();
        message.error("删除失败");
      }
    };

    /**
     * 表格列定义
     */
    const columns = [
      {
        title: "事件标识",
        dataIndex: "eventCode",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件分类",
        dataIndex: "eventCategoryName",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "触发类型",
        dataIndex: "config",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: { triggerType: string } }): JSX.Element => {
          const label = getTriggerTypeLabel(text.triggerType);
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        title: "条件",
        dataIndex: "config",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: { rules: { propCode: string; op: string; oprand: unknown[] } } }): JSX.Element => {
          const label = getCompareTypeLabel(text.rules?.op);
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        title: "是否启用",
        dataIndex: "status",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const label = getStatusLabel(text);
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        title: "事件描述",
        dataIndex: "remark",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 220,
        fixed: "right" as const,
        customRender: ({ record }: { record: { id: string; config: { triggerType: string } } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                eventModalRef.value?.openModal("detail", record);
              }}
            >
              查看
            </Button>
            {record.config.triggerType !== TriggerType.SETTING && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  eventModalRef.value?.openModal("edit", record);
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

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: `${tableCode}-event`,
      rowKey: "id",
      scrollY: scrollY.value,
      fetchApi: async () => {
        const eventList = await cubeDeviceIotCenterService.getProductEventList({ prodId: props.id });

        return {
          records: eventList || [],
          total: (eventList || []).length,
          pages: 1,
        };
      },
      fetchLoaded: () => {
        // 数据已加载
      },
    });

    // 监听 scrollY 变化，动态更新表格滚动高度
    watch(
      () => scrollY.value,
      (newVal) => {
        if (newVal > 0) {
          tableApi.setState({ scrollY: newVal });
        }
      },
      { immediate: true },
    );

    const handleAdd = (): void => {
      eventModalRef.value?.openModal("add");
    };

    onMounted(() => {
      tableApi.query();
    });

    return (): JSX.Element => (
      <div>
        <div id="top-header" style={{ marginBottom: "16px", marginRight: "16px", textAlign: "right" }}>
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        </div>
        <CubeTable />
        <EventModal productId={props.id} ref={eventModalRef} onEnter={() => tableApi.query()} />
      </div>
    );
  },
});

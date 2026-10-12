import { PropModal } from "./prop-modal";
import { cubeDeviceIotCenterService } from "@/api/service";
import { getDataTypeLabel } from "@/constants/data-type";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import { useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopOver, PopConfirm, message } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

interface Props {
  id: string;
}

/** 产品属性表格 */
export const AttributeTable = defineComponent({
  props: ["id"],
  setup(props: Props) {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();
    const propModalRef = ref<{ openModal: (type: "add" | "edit" | "detail", record?: { id: string }) => void }>();

    /**
     * 删除属性
     */
    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        message.loading("删除中");
        await cubeDeviceIotCenterService.deleteProductProp(record.id);
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
        title: "属性标识",
        dataIndex: "propCode",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "属性名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "数据类型",
        dataIndex: "dataType",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const label = getDataTypeLabel(text);
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        title: "读写类型",
        dataIndex: "dataWrite",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={text === 1 ? "读写" : "只读"}>{text === 1 ? "读写" : "只读"}</PopOver>
        ),
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 220,
        fixed: "right" as const,
        customRender: ({ record }: { record: { id: string } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                propModalRef.value?.openModal("detail", record);
              }}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                propModalRef.value?.openModal("edit", record);
              }}
            >
              编辑
            </Button>
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
      tableCode: `${tableCode}-attribute`,
      rowKey: "id",
      scrollY: scrollY.value,
      fetchApi: async () => {
        const res = await cubeDeviceIotCenterService.getProductPropList({ prodId: props.id });
        return {
          records: res || [],
          total: (res || []).length,
          pages: 1,
        };
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

    onMounted(() => {
      tableApi.query();
    });

    const handleAdd = (): void => {
      propModalRef.value?.openModal("add");
    };

    return (): JSX.Element => (
      <div>
        <div id="top-header" style={{ marginBottom: "16px", marginRight: "16px", textAlign: "right" }}>
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        </div>
        <CubeTable />
        <PropModal ref={propModalRef} productId={props.id} onEnter={() => tableApi.query()} />
      </div>
    );
  },
});

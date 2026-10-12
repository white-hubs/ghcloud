import { MethodModal } from "./method-modal";
import { cubeDeviceIotCenterService } from "@/api/service";
import { MethodType, getMethodTypeLabel } from "@/constants/method-type";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import { useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopOver, PopConfirm, message, Tag, Space } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

interface Props {
  id: string;
}

interface MethodRecord {
  id?: string;
  methodCode: string;
  name: string;
  methodType: MethodType;
  description: string;
  inputParamsCount: number;
  outputParamsCount: number;
  [key: string]: unknown;
}

/** 产品服务方法表格 */
export const MethodsTable = defineComponent({
  props: ["id"],
  setup(props: Props) {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();
    const methodModalRef = ref<{ openModal: (type: "add" | "edit" | "detail", record?: MethodRecord) => void }>();

    /**
     * 删除方法
     */
    const delRow = async (record: MethodRecord): Promise<void> => {
      if (!record.id) {
        message.error("删除失败：缺少方法 ID");
        return;
      }
      try {
        message.loading("删除中");
        await cubeDeviceIotCenterService.deleteProductMethod(record.id);
        message.destroy();
        message.success("删除成功");
        tableApi.query();
      } catch (error) {
        message.destroy();
        const err = error as { errorMessage?: string };
        message.error(err?.errorMessage ?? "删除失败");
      }
    };

    /**
     * 表格列定义
     */
    const columns = [
      {
        title: "方法标识",
        dataIndex: "methodCode",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "方法名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "执行方式",
        dataIndex: "callType",
        ellipsis: true,
        align: "center" as const,
        width: 120,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const callTypeLabel = getMethodTypeLabel(text);
          return <Tag color={text === MethodType.ASYNC ? "blue" : "default"}>{callTypeLabel}</Tag>;
        },
      },
      {
        title: "输入参数",
        dataIndex: "inputParamsCount",
        ellipsis: true,
        align: "center" as const,
        width: 120,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const count = text || 0;
          return (
            <Space>
              <span>{count} 个</span>
              {count > 0 && (
                <Tag color="green" size="small">
                  已配置
                </Tag>
              )}
            </Space>
          );
        },
      },
      {
        title: "输出参数",
        dataIndex: "outputParamsCount",
        ellipsis: true,
        align: "center" as const,
        width: 120,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const count = text || 0;
          return (
            <Space>
              <span>{count} 个</span>
              {count > 0 && (
                <Tag color="green" size="small">
                  已配置
                </Tag>
              )}
            </Space>
          );
        },
      },
      {
        title: "说明",
        dataIndex: "remark",
        ellipsis: true,
        align: "center" as const,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 220,
        fixed: "right" as const,
        customRender: ({ record }: { record: MethodRecord }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                methodModalRef.value?.openModal("detail", record);
              }}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                methodModalRef.value?.openModal("edit", record);
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
      tableCode: `${tableCode}-methods`,
      rowKey: "id",
      scrollY: scrollY.value,
      fetchApi: async () => {
        const res = await cubeDeviceIotCenterService.getProductMethodList({ prodId: props.id });
        const methods = Array.isArray(res) ? res : [];
        const records = methods.map((m: unknown) => {
          const method = m as Record<string, unknown>;
          const inputParams = (method.inputParams as { params?: unknown[] })?.params || [];
          const outputParams = (method.outputParams as { params?: unknown[] })?.params || [];
          return {
            ...method,
            inputParamsCount: inputParams.length,
            outputParamsCount: outputParams.length,
          };
        });
        return {
          records: records || [],
          total: records.length,
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
      methodModalRef.value?.openModal("add");
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
        <MethodModal productId={props.id} ref={methodModalRef} onEnter={() => tableApi.query()} />
      </div>
    );
  },
});

import styles from "./attribute-table.module.less";
import PropForm from "./prop-form.vue";
import { cubeDeviceCenterService } from "@/api/service";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import { logger } from "@/logger";
import { debounce } from "@/utils/tool";
import { Button, Modal, PopOver, Spin, type FormInstance, message, PopConfirm } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
interface Props {
  id: string;
}
interface EnumType {
  value: string | number | undefined;
  label: string | number | undefined;
}

interface CustomFormState {
  name?: string | number;
  propCode?: string | number;
  dataType?: string | number;
  unitId?: string | number;
  dataWrite?: string | number;
  precision?: string | number;
  min?: string | number;
  max?: string | number;
  boolStart?: string | number;
  boolEnd?: string | number;
  enumKey?: string | number;
  enumValue?: string | number;
  remark?: string | number;
  dataConfig?: string | undefined;
  enumList?: EnumType[];
  defaultValue?: string | number | boolean | EnumType[] | undefined;
}
/** 产品属性列表（包含弹窗） */
export const AttributeTable = defineComponent({
  props: ["id"],
  setup: (props: Props) => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();
    const tableLoading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const modalVisible = ref(false);
    const handleType = ref<"add" | "edit" | "detail">("add");
    const formRef = ref<FormInstance>();
    const recordState = ref<Record<string, string | number>>();
    const recordId = ref<string | number>();
    const spinning = ref<boolean>(false);
    const detailState = ref<Record<string, unknown>>({});
    const modalLoading = ref(false);

    // 组装提交数据
    const handleParameter = (customFormData: CustomFormState): EnumType[] | (string | number | undefined)[] => {
      const { dataType, min, max, boolStart, boolEnd, enumList } = customFormData;
      switch (dataType) {
        case "string":
          return [];
        case "int":
        case "float":
        case "long":
        case "double":
          return [min, max];
        case "boolean":
          return [
            { value: 0, label: boolStart },
            { value: 1, label: boolEnd },
          ];
        case "enum":
          const list = enumList?.filter((item) => item.value && item.label) ?? [];
          return list ?? [];
        default:
          return [];
      }
    };
    // 组装回显数据
    const handleDetailState = (customFormData: CustomFormState): CustomFormState => {
      const { dataType, dataConfig } = customFormData;
      type NameType = string | number | (string | number | { label: string; value: string })[];
      const rules = JSON.parse(dataConfig ?? "") as NameType;

      const result: CustomFormState = {};
      if (Array.isArray(rules)) {
        rules.forEach((item) => {
          if (item instanceof Object) {
            if (dataType === "boolean") {
              if (Number(item.value) === 0) {
                result.boolStart = item.label;
              }
              if (Number(item.value) === 1) {
                result.boolEnd = item.label;
              }
            }
          }
          if (dataType === "enum") {
            result.enumList = rules as EnumType[];
          }
          if (["string", "number"].includes(typeof item)) {
            if (["int", "long", "float", "double"].includes(dataType as string)) {
              result.min = rules[0] as string | number;
              result.max = rules[1] as string | number;
            }
          }
        });
      }
      return result;
    };

    const getDetailData = async (id: string): Promise<void> => {
      spinning.value = true;
      recordId.value = id;
      try {
        const res = await cubeDeviceCenterService.getProductPropDetail(id);
        if (res) {
          const detail = handleDetailState(res);
          detailState.value = { ...res, ...detail };
          spinning.value = false;
        }
      } catch {
        spinning.value = false;
      }
    };

    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        message.loading("删除中");
        await cubeDeviceCenterService.delProductProp(record.id);
        message.destroy();
        message.success("操作成功");
        getTableData();
      } catch {
        message.destroy();
        message.error("删除失败");
      }
    };

    // 查看
    const showDetail = (record: Record<string, string>): void => {
      handleType.value = "detail";
      modalVisible.value = true;
      recordState.value = record;
      getDetailData(record.id);
    };
    // 编辑
    const editRow = (record: Record<string, string>): void => {
      handleType.value = "edit";
      modalVisible.value = true;
      recordState.value = record;
      getDetailData(record.id);
    };

    const columns = [
      {
        title: "属性标识",
        dataIndex: "propCode",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "属性名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "数据类型",
        dataIndex: "dataTypeName",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "读写类型",
        dataIndex: "dataWrite",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={text === 1 ? "读写" : "只读"}>{text === 1 ? "读写" : "只读"}</PopOver>
        ),
      },
      {
        title: "创建时间",
        dataIndex: "createTimeFormat",
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
        customRender: ({ record }: { record: { id: string } }): JSX.Element => (
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
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record);
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

    const getTableData = async (): Promise<void> => {
      try {
        tableLoading.value = true;
        const res = await cubeDeviceCenterService.getProductPropList({ prodId: props.id });
        if (res) {
          dataSource.value = res;
        }
      } catch {
      } finally {
        tableLoading.value = false;
      }
    };

    const modelClose = (): void => {
      modalLoading.value = false;
      modalVisible.value = false;
    };
    const handleAdd = (): void => {
      handleType.value = "add";
      modalVisible.value = true;
      detailState.value = {};
    };

    const handleOk = debounce(async () => {
      try {
        const customFormData = await formRef.value?.validate();
        const { name, propCode, dataType, precision, unitId, dataWrite, remark, defaultValue } = customFormData as CustomFormState;
        const params = {
          prodId: props.id,
          name,
          propCode,
          dataType,
          unitId,
          dataWrite,
          remark,
          precision,
          dataConfig: JSON.stringify(handleParameter(customFormData as CustomFormState)),
          defaultValue: defaultValue ?? "",
        };
        try {
          if (handleType.value === "add") {
            await cubeDeviceCenterService.addProductProp(params);
            message.success("操作成功");
          }
          if (handleType.value === "edit" && recordId.value) {
            await cubeDeviceCenterService.updateProductProp({ id: recordId.value, ...params });
            message.success("操作成功");
          }
        } catch {
        } finally {
          modalLoading.value = false;
          modalVisible.value = false;
          getTableData();
        }
      } catch (error) {
        logger.error(error);
      }
    }, 500);
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
          tableCode={tableCode}
          pagination={{
            total: dataSource.value,
            showTotal(total: string | number) {
              return `共 ${total} 条数据`;
            },
            showSizeChanger: true,
          }}
          scrollY={scrollY.value}
          applicationCode={__ENV__.applicationCode}
        />
        <Modal
          visible={modalVisible.value}
          centered
          width="600px"
          title={(handleType.value === "add" ? "新增" : handleType.value === "detail" ? "查看" : "编辑") + "属性"}
          confirm-loading={modalLoading.value}
          destroy-on-close
          ok-button-props={{ style: { display: handleType.value === "detail" ? "none" : "inline" } }}
          onCancel={modelClose}
          onOk={handleOk}
          cancelText={handleType.value === "detail" ? "关闭" : "取消"}
        >
          <Spin spinning={spinning.value}>
            <div style="min-height: 400px;">
              <PropForm
                ref={formRef}
                formState={detailState.value}
                handleType={handleType.value}
                disabled={handleType.value === "detail"}
              />
            </div>
          </Spin>
        </Modal>
      </>
    );
  },
});

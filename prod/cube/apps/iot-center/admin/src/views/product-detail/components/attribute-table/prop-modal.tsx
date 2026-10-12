import { PropForm } from "./prop-form";
import { cubeDeviceIotCenterService } from "@/api/service";
import { DataType, NUMERIC_TYPES } from "@/constants/data-type";
import { useCubeModal } from "@ghcloud/cube-app-design";
import { Spin, message } from "@ghcloud/cube-ui";
import { debounce } from "lodash";
import { defineComponent, ref } from "vue";

interface Props {
  productId: string;
}

interface EditRecord {
  id: string;
  name: string;
  propCode: string;
  [key: string]: unknown;
}

type HandleType = "add" | "edit" | "detail";

const MODAL_WIDTH = "600px";
const MODAL_MIN_HEIGHT = "400px";
const DEBOUNCE_DELAY = 500;

const MODAL_TITLES: Record<HandleType, string> = {
  add: "新增属性",
  edit: "编辑属性",
  detail: "查看属性",
};

/** 属性新增/编辑弹窗 */
export const PropModal = defineComponent({
  props: ["productId"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const propFormRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void }>();
    const spinning = ref(false);
    const handleType = ref<HandleType>("add");
    const recordId = ref<string>();
    const detailState = ref<Record<string, unknown>>({});

    /**
     * 处理回显数据
     */
    const processDetailData = (res: Record<string, unknown>): Record<string, unknown> => {
      const result: Record<string, unknown> = { ...res };
      const dataType = res.dataType as string;
      const dataConfig = res.dataConfig as string | undefined;

      if (!dataConfig) {
        return result;
      }

      const dataConfigObj = JSON.parse(dataConfig) as unknown[];
      if (!Array.isArray(dataConfigObj)) {
        return result;
      }

      if (dataType === DataType.BOOLEAN) {
        dataConfigObj.forEach((item: unknown) => {
          const booleanItem = item as { value: string | number; label: string };
          if (Number(booleanItem.value) === 0) {
            result.boolStart = booleanItem.label;
          } else if (Number(booleanItem.value) === 1) {
            result.boolEnd = booleanItem.label;
          }
        });
      } else if (dataType === DataType.ENUM) {
        result.enumList = dataConfigObj;
      } else if (NUMERIC_TYPES.includes(dataType as (typeof NUMERIC_TYPES)[number])) {
        result.min = dataConfigObj[0];
        result.max = dataConfigObj[1];
      }

      return result;
    };

    /**
     * 加载属性详情
     */
    const loadPropDetail = async (id: string): Promise<void> => {
      spinning.value = true;
      recordId.value = id;
      try {
        const res = await cubeDeviceIotCenterService.getProductPropDetail(id);
        if (res) {
          detailState.value = processDetailData(res as Record<string, unknown>);
        }
      } catch (_ignore) {
        // 静默失败
      } finally {
        spinning.value = false;
      }
    };

    /**
     * 组装提交数据配置
     */
    const buildDataConfig = (formData: Record<string, unknown>): unknown[] => {
      const { dataType, min, max, boolStart, boolEnd, enumList } = formData;

      switch (dataType) {
        case DataType.STRING:
          return [];
        case DataType.INT:
        case DataType.FLOAT:
        case DataType.LONG:
        case DataType.DOUBLE:
          return [min, max];
        case DataType.BOOLEAN:
          return [
            { value: 0, label: boolStart },
            { value: 1, label: boolEnd },
          ];
        case DataType.ENUM: {
          const enumArray = enumList as { value: unknown; label: unknown }[] | undefined;
          return enumArray?.filter((item) => item.value && item.label) ?? [];
        }
        default:
          return [];
      }
    };

    /**
     * 构建提交参数
     */
    const buildSubmitParams = (formData: Record<string, unknown>) => ({
      prodId: props.productId,
      name: formData.name as string,
      propCode: formData.propCode as string,
      dataType: formData.dataType as string,
      unitSymbol: formData.unitSymbol as string,
      dataWrite: formData.dataWrite as number,
      remark: formData.remark as string,
      precision: formData.precision as number,
      dataConfig: JSON.stringify(buildDataConfig(formData)),
      defaultValue: (formData.defaultValue as string) ?? "",
    });

    /**
     * 提交表单
     */
    const onSubmit = debounce(async (): Promise<void> => {
      try {
        if (!props.productId) {
          message.error("产品ID不能为空");
          return;
        }
        const formData = await propFormRef.value?.validate();
        if (!formData) {
          return;
        }

        modalApi.setConfirmLoading(true);
        const params = buildSubmitParams(formData as Record<string, unknown>);

        if (handleType.value === "add") {
          await cubeDeviceIotCenterService.addProductProp(params);
        } else if (handleType.value === "edit" && recordId.value) {
          await cubeDeviceIotCenterService.updateProductProp({ id: recordId.value, ...params });
        }

        message.success("操作成功");
        modalApi.close();
        emit("enter");
      } catch (error) {
        const err = error as { errorMessage?: string };
        message.error(err?.errorMessage ?? "操作失败");
      } finally {
        modalApi.setConfirmLoading(false);
      }
    }, DEBOUNCE_DELAY);

    /**
     * 重置弹窗状态
     */
    const resetModalState = (): void => {
      propFormRef.value?.resetForm();
      detailState.value = {};
      recordId.value = undefined;
    };

    /**
     * 弹窗管理
     */
    const [CubeModal, modalApi] = useCubeModal({
      title: MODAL_TITLES.add,
      width: MODAL_WIDTH,
      onConfirm: onSubmit,
      onCancel: () => {
        resetModalState();
        modalApi.close();
        emit("cancel");
      },
    });

    /**
     * 打开弹窗
     */
    const openModal = (type: HandleType, record?: EditRecord): void => {
      handleType.value = type;
      modalApi.setState({ title: MODAL_TITLES[type] });
      modalApi.open();
      resetModalState();

      if ((type === "edit" || type === "detail") && record?.id) {
        loadPropDetail(record.id);
      }
    };

    expose({
      openModal,
    });

    return (): JSX.Element => (
      <CubeModal
        v-slots={{
          default: (): JSX.Element => (
            <Spin spinning={spinning.value}>
              <div style={{ minHeight: MODAL_MIN_HEIGHT }}>
                <PropForm
                  ref={propFormRef}
                  formState={detailState.value}
                  handleType={handleType.value}
                  disabled={handleType.value === "detail"}
                />
              </div>
            </Spin>
          ),
        }}
      />
    );
  },
});

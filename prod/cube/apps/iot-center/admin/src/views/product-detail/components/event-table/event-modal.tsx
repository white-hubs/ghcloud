import { EventForm } from "./event-form";
import { cubeDeviceIotCenterService } from "@/api/service";
import { TriggerType } from "@/constants/trigger-type";
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
  eventCode: string;
  [key: string]: unknown;
}

type HandleType = "add" | "edit" | "detail";

const MODAL_WIDTH = "1000px";
const MODAL_MIN_HEIGHT = "400px";
const DEBOUNCE_DELAY = 500;

const MODAL_TITLES: Record<HandleType, string> = {
  add: "新增事件",
  edit: "编辑事件",
  detail: "查看事件",
};

/** 事件新增/编辑弹窗 */
export const EventModal = defineComponent({
  props: ["productId"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const eventFormRef = ref<{ validate: () => Promise<unknown>; resetForm: () => void }>();
    const spinning = ref(false);
    const handleType = ref<HandleType>("add");
    const recordId = ref<string | undefined>();
    const detailState = ref<Record<string, string | number | [] | undefined>>({});

    /**
     * 加载事件详情
     */
    const loadEventDetail = async (id: string): Promise<void> => {
      spinning.value = true;
      recordId.value = id;
      try {
        const res = await cubeDeviceIotCenterService.getProductEventDetail(id);
        if (res) {
          detailState.value = res as Record<string, string | number | [] | undefined>;
        }
      } catch (_ignore) {
        // 静默失败
      } finally {
        spinning.value = false;
      }
    };

    /**
     * 组装提交数据
     */
    const buildSubmitParams = (formData: Record<string, unknown>): Record<string, unknown> => {
      const { name, eventCode, eventCategoryId, status, remark, triggerType, propCode, op, oprand, delayTime } = formData;
      let rules = {};
      if (triggerType === TriggerType.SIMPLE) {
        rules = {
          propCode,
          op,
          delayTime,
          oprand: oprand,
        };
      }

      return {
        prodId: props.productId,
        name: name as string | number | undefined,
        eventCode: eventCode as string | number | undefined,
        eventCategoryId: eventCategoryId as string | number | undefined,
        status: status as string | number | undefined,
        remark: remark as string | number | undefined,
        config: {
          triggerType: triggerType as string | number | undefined,
          eventRelatedProp: [],
          rules,
        },
      };
    };

    /**
     * 提交表单
     */
    const onSubmit = debounce(async (): Promise<void> => {
      try {
        const formData = await eventFormRef.value?.validate();
        if (!formData) {
          return;
        }

        modalApi.setConfirmLoading(true);
        const params = buildSubmitParams(formData as Record<string, unknown>);

        if (handleType.value === "add") {
          await cubeDeviceIotCenterService.addProductEvent(params);
          message.success("新增成功");
        } else if (handleType.value === "edit" && recordId.value) {
          await cubeDeviceIotCenterService.updateProductEvent({ id: recordId.value, ...params });
          message.success("编辑成功");
        }

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
      eventFormRef.value?.resetForm();
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
      modalApi.open();
      resetModalState();

      modalApi.setState({ title: MODAL_TITLES[type] });

      if ((type === "edit" || type === "detail") && record?.id) {
        loadEventDetail(record.id);
      }
    };

    expose({
      openModal,
    });

    /**
     * 渲染弹窗内容
     */
    const modalSlots = {
      default: (): JSX.Element => (
        <Spin spinning={spinning.value}>
          <div style={{ minHeight: MODAL_MIN_HEIGHT }}>
            <EventForm
              ref={eventFormRef}
              formState={detailState.value}
              handleType={handleType.value}
              disabled={handleType.value === "detail"}
            />
          </div>
        </Spin>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});

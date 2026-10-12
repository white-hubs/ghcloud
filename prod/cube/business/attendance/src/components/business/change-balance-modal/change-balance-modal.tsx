import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { computed, defineComponent, reactive, ref, type VNode } from "vue";

import { Form, FormItem, Modal, type FormExpose, DatePicker, Textarea, InputNumber, message } from "@ghcloud/cube-ui";

import { leaveBalanceUpdate } from "@/api/staff-leave";
import { logger } from "@/logger";

export const ChangeBalanceModal = defineComponent({
  emits: ["success"],
  setup: (props, { emit, expose }) => {
    const modalVisible = ref(false);
    const loading = ref(false);
    const formInstance = ref<FormExpose>();
    const formState = reactive({
      availableBalance: 0,
      deadline: "",
      remark: "",
      staffId: "",
      holidayRuleId: "",
    });
    const unit = ref("天");
    const balanceStep = computed(() => (unit.value === "小时" ? 0.1 : 0.5));
    const checkRemark = async (): Promise<void> => {
      if (!formState.remark) {
        return Promise.resolve();
      }

      if (!/^[\u4e00-\u9fa5\w\d]+$/.test(formState.remark)) {
        return Promise.reject(new Error("仅支持包含中英文字符及数字"));
      }
      return Promise.resolve();
    };
    const formRules = {
      availableBalance: [{ required: true, message: "请输入余额", trigger: "blur" }],
      remark: [{ validator: checkRemark }],
    };
    const disableDate = (current: Dayjs): boolean => {
      if (current && (current.isAfter(dayjs()) || current.startOf("day").isSame(dayjs().startOf("day")))) {
        return false;
      }
      return true;
    };

    const openModal = (res: { staffId: string; holidayRuleId: string; availableBalance: number }, outerUnit: "天" | "小时"): void => {
      formState.staffId = res.staffId;
      formState.holidayRuleId = res.holidayRuleId;
      formState.availableBalance = null as unknown as number;
      formState.deadline = "";
      formState.remark = "";
      modalVisible.value = true;
      unit.value = outerUnit;
    };

    /** 确定按钮回回调 */
    const ok = async (): Promise<void> => {
      if (loading.value) {
        return;
      }
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      try {
        loading.value = true;
        await leaveBalanceUpdate({ ...formState, unit: unit.value, incrementalUpdate: true });
        modalVisible.value = false;
        message.success("修改成功");
        emit("success");
      } catch (error) {
        logger.error(error);
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 1000);
      }
    };
    const cancel = (): void => {
      modalVisible.value = false;
    };

    expose({
      openModal,
    });

    return (): VNode => (
      <Modal
        visible={modalVisible.value}
        title="新增余额"
        width="500px"
        destroyOnClose
        onOk={ok}
        onCancel={cancel}
        confirmLoading={loading.value}
      >
        <Form ref={formInstance} model={formState} labelCol={{ style: { width: "120px" } }} rules={formRules}>
          <FormItem label={`余额新增(${unit.value})`} name="availableBalance">
            <InputNumber
              v-model:value={formState.availableBalance}
              min={0}
              max={999}
              precision={1}
              step={balanceStep.value}
              style="margin-right:5px"
            />
          </FormItem>
          <FormItem label="有效期" name="date">
            <DatePicker v-model:value={formState.deadline} disabledDate={disableDate} />
          </FormItem>
          <FormItem label="备注" name="remark">
            <Textarea v-model:value={formState.remark} maxlength={200} allowClear={false} />
          </FormItem>
        </Form>
      </Modal>
    );
  },
});

import { defineComponent, reactive } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { HazardMisreportReason } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardLedgerRecordVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { markHazardMisreport } from "@ghcloud/cube-services-client/hazard-governance.client";
import { Form, FormItem, Select, message } from "@ghcloud/cube-ui";

export interface MisreportHazardModalExpose {
  openModal: (record: HazardLedgerRecordVO) => void;
}

const misreportReasonOptions = [
  { label: "现场不存在隐患", value: HazardMisreportReason.NOT_HAZARD },
  { label: "重复上报", value: HazardMisreportReason.DUPLICATE_REPORT },
  { label: "风险对象错误", value: HazardMisreportReason.WRONG_OBJECT },
  { label: "测试数据", value: HazardMisreportReason.TEST_DATA },
  { label: "其他原因", value: HazardMisreportReason.OTHER },
];

export const MisreportHazardModal = defineComponent({
  name: "MisreportHazardModal",
  emits: ["misreported"],
  setup: (_, { emit, expose }) => {
    const currentRecord = reactive({
      hazardId: "" as string | number,
      id: "",
      title: "",
    });
    const misreportForm = reactive({
      reason: undefined as HazardMisreportReason | undefined,
    });

    const [MisreportModal, misreportModalApi] = useCubeModal({
      title: "标记误报",
      width: "480px",
      onConfirm: async () => {
        if (!misreportForm.reason) {
          message.error("请选择误报原因");
          return;
        }
        misreportModalApi.setConfirmLoading(true);
        try {
          await useAuthRequest(() =>
            markHazardMisreport({
              hazardId: currentRecord.hazardId,
              misreportReason: misreportForm.reason as HazardMisreportReason,
            }),
          );
          message.success("已标记为误报");
          emit("misreported");
          misreportModalApi.close();
        } catch (error) {
          console.error(error);
          message.error("标记误报失败，请稍后重试");
        } finally {
          misreportModalApi.setConfirmLoading(false);
        }
      },
      onCancel: () => misreportModalApi.close(),
    });

    const openModal = (record: HazardLedgerRecordVO): void => {
      currentRecord.hazardId = record.id;
      currentRecord.id = record.code || String(record.id);
      currentRecord.title = record.description || "";
      misreportForm.reason = undefined;
      misreportModalApi.open();
    };

    expose({ openModal });

    const modalSlots = {
      default: (): JSX.Element => (
        <Form layout="vertical" model={misreportForm}>
          <div class="hazard-misreport-info">
            隐患编号：{currentRecord.id} | 描述：{currentRecord.title}
          </div>
          <FormItem label="误报原因" required>
            <Select v-model:value={misreportForm.reason} placeholder="请选择误报原因" options={misreportReasonOptions} />
          </FormItem>
        </Form>
      ),
    };

    return () => <MisreportModal v-slots={modalSlots} />;
  },
});

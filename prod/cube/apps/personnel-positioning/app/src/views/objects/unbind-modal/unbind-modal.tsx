import { computed, defineComponent, ref } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Alert, Button, Descriptions, DescriptionsItem, Form, FormItem, Select, Space, message } from "@ghcloud/cube-ui";

import { UNBIND_REASONS, optionsOf } from "@/constants/positioning";
import type { PositioningPerson, UnbindReason } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";

import "./unbind-modal.less";

export function useUnbindModal(onChanged: () => void) {
  const store = usePositioningStore();
  const person = ref<PositioningPerson>();
  const reason = ref<UnbindReason>();
  const loading = ref(false);
  const current = computed(() => (person.value ? store.currentBinding(person.value.id) : undefined));
  const [CubeModal, modal] = useCubeModal({ title: "解绑终端", width: "560px", wrapperClass: "pp-unbind-modal" });

  async function submit(): Promise<void> {
    if (!person.value || loading.value) return;
    if (!reason.value) {
      message.warning("请选择解绑原因");
      return;
    }
    loading.value = true;
    try {
      await store.unbind(person.value.id, reason.value);
      message.success("终端已解绑，历史记录已保留");
      modal.close();
      onChanged();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "解绑失败，请重试");
    } finally {
      loading.value = false;
    }
  }

  const UnbindModal = defineComponent({
    name: "UnbindModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () => (
            <>
              <Descriptions column={2} size="small">
                <DescriptionsItem label="定位对象">{person.value?.name}</DescriptionsItem>
                <DescriptionsItem label="人员编号">{person.value?.personNumber || person.value?.id}</DescriptionsItem>
                <DescriptionsItem label="所属组织">{person.value?.organization}</DescriptionsItem>
                <DescriptionsItem label="当前终端">
                  {current.value?.terminalNumber || person.value?.deviceNumber || "未绑定"}
                </DescriptionsItem>
              </Descriptions>
              <Alert
                type="warning"
                showIcon
                message="确认解除该人员与当前终端的绑定？"
                description="解绑后不再获取该人员的实时位置。已有的绑定记录和历史轨迹仍可查询。"
              />
              <Form layout="vertical" class="pp-unbind-modal__form">
                <FormItem label="解绑原因" required>
                  <Select
                    aria-label="解绑原因"
                    v-model:value={reason.value}
                    placeholder="请选择解绑原因"
                    options={optionsOf(UNBIND_REASONS)}
                  />
                </FormItem>
              </Form>
            </>
          ),
          footer: () => (
            <Space>
              <Button disabled={loading.value} onClick={() => modal.close()}>
                取消
              </Button>
              <Button type="primary" danger loading={loading.value} disabled={!reason.value} onClick={() => void submit()}>
                确认解绑
              </Button>
            </Space>
          ),
        }}
      />
    ),
  });

  return {
    UnbindModal,
    open: (record: PositioningPerson) => {
      person.value = record;
      reason.value = undefined;
      modal.open();
      void store.refreshBindings(record.id).catch((error: unknown) => message.error((error as Error).message));
    },
  };
}

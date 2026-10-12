import { computed, defineComponent, ref } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Alert, Button, Descriptions, DescriptionsItem, Form, FormItem, Input, Select, Tag, message } from "@ghcloud/cube-ui";

import { DEVICE_TYPES, ONLINE_STATES, REPLACEMENT_REASONS, optionsOf } from "@/constants/positioning";
import type { PositioningDevice, PositioningPerson, ReplacementReason } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { containsKeyword } from "@/utils/positioning";
import { StaticTable, asCubeTableColumns } from "@/utils/table-columns";

import "./binding-modal.less";

export function useBindingModal(onChanged: () => void) {
  const store = usePositioningStore();
  const person = ref<PositioningPerson>();
  const selectedId = ref("");
  const replacementReason = ref<ReplacementReason>();
  const keyword = ref("");
  const loading = ref(false);
  const current = computed(() => (person.value ? store.currentBinding(person.value.id) : undefined));
  const isReplacement = computed(() => Boolean(current.value || person.value?.bound));
  const title = computed(() => (isReplacement.value ? "更换终端" : "绑定定位终端"));
  const occupied = (deviceId: string): boolean =>
    store.state.persons.some((item) => item.id !== person.value?.id && item.bound && item.positioningDeviceId === deviceId) ||
    store.state.bindings.some(
      (record) => record.terminalId === deviceId && record.endedAt === null && record.personId !== person.value?.id,
    );
  const available = (device: PositioningDevice): boolean => device.enabled && !occupied(device.id);
  const filtered = computed(() =>
    store.state.devices.filter(
      (device) =>
        device.kind === "terminal" &&
        containsKeyword(keyword.value, [device.deviceNumber || device.id, DEVICE_TYPES[device.type].label, device.productCategoryName]),
    ),
  );
  const [CubeModal, modal] = useCubeModal({ width: "850px", wrapperClass: "pp-binding-modal" });
  const columns = [
    { title: "终端编号", dataIndex: "deviceNumber", width: 145 },
    {
      title: "终端类型",
      dataIndex: "type",
      width: 130,
      customRender: ({ record }: { record: PositioningDevice }) => DEVICE_TYPES[record.type].label,
    },
    { title: "设备产品", dataIndex: "productCategoryName", width: 160, ellipsis: true },
    {
      title: "在线状态",
      dataIndex: "online",
      width: 100,
      customRender: ({ record }: { record: PositioningDevice }) => (
        <Tag color={ONLINE_STATES[record.online].color}>{ONLINE_STATES[record.online].label}</Tag>
      ),
    },
    {
      title: "电量",
      dataIndex: "battery",
      width: 80,
      customRender: ({ record }: { record: PositioningDevice }) => (record.battery === null ? "—" : `${record.battery}%`),
    },
    {
      title: "可用状态",
      dataIndex: "available",
      width: 100,
      customRender: ({ record }: { record: PositioningDevice }) => (
        <Tag color={available(record) ? "green" : "default"}>{!record.enabled ? "已停用" : occupied(record.id) ? "已占用" : "可绑定"}</Tag>
      ),
    },
  ];
  async function submit(): Promise<void> {
    if (!person.value || loading.value) return;
    if (!selectedId.value) {
      message.warning("请选择定位终端");
      return;
    }
    if (isReplacement.value && !replacementReason.value) {
      message.warning("请选择更换原因");
      return;
    }
    const replacing = isReplacement.value;
    loading.value = true;
    try {
      await store.bind(person.value.id, selectedId.value, replacementReason.value);
      message.success(replacing ? "终端更换成功" : "终端绑定成功");
      modal.close();
      onChanged();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      loading.value = false;
    }
  }
  const BindingModal = defineComponent({
    name: "BindingModal",
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
                type="info"
                showIcon
                message={
                  isReplacement.value
                    ? "更换后原绑定立即结束，新终端开始生效，历史记录保留。"
                    : "同一人员只能绑定一个终端，已占用和停用的终端不可选择。"
                }
              />
              {isReplacement.value && (
                <Form layout="vertical" class="pp-binding-modal__reason-form">
                  <FormItem label="更换原因" required>
                    <Select
                      aria-label="更换原因"
                      v-model:value={replacementReason.value}
                      placeholder="请选择更换原因"
                      options={optionsOf(REPLACEMENT_REASONS)}
                    />
                  </FormItem>
                </Form>
              )}
              <div class="pp-filter-row">
                <Input aria-label="搜索可绑定终端" allowClear placeholder="搜索终端编号、类型或设备产品" v-model:value={keyword.value} />
              </div>
              <StaticTable
                columns={asCubeTableColumns(columns)}
                rowKey="id"
                dataSource={filtered.value}
                loading={false}
                size="small"
                scrollY={280}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selectedId.value ? [selectedId.value] : [],
                  onChange: (keys: (string | number)[]) => {
                    selectedId.value = String(keys[0] ?? "");
                  },
                  getCheckboxProps: (record: unknown) => ({ disabled: !available(record as PositioningDevice) }),
                }}
              />
              <p class="pp-muted">可选择已启用的离线终端，绑定后会在终端重新上线并上报位置后显示实时位置。</p>
            </>
          ),
          footer: () => (
            <div class="pp-modal-footer">
              <Button onClick={() => modal.close()}>取消</Button>
              <Button
                type="primary"
                loading={loading.value}
                disabled={!selectedId.value || Boolean(isReplacement.value && !replacementReason.value)}
                onClick={() => void submit()}
              >
                {isReplacement.value ? "确认更换" : "确认绑定"}
              </Button>
            </div>
          ),
        }}
      />
    ),
  });
  return {
    BindingModal,
    open: (record: PositioningPerson) => {
      person.value = record;
      selectedId.value = "";
      replacementReason.value = undefined;
      keyword.value = "";
      modal.setState({ title: title.value, width: "850px" });
      modal.open();
      void Promise.all([store.refreshPersons(), store.refreshDevices("terminal"), store.refreshBindings(record.id)]).catch(
        (error: unknown) => {
          message.error((error as Error).message);
        },
      );
    },
  };
}

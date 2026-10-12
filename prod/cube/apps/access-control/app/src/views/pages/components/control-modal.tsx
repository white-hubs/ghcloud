import { defineComponent, reactive } from "vue";

import { controlDoor, inspectgetStatus } from "@ghcloud/cube-services-client/access-control.client";
import { Form, FormItem, Modal, RadioGroup, message } from "@ghcloud/cube-ui";

import "./control-modal.less";

export interface ControlModalExpose {
  open: (record: DoorDeviceRecord) => void;
}

interface DoorDeviceRecord {
  id?: string | number;
  name?: string;
  outBusinessId?: string | number;
  businessId?: string | number;
}

export default defineComponent({
  name: "ControlModal",
  emits: ["changed"],
  setup: (_props, { emit, expose }) => {
    const state = reactive({
      visible: false,
      loading: false,
      deviceStatus: 4,
      controlOption: "",
      device: null as DoorDeviceRecord | null,
    });

    const open = async (record: DoorDeviceRecord): Promise<void> => {
      state.visible = true;
      state.device = record;
      state.deviceStatus = 4;
      state.controlOption = "";
      try {
        const result = await inspectgetStatus({ id: record.id || "" });
        state.deviceStatus = Number(result.status ?? result.value ?? result ?? 4);
        state.controlOption = String(state.deviceStatus);
      } catch {
        state.deviceStatus = 4;
      }
    };

    const submit = async (): Promise<void> => {
      state.loading = true;
      try {
        await controlDoor({
          doorIndexCodes: state.device?.outBusinessId || state.device?.businessId || "",
          controlType: state.controlOption,
        });
        message.success("操作成功");
        state.visible = false;
        emit("changed");
      } finally {
        state.loading = false;
      }
    };

    expose({ open });

    return () => (
      <Modal
        visible={state.visible}
        title={state.device?.name || "--"}
        width="640px"
        confirmLoading={state.loading}
        onCancel={() => {
          state.visible = false;
        }}
        onOk={() => {
          void submit();
        }}
        onUpdate:visible={(visible: boolean) => {
          state.visible = visible;
        }}
      >
        <div class="panelRefBox">
          <div class="panelRefBox-left">
            <img
              src={
                ["0", "1"].includes(state.controlOption)
                  ? "/resource/v1/accesscontrol-migrate/btn2.png"
                  : "/resource/v1/accesscontrol-migrate/btn1.png"
              }
              alt="门禁状态"
            />
          </div>
          <div class="panelRefBox-right">
            <Form>
              <FormItem label="启停控制">
                <RadioGroup
                  buttonStyle="solid"
                  value={state.controlOption}
                  options={[
                    { value: "1", label: "开启" },
                    { value: "2", label: "关闭" },
                  ]}
                  onUpdate:value={(value: string) => {
                    state.controlOption = value;
                  }}
                />
              </FormItem>
              <FormItem label="远程控制">
                <RadioGroup
                  buttonStyle="solid"
                  value={state.controlOption}
                  options={[
                    { value: "0", label: "常开" },
                    { value: "3", label: "常关" },
                  ]}
                  onUpdate:value={(value: string) => {
                    state.controlOption = value;
                  }}
                />
              </FormItem>
            </Form>
          </div>
        </div>
        <div class="panelRefBox-bottom">当前状态：{["初始状态", "开门状态", "关门状态", "离线状态", "--"][state.deviceStatus] || "--"}</div>
      </Modal>
    );
  },
});

import { defineComponent, reactive, ref, type PropType, type Ref } from "vue";

import type { AreaScenePanelModifyParam } from "@ghcloud/cube-service-interface/mdata";
import { saveAreaScenePanelConfig } from "@ghcloud/cube-services-client/mdata.client";
import { Button, Form, FormItem, Modal, Select, Space, message } from "@ghcloud/cube-ui";

import { useAuthRequest } from "@/hooks/auth-request";

export type PanelSelectApi = {
  validate: () => Promise<void>;
  getConfig: () => AreaScenePanelModifyParam[];
  requestAreaScenePanelConfig: () => Promise<void>;
};

const AREA_OPTIONS = [
  { label: "一级区域", value: "1" },
  { label: "二级区域", value: "2" },
  { label: "三级区域", value: "3" },
  { label: "四级区域", value: "4" },
];

/**
 * 保存 / 批量保存到多个区域层级。
 */
export const BatchSave = defineComponent({
  name: "BatchSave",
  props: {
    areaId: {
      type: String,
      required: true,
    },
    sceneType: {
      type: String,
      required: true,
    },
    panelSelectRef: {
      type: Object as PropType<Ref<PanelSelectApi | null>>,
      required: true,
    },
  },
  setup(props) {
    const saving = ref(false);
    const batchSaving = ref(false);
    const batchVisible = ref(false);
    const batchForm = reactive<{ area: string[] }>({ area: [] });

    const ensureApi = (): PanelSelectApi => {
      const api = props.panelSelectRef.value;
      if (!api) {
        throw new Error("面板编辑器未就绪");
      }
      return api;
    };

    const handleSave = async (): Promise<void> => {
      if (!props.sceneType) {
        message.warning("请先选择左侧业务菜单");
        return;
      }
      try {
        saving.value = true;
        const api = ensureApi();
        await api.validate();
        const params = api.getConfig();
        if (!params.length) {
          message.warning("请至少选择一个面板");
          return;
        }
        await useAuthRequest(() =>
          saveAreaScenePanelConfig({
            areaId: props.areaId,
            sceneType: props.sceneType,
            panelConfigModifyParams: params,
          }),
        );
        await api.requestAreaScenePanelConfig();
        message.success("配置成功");
      } catch (error) {
        const text = error instanceof Error ? error.message : "保存失败";
        if (text && text !== "保存失败" && text !== "面板编辑器未就绪") {
          message.warning(text);
        } else {
          message.error(text === "面板编辑器未就绪" ? text : "保存失败");
        }
      } finally {
        saving.value = false;
      }
    };

    const openBatch = async (): Promise<void> => {
      try {
        await ensureApi().validate();
        batchForm.area = [];
        batchVisible.value = true;
      } catch (error) {
        const text = error instanceof Error ? error.message : "请完善面板配置";
        message.warning(text);
      }
    };

    const handleBatchSubmit = async (): Promise<void> => {
      if (!batchForm.area.length) {
        message.warning("请选择区域层级");
        return;
      }
      try {
        batchSaving.value = true;
        const api = ensureApi();
        await api.validate();
        const params = api.getConfig();
        if (!params.length) {
          message.warning("请至少选择一个面板");
          return;
        }
        await Promise.all(
          batchForm.area.map((areaId) =>
            useAuthRequest(() =>
              saveAreaScenePanelConfig({
                areaId,
                sceneType: props.sceneType,
                panelConfigModifyParams: params,
              }),
            ),
          ),
        );
        batchVisible.value = false;
        message.success("批量配置成功");
        await api.requestAreaScenePanelConfig();
      } catch {
        message.error("批量配置失败");
      } finally {
        batchSaving.value = false;
      }
    };

    return () => (
      <>
        <Space>
          <Button type="primary" disabled={!props.sceneType} onClick={() => void openBatch()}>
            批量保存
          </Button>
          <Button type="primary" disabled={!props.sceneType} loading={saving.value} onClick={() => void handleSave()}>
            保存
          </Button>
        </Space>
        <Modal
          visible={batchVisible.value}
          title="当前配置批量保存到区域层级"
          confirmLoading={batchSaving.value}
          okText="确定"
          cancelText="取消"
          onOk={() => void handleBatchSubmit()}
          onCancel={() => {
            batchVisible.value = false;
          }}
        >
          <Form layout="horizontal" labelCol={{ style: { width: "120px" } }}>
            <FormItem label="适用区域层级" required>
              <Select
                mode="multiple"
                value={batchForm.area}
                options={AREA_OPTIONS}
                allowClear
                placeholder="请选择区域层级"
                onUpdate:value={(val: string[]) => {
                  batchForm.area = val ?? [];
                }}
              />
            </FormItem>
          </Form>
        </Modal>
      </>
    );
  },
});

export default BatchSave;

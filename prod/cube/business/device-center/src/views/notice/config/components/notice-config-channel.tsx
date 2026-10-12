import type { MessageNotifyConfig } from "./model/notify-config-type";
import { NoticeConfigNoticeTarget } from "./notice-config-target";
import { cubeMessageCenterService } from "@/api/service";
import { Form, FormItem, type FormExpose, Button, Select, type RuleObject, Col, Row } from "@ghcloud/cube-ui";
import { VerticalLine } from "@ghcloud/generic-component";
import { logger } from "@ghcloud/generic-component/src/logger";
import { defineComponent, onMounted, reactive, ref, type ComponentPublicInstance, watch, nextTick } from "vue";

interface Props {
  messageNotifyConfig: MessageNotifyConfig[];
}

type RefItem = Element | ComponentPublicInstance | null;

/** 设备通知配置-消息通知 */
export const NoticeConfigMessage = defineComponent({
  props: {
    messageNotifyConfig: {
      type: Array as () => MessageNotifyConfig[],
      default: () => [],
    },
  },

  setup(props: Props, { expose, slots }) {
    const formRef = ref<FormExpose>();
    const dynamicValidateForm = reactive<{ messageNotifyConfig: MessageNotifyConfig[] }>({
      messageNotifyConfig: [],
    });

    const formRules: Record<string, RuleObject[]> = {
      channelTypes: [{ required: true, message: "请选择通知方式", trigger: "change" }],
    };

    const channelTypeOptions = ref<{ channelType: string; channelTypeName: string }[]>([]);
    const loading = ref(false);
    const refMap: Record<number, RefItem> = {};

    // 获取渠道类型选项
    const fetchChannelTypes = async () => {
      try {
        loading.value = true;
        const allMsgChannels = await cubeMessageCenterService.getMsgChannels();
        const sceneResult = await cubeMessageCenterService.getMsgSceneReceiveDetail("DEVICE_NOTIFY");

        const allowedChannelCodes = sceneResult.channelCodes || [];
        const filteredChannels = allMsgChannels.filter((channel: any) => allowedChannelCodes.includes(channel.code));

        channelTypeOptions.value = filteredChannels.map((channel: any) => ({
          channelType: channel.code || channel.channelType || "",
          channelTypeName: channel.name || channel.label || channel.channelTypeName || channel.code || "",
        }));

        // 确保数据已经正确绑定
        if (dynamicValidateForm.messageNotifyConfig.length > 0) {
          await nextTick();
        }
      } catch (err) {
        logger.error("获取通知方式失败:", err);
        channelTypeOptions.value = [];
      } finally {
        loading.value = false;
      }
    };

    // 监听 props 变化
    watch(
      () => props.messageNotifyConfig,
      (newConfig) => {
        if (newConfig && newConfig.length > 0) {
          dynamicValidateForm.messageNotifyConfig = JSON.parse(JSON.stringify(newConfig));
        } else {
          dynamicValidateForm.messageNotifyConfig = [];
        }
      },
      { deep: true, immediate: true },
    );

    // 组件挂载
    onMounted(async () => {
      await fetchChannelTypes();
    });

    const delRow = (index: number): void => {
      dynamicValidateForm.messageNotifyConfig.splice(index, 1);
    };

    const addRow = async (): Promise<void> => {
      const newConfig: MessageNotifyConfig = {
        channelTypes: [],
        targets: [],
      };
      dynamicValidateForm.messageNotifyConfig.push(newConfig);

      await nextTick();

      if (dynamicValidateForm.messageNotifyConfig.length > 1) {
        const rowIndex = dynamicValidateForm.messageNotifyConfig.length - 1;
        const targetRef = refMap[rowIndex] as any;
        if (targetRef && targetRef.validateForm) {
          targetRef.validateForm();
        }
      }
    };

    const addNotice = async (index: number): Promise<void> => {
      const targetRef = refMap[index] as any;
      if (targetRef && targetRef.addRow) {
        targetRef.addRow();
      }
    };

    const handleSetTempMap = (el: RefItem, index: number): unknown => {
      if (el) {
        refMap[index] = el;
      }
      return refMap;
    };

    const validateForm = async (): Promise<unknown> => {
      try {
        await formRef.value?.validate();

        // 先调用所有 NoticeConfigNoticeTarget 组件的 validateForm 方法，确保数据同步
        for (const index in refMap) {
          const targetRef = refMap[index] as any;
          if (targetRef && targetRef.validateForm) {
            await targetRef.validateForm();
          }
        }

        // 处理数据转换
        const result = {
          messageNotifyConfig: dynamicValidateForm.messageNotifyConfig.map((config) => {
            const processedConfig = { ...config };

            if (processedConfig.targets && Array.isArray(processedConfig.targets)) {
              processedConfig.targets = processedConfig.targets.map((item) => {
                const processedItem = { ...item };

                if (processedItem.messageTargetNotify === "USER" && processedItem.user) {
                  processedItem.targetConfig = processedItem.user.map((u: any) => ({
                    userId: u.id,
                    userName: u.name,
                  }));
                } else if (processedItem.messageTargetNotify === "ROLE" && processedItem.role) {
                  processedItem.targetConfig = processedItem.role.map((r: any) => ({
                    roleId: r.id,
                    roleName: r.name,
                  }));
                } else if (
                  processedItem.messageTargetNotify === "DEPARTMENT" &&
                  processedItem.departmentId &&
                  Array.isArray(processedItem.departmentId)
                ) {
                  processedItem.targetConfig = processedItem.departmentId.map((deptId: any) => ({
                    departmentId: deptId,
                    departmentName: "",
                  }));
                }

                return processedItem;
              });
            }

            return processedConfig;
          }),
        };
        return result;
      } catch (error) {
        logger.error("表单验证失败:", error);
        throw error;
      }
    };

    const resetForm = async (): Promise<void> => {
      try {
        formRef.value?.resetFields();
        dynamicValidateForm.messageNotifyConfig = [];
      } catch (error) {
        logger.error("重置表单失败:", error);
      }
    };

    expose({
      validateForm,
      resetForm,
      addRow,
    });

    return (): JSX.Element => (
      <>
        <div style="margin-top:40px;display:flex;align-items:center">
          <VerticalLine title="消息通知" style="margin-right:10px" />
          <Button size="small" type="primary" onClick={addRow} loading={loading.value}>
            添加
          </Button>
          {slots.switch?.()}
        </div>

        {loading.value ? (
          <div style="text-align: center; padding: 40px; color: #999;">加载中...</div>
        ) : (
          <Form ref={formRef} model={dynamicValidateForm} labelCol={{ style: { width: "120px" } }} style="margin-top: 20px;">
            {dynamicValidateForm.messageNotifyConfig?.length === 0 ? (
              <div style="text-align: center; padding: 40px; color: #999;">暂无消息通知配置，请点击"添加"按钮创建</div>
            ) : (
              dynamicValidateForm.messageNotifyConfig?.map((e: MessageNotifyConfig, i: number) => (
                <div style="border: 1px dashed #d9d9d9; padding-top: 20px; margin-bottom:20px;" key={i}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <FormItem
                        style="width: 100%;"
                        label="通知方式"
                        name={["messageNotifyConfig", i, "channelTypes"]}
                        rules={formRules.channelTypes}
                      >
                        <Select
                          style={{ width: "100%", minWidth: "200px" }}
                          v-model:value={e.channelTypes}
                          mode="multiple"
                          options={channelTypeOptions.value}
                          fieldNames={{ label: "channelTypeName", value: "channelType" }}
                          allowClear
                          placeholder="请选择通知方式"
                          getPopupContainer={() => document.body}
                          loading={loading.value}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8} style="display: flex; align-items: center;">
                      <Button type="link" onClick={() => addNotice(i)}>
                        添加人员
                      </Button>
                      <Button type="link" danger onClick={() => delRow(i)}>
                        删除
                      </Button>
                    </Col>
                  </Row>
                  <div style="margin-left: 40px; margin-top: 0;">
                    <NoticeConfigNoticeTarget
                      targets={e.targets || []}
                      showTitle={false}
                      ref={(el) => handleSetTempMap(el, i)}
                      onChange={(result) => {
                        if (result && result && result.targetModifyParams) {
                          e.targets = result.targetModifyParams;
                        }
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </Form>
        )}
      </>
    );
  },
});

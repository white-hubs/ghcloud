import type { MessageTargetModifyParams } from "./model/notify-config-type";
import { Form, FormItem, type FormExpose, Button, Select, type RuleObject, Col, Row } from "@ghcloud/cube-ui";
import { DeptTreeSelect, RolePickerInput, UserPickerInput, VerticalLine } from "@ghcloud/generic-component";
import { logger } from "@ghcloud/generic-component/src/logger";
import { defineComponent, reactive, ref, watch, nextTick } from "vue";

/** 设备通知配置-通知人 */
export const NoticeConfigNoticeTarget = defineComponent({
  props: {
    showTitle: {
      type: Boolean,
      default: () => true,
    },
    targets: {
      type: Array as () => MessageTargetModifyParams[],
      default: () => [],
    },
  },
  emits: ["change"],
  setup(props, { expose, emit, slots }) {
    const formRef = ref<FormExpose>();
    const dynamicValidateForm = reactive<{ targets: MessageTargetModifyParams[] }>({
      targets: [],
    });

    const formRules: Record<string, RuleObject[]> = {
      messageTargetNotify: [{ required: true, message: "请选择通知人员", trigger: "change" }],
      departmentId: [{ required: true, message: "请选择部门", trigger: "change" }],
      role: [{ required: true, message: "请选择角色", trigger: "change" }],
      user: [{ required: true, message: "请输入用户", trigger: "change" }],
    };

    // 初始化数据：将 targets 转换为组件需要的格式
    const initData = () => {
      if (props.targets && props.targets.length > 0) {
        const processedTargets = props.targets.map((target) => {
          const processedTarget: MessageTargetModifyParams = {
            messageTargetNotify: target.messageTargetNotify || undefined,
            departmentId: undefined,
            role: undefined,
            user: undefined,
          };

          // 根据 targetConfig 还原数据
          if (target.targetConfig && Array.isArray(target.targetConfig)) {
            if (target.messageTargetNotify === "USER") {
              // 将 targetConfig 转换为 user 格式
              processedTarget.user = target.targetConfig.map((config: any) => ({
                id: config.userId || config.id,
                name: config.userName || config.name,
              }));
            } else if (target.messageTargetNotify === "ROLE") {
              // 将 targetConfig 转换为 role 格式
              processedTarget.role = target.targetConfig.map((config: any) => ({
                id: config.roleId || config.id,
                name: config.roleName || config.name,
              }));
            } else if (target.messageTargetNotify === "DEPARTMENT") {
              // 将 targetConfig 转换为 departmentId 格式
              processedTarget.departmentId = target.targetConfig.map((config: any) => config.departmentId || config.id);
            }
          } else {
            // 如果没有 targetConfig，直接使用原始数据
            processedTarget.departmentId = target.departmentId;
            processedTarget.role = target.role;
            processedTarget.user = target.user;
          }

          return processedTarget;
        });

        dynamicValidateForm.targets = processedTargets;
      } else {
        dynamicValidateForm.targets = [];
      }
    };

    // 监听 props.targets 变化
    watch(
      () => props.targets,
      (newTargets) => {
        if (newTargets && newTargets.length > 0) {
          initData();
        } else {
          dynamicValidateForm.targets = [];
        }
      },
      { deep: true, immediate: true },
    );

    const delRow = (index: number): void => {
      dynamicValidateForm.targets.splice(index, 1);
      validateForm();
    };

    const addRow = async (): Promise<void> => {
      dynamicValidateForm.targets.push({
        messageTargetNotify: undefined,
        departmentId: undefined,
        role: undefined,
        user: undefined,
      });
      await nextTick();
      validateForm();
    };

    const validateForm = async (): Promise<unknown> => {
      try {
        await formRef.value?.validate();

        const targetConfigList: { messageTargetNotify: string | undefined; targetConfig: unknown[] }[] = [];

        if (dynamicValidateForm.targets && Array.isArray(dynamicValidateForm.targets)) {
          dynamicValidateForm.targets.forEach((item) => {
            let targetConfig: any[] = [];

            if (item.messageTargetNotify === "USER" && item?.user) {
              targetConfig = item.user.map((u: any) => ({
                userId: u.id,
                userName: u.name,
              }));
            } else if (item.messageTargetNotify === "ROLE" && item?.role) {
              targetConfig = item.role.map((r: any) => ({
                roleId: r.id,
                roleName: r.name,
              }));
            } else if (item.messageTargetNotify === "DEPARTMENT" && item?.departmentId) {
              // 确保 departmentId 是数组
              const departmentArray = Array.isArray(item.departmentId) ? item.departmentId : [item.departmentId];
              targetConfig = departmentArray.map((deptId: any) => ({
                departmentId: deptId,
                departmentName: "",
              }));
            }

            targetConfigList.push({
              messageTargetNotify: item.messageTargetNotify,
              targetConfig,
            });
          });
        }

        const result = {
          targetModifyParams: dynamicValidateForm.targets,
        };

        emit("change", result);
        return result;
      } catch (error) {
        logger.error("表单验证失败:", error);
        throw error;
      }
    };

    const resetForm = async (): Promise<void> => {
      try {
        await formRef.value?.resetFields();
        dynamicValidateForm.targets = [];
      } catch (error) {
        logger.error("重置表单失败:", error);
      }
    };

    const forceUpdate = () => {
      initData();
    };

    expose({
      validateForm,
      resetForm,
      addRow,
      forceUpdate,
    });

    return (): JSX.Element => (
      <>
        {props.showTitle && (
          <div style="margin-top:40px;display:flex;align-items:center">
            <VerticalLine title="消息通知" style="margin-right:10px" />
            <Button size="small" type="primary" onClick={addRow}>
              添加
            </Button>
            {slots.switch?.()}
          </div>
        )}
        <Form ref={formRef} model={dynamicValidateForm} labelCol={{ style: { width: "80px" } }} style="margin-top: 20px;">
          {dynamicValidateForm.targets?.map((e: Record<string, unknown>, i: number) => (
            <Row gutter={16} key={`target-${i}-${e.messageTargetNotify || "empty"}`} style={{ marginBottom: "16px" }}>
              <Col span={5}>
                <FormItem
                  style="margin-right:0"
                  label="通知人员"
                  name={["targets", i, "messageTargetNotify"]}
                  rules={formRules.messageTargetNotify}
                >
                  <Select
                    v-model:value={e.messageTargetNotify}
                    options={[
                      { label: "选择部门", value: "DEPARTMENT" },
                      { label: "选择角色", value: "ROLE" },
                      { label: "选择用户", value: "USER" },
                    ]}
                    allowClear
                    placeholder="请选择通知人员"
                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
                    onChange={() => validateForm()}
                  />
                </FormItem>
              </Col>
              {e.messageTargetNotify === "DEPARTMENT" && (
                <Col span={10}>
                  <FormItem style="width:400px;margin-right:0" name={["targets", i, "departmentId"]} rules={formRules.departmentId}>
                    <DeptTreeSelect v-model:value={e.departmentId} placeholder="请选择部门" multiple onChange={() => validateForm()} />
                  </FormItem>
                </Col>
              )}
              {e.messageTargetNotify === "ROLE" && (
                <Col span={10}>
                  <FormItem style="width:400px;margin-right:0" name={["targets", i, "role"]} rules={formRules.role}>
                    <RolePickerInput v-model:value={e.role} multiple onChange={() => validateForm()} />
                  </FormItem>
                </Col>
              )}
              {e.messageTargetNotify === "USER" && (
                <Col span={10}>
                  <FormItem style="width:400px;margin-right:0" name={["targets", i, "user"]} rules={formRules.user}>
                    <UserPickerInput v-model:value={e.user} multiple onChange={() => validateForm()} />
                  </FormItem>
                </Col>
              )}
              <Col span={2}>
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    delRow(i);
                  }}
                >
                  删除
                </Button>
              </Col>
            </Row>
          ))}
        </Form>
      </>
    );
  },
});

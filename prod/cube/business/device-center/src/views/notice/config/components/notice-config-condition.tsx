import type { RuleCondition } from "./model/notify-config-type";
import { cubeDeviceCenterService } from "@/api/service";
import { logger } from "@/logger";
import { Form, FormItem, Input, Select, Button, Row, Col, InputNumber, message } from "@ghcloud/cube-ui";
import { VerticalLine } from "@ghcloud/generic-component";
import { defineComponent, reactive, ref, onMounted, watch, computed, nextTick } from "vue";
import { useRoute } from "vue-router";

interface Props {
  ruleConditions?: RuleCondition[];
}

export const DeviceNotifyRuleConfig = defineComponent({
  props: {
    ruleConditions: {
      type: Array as () => RuleCondition[],
      default: () => [],
    },
  },
  setup(props: Props, { expose }) {
    const formRef = ref();
    const { deviceId } = useRoute().query as { deviceId: string };
    const dynamicForm = reactive<{ rules: RuleCondition[] }>({
      rules: [],
    });

    // 条件类型选项
    const conditionTypeOptions = [
      { label: "属性判断", value: "CUSTOM_RULE_CONDITION" },
      { label: "设备事件", value: "DEVICE_EVENT_CONDITION" },
    ];

    // 属性操作符选项
    const operatorOptions = [
      { label: "等于", value: "EQ" },
      { label: "不等于", value: "NE" },
      { label: "大于", value: "GT" },
      { label: "大于等于", value: "GE" },
      { label: "小于", value: "LT" },
      { label: "小于等于", value: "LE" },
      { label: "包含", value: "IN" },
      { label: "不包含", value: "NOT_IN" },
    ];

    // 属性选项（从API获取）
    const propertyOptions = ref<
      {
        label: string;
        value: string;
        propName: string;
        propUnit: string;
      }[]
    >([]);

    // 设备事件选项（从API获取）
    const deviceEventOptions = ref<
      {
        label: string;
        value: string;
        eventName: string;
        eventType: string;
      }[]
    >([]);

    // 计算属性：确保数据格式正确
    const formattedRules = computed(() =>
      dynamicForm.rules.map((rule) => {
        const formattedRule = { ...rule };

        // 确保 ruleConditionExps 存在
        if (!formattedRule.ruleConditionExps) {
          formattedRule.ruleConditionExps = [];
        }

        // 格式化每个表达式
        if (formattedRule.conditionType === "CUSTOM_RULE_CONDITION") {
          formattedRule.ruleConditionExps = formattedRule.ruleConditionExps.map((exp) => ({
            ...exp,
            propCode: exp.propCode || "",
            propName: exp.propName || "",
            propUnit: exp.propUnit || "",
            op: exp.op || "EQ",
            oprand: exp.oprand || "",
            delayTime: exp.delayTime || 0,
          }));
        }

        return formattedRule;
      }),
    );

    // 从接口获取属性列表
    const fetchPropertiesAndEvents = async () => {
      try {
        const response = await cubeDeviceCenterService.getNorthDeviceDetail({
          deviceId: deviceId,
          withPropertySpec: true,
          withEventSpec: true,
        });

        if (response) {
          if (response.productPropVoList) {
            propertyOptions.value = response.productPropVoList.map((prop) => ({
              label: prop.propName || prop.propCode || "",
              value: prop.propCode || "",
              propName: prop.propName || "",
              propUnit: prop.unitName || "",
            }));
          }

          if (response.productEventVoList) {
            deviceEventOptions.value = response.productEventVoList.map((event) => ({
              label: event.eventName || event.eventCode || "",
              value: event.eventCode || "",
              eventName: event.eventName || "",
              eventType: event.categoryCode || "",
            }));
          }

          // 如果已经有规则数据，进行回显
          if (props.ruleConditions && props.ruleConditions.length > 0) {
            await initRuleConditions();
          }
        }
      } catch (error) {
        logger.error("获取属性列表失败:", error);
        message.error("获取属性列表失败");
      }
    };

    // 初始化规则条件
    const initRuleConditions = async () => {
      if (!props.ruleConditions || props.ruleConditions.length === 0) {
        dynamicForm.rules = [];
        return;
      }

      try {
        // 深度复制规则数据
        const rulesToSet = JSON.parse(JSON.stringify(props.ruleConditions));

        // 处理每个规则
        const processedRules = rulesToSet.map((rule: RuleCondition) => {
          const processedRule = { ...rule };

          // 确保基础字段存在
          processedRule.conditionType = processedRule.conditionType || undefined;

          // 确保 ruleConditionExps 是数组
          if (!processedRule.ruleConditionExps) {
            processedRule.ruleConditionExps = [];
          }

          // 处理属性条件
          if (processedRule.conditionType === "CUSTOM_RULE_CONDITION") {
            processedRule.ruleConditionExps = processedRule.ruleConditionExps.map((exp) => {
              const processedExp = { ...exp };

              // 尝试从 propertyOptions 中补充属性信息
              if (processedExp.propCode && propertyOptions.value.length > 0) {
                const prop = propertyOptions.value.find((p) => p.value === processedExp.propCode);
                if (prop) {
                  processedExp.propName = prop.propName;
                  processedExp.propUnit = prop.propUnit;
                }
              }

              return processedExp;
            });
          }

          // 处理事件条件
          if (processedRule.conditionType === "DEVICE_EVENT_CONDITION") {
            if (processedRule.deviceEventCode && deviceEventOptions.value.length > 0) {
              const event = deviceEventOptions.value.find((e) => e.value === processedRule.deviceEventCode);
              if (event) {
                processedRule.deviceEventName = event.eventName;
                processedRule.deviceEventType = event.eventType;
              }
            }
          }

          return processedRule;
        });

        // 设置到响应式数据中
        dynamicForm.rules = processedRules;

        // 等待下一个 tick，确保 DOM 更新
        await nextTick();
      } catch (error) {
        logger.error("初始化规则条件失败:", error);
        message.error("初始化规则条件失败");
      }
    };

    // 监听 props.ruleConditions 变化
    watch(
      () => props.ruleConditions,
      async (newRules) => {
        if (newRules && newRules.length > 0) {
          await initRuleConditions();
        } else {
          dynamicForm.rules = [];
        }
      },
      { deep: true, immediate: true },
    );

    // 组件挂载时获取数据
    onMounted(() => {
      fetchPropertiesAndEvents();
    });

    // 添加规则
    const addRule = (): void => {
      dynamicForm.rules.push({
        conditionType: undefined,
        ruleConditionExps: [],
      });
    };

    // 处理条件类型变化
    const handleConditionTypeChange = (value: string, ruleIndex: number): void => {
      const rule = dynamicForm.rules[ruleIndex];
      rule.conditionType = value;

      if (value === "CUSTOM_RULE_CONDITION") {
        // 属性条件：初始化一个表达式
        rule.ruleConditionExps = [
          {
            propCode: "",
            propName: "",
            propUnit: "",
            op: "EQ",
            oprand: "",
            delayTime: 0,
          },
        ];
      } else if (value === "DEVICE_EVENT_CONDITION") {
        // 事件条件：清空表达式
        rule.ruleConditionExps = [];
        rule.deviceEventCode = "";
        rule.deviceEventName = "";
        rule.deviceEventType = "";
      }
    };

    // 处理设备事件选择
    const handleDeviceEventChange = (value: string, ruleIndex: number): void => {
      const event = deviceEventOptions.value.find((e) => e.value === value);
      if (event) {
        dynamicForm.rules[ruleIndex].deviceEventCode = value;
        dynamicForm.rules[ruleIndex].deviceEventName = event.eventName;
        dynamicForm.rules[ruleIndex].deviceEventType = event.eventType;
      }
    };

    // 处理属性选择
    const handlePropertyChange = (value: string, ruleIndex: number, expIndex: number): void => {
      const property = propertyOptions.value.find((p) => p.value === value);
      if (property && dynamicForm.rules[ruleIndex].ruleConditionExps) {
        dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].propCode = value;
        dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].propName = property.propName;
        dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].propUnit = property.propUnit;
      }
    };

    // 删除规则
    const deleteRule = (index: number): void => {
      dynamicForm.rules.splice(index, 1);
    };

    // 添加表达式（条件）
    const addExpression = (ruleIndex: number): void => {
      if (!dynamicForm.rules[ruleIndex].ruleConditionExps) {
        dynamicForm.rules[ruleIndex].ruleConditionExps = [];
      }
      dynamicForm.rules[ruleIndex].ruleConditionExps!.push({
        propCode: "",
        propName: "",
        propUnit: "",
        op: "EQ",
        oprand: "",
        delayTime: 0,
      });
    };

    // 删除表达式
    const deleteExpression = (ruleIndex: number, expIndex: number): void => {
      if (dynamicForm.rules[ruleIndex].ruleConditionExps && dynamicForm.rules[ruleIndex].ruleConditionExps!.length > 1) {
        dynamicForm.rules[ruleIndex].ruleConditionExps!.splice(expIndex, 1);
      }
    };

    // 获取数据
    const getData = (): RuleCondition[] =>
      dynamicForm.rules.map((rule) => ({
        ...rule,
        ruleConditionExps: rule.ruleConditionExps?.map((exp) => ({
          ...exp,
          delayTime: exp.delayTime || 0,
        })),
      }));

    // 验证表单
    const validateForm = async (): Promise<RuleCondition[]> => {
      try {
        await formRef.value?.validate();
        return getData();
      } catch (error) {
        logger.error("验证失败", error);
        throw error;
      }
    };

    // 重置表单
    const resetForm = (): void => {
      dynamicForm.rules = [];
      formRef.value?.resetFields();
    };

    // 暴露方法
    expose({
      validateForm,
      getData,
      resetForm,
      addRule,
    });

    // 渲染函数
    return () => (
      <>
        <div style="margin-top:40px;display:flex;align-items:center;margin-bottom:20px">
          <VerticalLine title="触发条件" style="margin-right:10px" />
          <Button size="small" type="primary" onClick={addRule}>
            添加
          </Button>
        </div>

        <Form ref={formRef} model={dynamicForm} style="margin-top: 20px;">
          {formattedRules.value.map((rule, ruleIndex) => (
            <div key={ruleIndex} style="border: 1px dashed #d9d9d9; padding: 20px; margin-bottom:16px;overflow:visible">
              <FormItem label="通知规则:">
                {/* 属性条件配置 */}
                {rule.conditionType === "CUSTOM_RULE_CONDITION" && rule.ruleConditionExps && (
                  <div style="overflow:visible">
                    {rule.ruleConditionExps.map((exp, expIndex) => (
                      <Row
                        gutter={16}
                        align="middle"
                        key={expIndex}
                        style="margin-bottom: 12px;display:flex;align-items:center;min-height:32px;overflow:visible"
                      >
                        {/* 第一行显示条件类型选择 */}
                        {expIndex === 0 && (
                          <Col style="display:flex;align-items:center;width:180px;overflow:visible;margin-right:16px">
                            <FormItem
                              rules={[{ required: true, message: "请选择条件类型" }]}
                              style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                              validateTrigger="onBlur"
                            >
                              <Select
                                v-model={[dynamicForm.rules[ruleIndex].conditionType, "value"]}
                                options={conditionTypeOptions}
                                placeholder="请选择条件类型"
                                style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                                onChange={(value: string) => handleConditionTypeChange(value, ruleIndex)}
                                allowClear={false}
                              />
                            </FormItem>
                          </Col>
                        )}

                        {/* 其他行占位 */}
                        {expIndex > 0 && <Col style="width:180px;margin-right:16px"></Col>}

                        {/* 属性选择 */}
                        <Col style="display:flex;align-items:center;overflow:visible;margin-right:16px">
                          <FormItem
                            rules={[{ required: true, message: "请选择属性" }]}
                            style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                            validateTrigger="onBlur"
                          >
                            <Select
                              v-model={[dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].propCode, "value"]}
                              options={propertyOptions.value}
                              fieldNames={{ label: "label", value: "value" }}
                              placeholder="请选择属性"
                              style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                              onChange={(value: string) => handlePropertyChange(value, ruleIndex, expIndex)}
                              allowClear={false}
                              showSearch
                            />
                          </FormItem>
                        </Col>

                        {/* 比较操作 */}
                        <Col style="display:flex;align-items:center;overflow:visible;margin-right:16px">
                          <FormItem
                            rules={[{ required: true, message: "请选择比较操作" }]}
                            style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                            validateTrigger="onBlur"
                          >
                            <Select
                              v-model={[dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].op, "value"]}
                              options={operatorOptions}
                              placeholder="比较操作"
                              style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                              allowClear={false}
                            />
                          </FormItem>
                        </Col>

                        {/* 比较值输入 */}
                        <Col style="display:flex;align-items:center;overflow:visible;margin-right:16px">
                          <FormItem
                            rules={[{ required: true, message: "请输入值" }]}
                            style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                            validateTrigger="onBlur"
                          >
                            <Input
                              v-model={[dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].oprand, "value"]}
                              placeholder="请输入值"
                              style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                              showCount={false}
                              allowClear={false}
                            />
                          </FormItem>
                        </Col>

                        {/* 持续时间 */}
                        <Col style="display:flex;align-items:center;overflow:visible;margin-right:16px">
                          <FormItem
                            rules={[{ required: true, message: "请输入持续时间" }]}
                            style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                            validateTrigger="onBlur"
                          >
                            <div style="display:flex;align-items:center;white-space:nowrap;border:1px solid #d9d9d9;border-radius:4px;overflow:hidden">
                              <InputNumber
                                v-model={[dynamicForm.rules[ruleIndex].ruleConditionExps![expIndex].delayTime, "value"]}
                                min={0}
                                placeholder="0"
                                style="width: 100px;border:none;margin:0;height:32px;line-height:32px;box-sizing:border-box"
                              />
                              <span style="padding:0 12px;height:32px;display:flex;align-items:center;background:#f5f5f5;border-left:1px solid #d9d9d9">
                                秒
                              </span>
                            </div>
                          </FormItem>
                        </Col>

                        {/* 操作按钮 */}
                        {expIndex === 0 && (
                          <Col style="display:flex;align-items:center;margin-right:16px">
                            <Button
                              type="link"
                              style={{ color: "#00ba8b", height: "32px", lineHeight: "32px" }}
                              onClick={() => addExpression(ruleIndex)}
                            >
                              添加
                            </Button>
                          </Col>
                        )}

                        {expIndex > 0 && (
                          <Col style="display:flex;align-items:center;margin-right:16px">
                            <Button
                              type="link"
                              danger
                              style={{ height: "32px", lineHeight: "32px" }}
                              onClick={() => deleteExpression(ruleIndex, expIndex)}
                            >
                              删除条件
                            </Button>
                          </Col>
                        )}

                        {expIndex === 0 && (
                          <Col style="display:flex;align-items:center">
                            <Button type="link" danger style={{ height: "32px", lineHeight: "32px" }} onClick={() => deleteRule(ruleIndex)}>
                              删除规则
                            </Button>
                          </Col>
                        )}
                      </Row>
                    ))}
                  </div>
                )}

                {/* 事件条件配置 */}
                {rule.conditionType === "DEVICE_EVENT_CONDITION" && (
                  <Row gutter={16} align="middle" style="min-height:32px;overflow:visible">
                    {/* 条件类型选择 */}
                    <Col style="margin-right:16px;width:180px">
                      <FormItem
                        rules={[{ required: true, message: "请选择条件类型" }]}
                        style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                        validateTrigger="onBlur"
                      >
                        <Select
                          v-model={[dynamicForm.rules[ruleIndex].conditionType, "value"]}
                          options={conditionTypeOptions}
                          placeholder="请选择条件类型"
                          style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                          onChange={(value: string) => handleConditionTypeChange(value, ruleIndex)}
                          allowClear={false}
                        />
                      </FormItem>
                    </Col>

                    {/* 事件选择 */}
                    <Col style="margin-right:16px;width:180px">
                      <FormItem
                        rules={[{ required: true, message: "请选择设备事件" }]}
                        style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                        validateTrigger="onBlur"
                      >
                        <Select
                          v-model={[dynamicForm.rules[ruleIndex].deviceEventCode, "value"]}
                          options={deviceEventOptions.value}
                          fieldNames={{ label: "label", value: "value" }}
                          placeholder="请选择设备事件"
                          style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                          onChange={(value: string) => handleDeviceEventChange(value, ruleIndex)}
                          allowClear={false}
                          showSearch
                        />
                      </FormItem>
                    </Col>

                    {/* 删除规则按钮 */}
                    <Col style="display:flex;align-items:center">
                      <Button type="link" danger style={{ height: "32px", lineHeight: "32px" }} onClick={() => deleteRule(ruleIndex)}>
                        删除规则
                      </Button>
                    </Col>
                  </Row>
                )}

                {/* 未选择条件类型 */}
                {!rule.conditionType && (
                  <Row gutter={16} align="middle" style="min-height:32px;overflow:visible">
                    <Col style="width:180px">
                      <FormItem
                        rules={[{ required: true, message: "请选择条件类型" }]}
                        style="margin:0;display:inline-block;height:32px;line-height:32px;width:180px;overflow:visible"
                        validateTrigger="onBlur"
                      >
                        <Select
                          v-model={[dynamicForm.rules[ruleIndex].conditionType, "value"]}
                          options={conditionTypeOptions}
                          placeholder="请选择条件类型"
                          style="width: 180px;height:32px;line-height:32px;box-sizing:border-box"
                          onChange={(value: string) => handleConditionTypeChange(value, ruleIndex)}
                          allowClear={false}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                )}
              </FormItem>
            </div>
          ))}
        </Form>
      </>
    );
  },
});

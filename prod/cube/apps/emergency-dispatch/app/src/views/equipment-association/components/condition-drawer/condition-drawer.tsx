import { MinusCircleOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, h, ref, watch, type Component } from "vue";

import { AreaTreeSelect, EquipmentSelect, ProductSelect } from "@ghcloud/cube-app-design";
import {
  EquipmentAssociationFiled,
  EquipmentAssociationOperator,
  type EquipmentAssociationRuleField,
} from "@ghcloud/cube-iot-center-service";
import { Button, Divider, Drawer, Empty, PlusOutlined, Select } from "@ghcloud/cube-ui";

import styles from "./condition-drawer.module.less";

interface Props {
  visible: boolean;
  value: EquipmentAssociationRuleField[][];
}

export const ConditionDrawer = defineComponent({
  props: ["visible", "value"],
  emits: ["update:value", "update:visible"],
  setup: (props: Props, { emit }) => {
    const fileDefaultOptions = [
      { label: "产品", value: EquipmentAssociationFiled.Product },
      { label: "区域", value: EquipmentAssociationFiled.Area },
      { label: "设备", value: EquipmentAssociationFiled.Equipment },
    ];

    const fieldOptions = computed(() => {
      return function (item: EquipmentAssociationRuleField[], selfValue: EquipmentAssociationFiled): typeof fileDefaultOptions {
        return fileDefaultOptions.filter((option) => {
          return !item.some((rule) => rule.field === option.value) || option.value === selfValue;
        });
      };
    });

    const ruleItemComponents: Record<EquipmentAssociationFiled, Component> = {
      [EquipmentAssociationFiled.Product]: ProductSelect,
      [EquipmentAssociationFiled.Area]: AreaTreeSelect,
      [EquipmentAssociationFiled.Equipment]: EquipmentSelect,
    };

    const conditionGroup = ref<EquipmentAssociationRuleField[][]>(props.value);

    watch(
      () => props.value,
      () => {
        conditionGroup.value = props.value;
      },
      { deep: true, immediate: true },
    );

    return (): JSX.Element => (
      <Drawer
        closable={false}
        style={{ position: "absolute" }}
        visible={props.visible}
        title="筛选条件"
        placement="top"
        get-container={false}
        onClose={() => {
          emit("update:visible", false);
        }}
      >
        <div class={styles["condition-groups"]}>
          {conditionGroup.value.map((item, index) => (
            <>
              <Divider v-show={index !== 0}>或</Divider>
              {item.map((rule, ruleIndex) => (
                <div key={ruleIndex} class={styles["condition-item"]}>
                  <MinusCircleOutlined
                    class={styles["minus-icon"]}
                    onClick={() => {
                      const newConditionGroup = [...conditionGroup.value];
                      newConditionGroup[index].splice(ruleIndex, 1);
                      if (newConditionGroup[index].length === 0) {
                        newConditionGroup.splice(index, 1);
                      }
                      emit("update:value", newConditionGroup);
                    }}
                  />
                  <span style={{ marginRight: "10px" }}>{ruleIndex === 0 ? "当" : "且"}</span>
                  <Select
                    style={{ width: "150px", marginRight: "10px" }}
                    placeholder="请选择"
                    options={fieldOptions.value(item, rule.field)}
                    v-model:value={rule.field}
                    onChange={() => {
                      rule.value.length = 0;
                      emit("update:value", conditionGroup.value);
                    }}
                  />
                  <Select
                    style={{ width: "150px", margin: "0 10px" }}
                    placeholder="请选择"
                    options={[
                      { label: "包含", value: EquipmentAssociationOperator.In },
                      { label: "不包含", value: EquipmentAssociationOperator.NotIn },
                    ]}
                    v-model:value={rule.operator}
                    onChange={() => {
                      emit("update:value", conditionGroup.value);
                    }}
                  />
                  {h(ruleItemComponents[rule.field], {
                    style: { flex: 1 },
                    multiple: true,
                    value: rule.value,
                    "onUpdate:value": (value: string[]) => {
                      const newConditionGroup = JSON.parse(JSON.stringify(conditionGroup.value)) as EquipmentAssociationRuleField[][];
                      newConditionGroup[index][ruleIndex].value = value;
                      emit("update:value", newConditionGroup);
                    },
                  })}
                </div>
              ))}
              <Button
                v-show={item.length !== fileDefaultOptions.length}
                type="link"
                v-slots={{
                  icon: () => <PlusOutlined />,
                }}
                style={{ paddingLeft: "0" }}
                onClick={() => {
                  const field = fileDefaultOptions.find((option) => {
                    return !item.some((rule) => rule.field === option.value);
                  });
                  if (field) {
                    const newConditionGroup = [...conditionGroup.value];
                    newConditionGroup[index].push({
                      field: field.value,
                      operator: EquipmentAssociationOperator.In,
                      value: [],
                    });
                    emit("update:value", newConditionGroup);
                  }
                }}
              >
                添加规则
              </Button>
            </>
          ))}
          {conditionGroup.value.length === 0 ? <Empty description="暂无筛选条件，你可以通过 添加条件组 来增加条件" /> : null}
        </div>
        <Button
          block
          onClick={() => {
            const newConditionGroup = [...conditionGroup.value];
            newConditionGroup.push([
              {
                field: EquipmentAssociationFiled.Product,
                operator: EquipmentAssociationOperator.In,
                value: [],
              },
            ]);
            emit("update:value", newConditionGroup);
          }}
        >
          添加条件组
        </Button>
      </Drawer>
    );
  },
});

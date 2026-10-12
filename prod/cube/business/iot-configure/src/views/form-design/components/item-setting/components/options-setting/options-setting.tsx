import styles from "./options-setting.module.less";
import { useFormDesignStore } from "@/pinia-store/form-design";
import { WidgetUI } from "@/views/form-design/core/widget-ui/widget-ui";
import { Button, Input, Modal, Select, Space } from "@ghcloud/cube-ui";
import RadioGroup from "@ghcloud/cube-ui/src/components/radio-group/radio-group";
import { computed, defineComponent, ref } from "vue";

interface OptionItem {
  label: string;
  value: number;
  condition: {
    type: "ALWAYS" | "CONDITION";
    value?: [string | undefined, string, unknown];
  };
}

export const OptionsSetting = defineComponent({
  setup() {
    const { formDesign } = useFormDesignStore();
    const options = computed(() => formDesign.formItemSelect!.props.options as unknown as OptionItem[]);
    const conditionVisible = ref(false);
    const conditionModalTitle = ref("");
    const setOptionIndex = ref(0);
    return (): JSX.Element => (
      <>
        {options.value?.map((option, index) => (
          <div key={index} class={styles["option-item"]}>
            <Input v-model:value={option.label} showCount={false} />
            <Space>
              {index + 1 < options.value.length && (
                <Button
                  type="primary"
                  onClick={() => {
                    options.value.splice(index, 1);
                  }}
                  danger
                >
                  删除
                </Button>
              )}
              {index + 1 === options.value.length && (
                <Button
                  type="primary"
                  onClick={() => {
                    options.value.push({
                      label: "新增选项",
                      value: options.value.length + 1,
                      condition: { type: "ALWAYS" },
                    });
                    options.value.forEach((e, i) => {
                      e.value = i + 1;
                    });
                  }}
                >
                  添加
                </Button>
              )}
              <Button
                type="primary"
                ghost
                onClick={() => {
                  if (!option.condition) {
                    options.value[index].condition = { type: "ALWAYS" };
                  }
                  options.value[index].condition;
                  setOptionIndex.value = index;
                  conditionModalTitle.value = formDesign.formItemSelect?.label + "-" + option.label + "的显示条件";
                  conditionVisible.value = true;
                }}
              >
                显示条件
              </Button>
            </Space>
          </div>
        ))}
        <Modal title={conditionModalTitle.value} v-model:visible={conditionVisible.value} footer={null}>
          {options.value.length > setOptionIndex.value && (
            <>
              <RadioGroup
                style={{ marginBottom: "10px", display: "block" }}
                options={[
                  { label: "总是显示", value: "ALWAYS" },
                  { label: "条件显示", value: "CONDITION" },
                ]}
                v-model:value={options.value[setOptionIndex.value].condition.type}
                onChange={() => {
                  options.value[setOptionIndex.value].condition.value = [undefined, "EQ", undefined];
                }}
              />
              {options.value[setOptionIndex.value].condition.type === "CONDITION" && (
                <>
                  <Space>
                    <span>当表单项</span>
                    <Select
                      style={{ width: "100px" }}
                      options={formDesign.formList.filter((e) => e.key !== formDesign.formItemSelect?.key)}
                      fieldNames={{ label: "label", value: "key" }}
                      v-model:value={options.value[setOptionIndex.value].condition.value![0]}
                      onChange={(val) => {
                        options.value[setOptionIndex.value].condition.value = [val, "EQ", undefined];
                      }}
                    />
                    <span>的值</span>
                    <Select
                      style={{ width: "100px" }}
                      options={[
                        { label: "等于", value: "EQ" },
                        { label: "不等于", value: "NEQ" },
                        { label: "包含", value: "IN" },
                        { label: "不包含", value: "NOT_IN" },
                      ]}
                      v-model:value={options.value[setOptionIndex.value].condition.value![1]}
                    />
                    {formDesign.formList.find((e) => e.key === options.value[setOptionIndex.value].condition.value![0]) && (
                      <>
                        <WidgetUI
                          style={{ minWidth: "220px" }}
                          formItem={formDesign.formList.find((e) => e.key === options.value[setOptionIndex.value].condition.value![0])}
                          v-model:value={options.value[setOptionIndex.value].condition.value![2]}
                        />
                        <span>时显示</span>
                      </>
                    )}
                  </Space>
                  <p>{JSON.stringify(options.value[setOptionIndex.value].condition?.value)}</p>
                </>
              )}
            </>
          )}
        </Modal>
      </>
    );
  },
});

import { type Component, computed, defineComponent, h, resolveDynamicComponent } from "vue";

import { Form, FormItem, Button, Space, DownOutlined, UpOutlined } from "@ghcloud/cube-ui";

import { formComponents } from "./base-form-components";
import type { FormApi } from "./form-api";
import { useFormHooks } from "./use-form.hook";

import styles from "./form-ui.module.less";

const resolveComponentName = (component: string | Component): string => {
  if (typeof component === "string") {
    return component;
  }
  const runtimeName =
    (component as { name?: string; displayName?: string; __name?: string }).name ??
    (component as { name?: string; displayName?: string; __name?: string }).displayName ??
    (component as { name?: string; displayName?: string; __name?: string }).__name ??
    "";
  if (/input/i.test(runtimeName)) {
    return "Input";
  }
  if (/select/i.test(runtimeName)) {
    return "Select";
  }
  if (/picker/i.test(runtimeName)) {
    return "Picker";
  }
  return runtimeName || "CustomComponent";
};
export const createFormComponent = (formApi: FormApi): typeof CubeForm => {
  const CubeForm = defineComponent({
    components: {
      ...formComponents,
    },
    setup: () => {
      const { columns } = useFormHooks();
      const processedFieldValues = new Map<string, unknown>();
      let clearProcessedFieldsScheduled = false;

      const markFieldProcessed = (fieldName: string, value: unknown): void => {
        processedFieldValues.set(fieldName, value);
        if (clearProcessedFieldsScheduled) {
          return;
        }
        clearProcessedFieldsScheduled = true;
        void Promise.resolve().then(() => {
          processedFieldValues.clear();
          clearProcessedFieldsScheduled = false;
        });
      };

      const isDuplicateFieldValue = (fieldName: string, value: unknown): boolean => {
        return processedFieldValues.has(fieldName) && Object.is(processedFieldValues.get(fieldName), value);
      };

      // 动态生成组件
      const resolveDynamicComponents = (component: { is: string | Component; fieldName: string; props: unknown }): Component => {
        if (typeof component.is === "string" && !formComponents[component.is]) {
          return () => <div>组件未注册!</div>;
        }
        const style = (component.props as { styles: Record<string, string> }).styles ?? {};
        const props = component.props ?? {};
        const resolveComponent = resolveDynamicComponent(component.is) as unknown as string | Component;
        const componentName = resolveComponentName(component.is);
        const isInputComponent = componentName === "Input";
        const normalizedProps = props as Record<string, unknown>;
        const hasCustomOnChange = typeof normalizedProps.onChange === "function";
        const syncAndMaybeQuery = (trigger: "change" | "enter"): void => {
          formApi.handleValuesChange(
            { [component.fieldName]: formApi.formValues[component.fieldName] },
            {
              fieldName: component.fieldName,
              component: componentName,
              trigger,
              hasCustomOnChange,
            },
          );
        };
        const updateFieldValue = (value: unknown): void => {
          formApi.formValues[component.fieldName] = value;
        };
        return h(resolveComponent, {
          ...(props as Record<string, unknown>),
          value: formApi.formValues[component.fieldName],
          modelValue: formApi.formValues[component.fieldName],
          "onUpdate:value": (value: unknown) => {
            updateFieldValue(value);
            if (!isInputComponent) {
              if (isDuplicateFieldValue(component.fieldName, value)) {
                return;
              }
              markFieldProcessed(component.fieldName, value);
              syncAndMaybeQuery("change");
            }
          },
          "onUpdate:modelValue": (value: unknown) => {
            updateFieldValue(value);
            if (!isInputComponent) {
              if (isDuplicateFieldValue(component.fieldName, value)) {
                return;
              }
              markFieldProcessed(component.fieldName, value);
              syncAndMaybeQuery("change");
            }
          },
          checked: formApi.formValues[component.fieldName],
          "onUpdate:checked": (value: unknown) => {
            updateFieldValue(value);
            if (!isInputComponent) {
              if (isDuplicateFieldValue(component.fieldName, value)) {
                return;
              }
              markFieldProcessed(component.fieldName, value);
              syncAndMaybeQuery("change");
            }
          },
          onPressEnter: (...args: unknown[]) => {
            const onPressEnter = normalizedProps.onPressEnter as ((...eventArgs: unknown[]) => void) | undefined;
            onPressEnter?.(...args);
            if (isInputComponent) {
              const currentValue = formApi.formValues[component.fieldName];
              if (isDuplicateFieldValue(component.fieldName, currentValue)) {
                return;
              }
              markFieldProcessed(component.fieldName, currentValue);
              syncAndMaybeQuery("enter");
            }
          },
          onChange: (value: unknown) => {
            const { onChange } = props as { onChange: (value: unknown) => void };
            onChange?.(value);
          },
          style: {
            ...style,
          },
        });
      };
      // 是否展示折叠按钮
      const showCollapseButton = computed(() => {
        const showCollapse = columns.value < formApi.state.schema.length;
        return showCollapse ? formApi.state.showCollapseButton : showCollapse;
      });
      return (): JSX.Element => (
        <Form layout={formApi.state.layout} ref={formApi.formRef} model={formApi.formValues}>
          <div class={styles["cube-query-form-header"]}>
            <div class={styles["cube-query-form-container"]} id="cube-query-form-container">
              {formApi.getFormSchema(columns.value).map((item) => {
                const fieldRules = item.rules === undefined ? undefined : Array.isArray(item.rules) ? item.rules : [item.rules];
                return (
                  <FormItem
                    key={item.fieldName}
                    class="cube-design-form-item"
                    style={item?.style}
                    label={item.label}
                    name={item.fieldName}
                    rules={fieldRules}
                  >
                    {resolveDynamicComponents({ is: item.component, fieldName: item.fieldName, props: { ...item.componentProps } })}
                  </FormItem>
                );
              })}
              {formApi.state.showButton && (
                <FormItem class="cube-design-form-item">
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => {
                        formApi.handleSubmit();
                      }}
                    >
                      查询
                    </Button>
                    <Button
                      onClick={() => {
                        formApi.handleReset();
                      }}
                    >
                      重置
                    </Button>
                  </Space>
                </FormItem>
              )}
            </div>
            {formApi.state.showButton && (
              <div class={styles["cube-query-form-operations"]}>
                <FormItem class="cube-design-form-item">
                  <Space>
                    {showCollapseButton.value && (
                      <Button
                        type="link"
                        onClick={() => {
                          formApi.toggleCollapse();
                        }}
                      >
                        {formApi.state.isCollapsed ? "展开" : "收起"}
                        {formApi.state.isCollapsed ? <DownOutlined /> : <UpOutlined />}
                      </Button>
                    )}
                  </Space>
                </FormItem>
              </div>
            )}
          </div>
        </Form>
      );
    },
  });
  return CubeForm;
};

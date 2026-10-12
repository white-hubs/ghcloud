import {
  DailyTaskResponsibleObjectSelect,
  type ResponsibleValidateResult,
  type SelectOptionItem,
} from "../daily-task-responsible-object-select";
import styles from "./index.module.less";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, type PropType, watch, type ComponentPublicInstance } from "vue";

// 负责对象数据接口
export interface ResponsibleObjectItem {
  key: string;
  type: "USER" | "CONDITION";
  userIds: string[];
  userOptions: SelectOptionItem[];
  exceptionUserIds: string[];
  exceptionUserOptions: SelectOptionItem[];
  deptIds: string[];
  deptOptions: SelectOptionItem[];
  postIds: string[];
  postOptions: SelectOptionItem[];
  roleIds: string[];
  roleOptions: SelectOptionItem[];
  gridAreaIds: string[];
  gridAreaOptions: SelectOptionItem[];
}

export interface ListValidateResult {
  valid: boolean;
  message?: string;
}

/** 任务责任对象列表组件 */
export const DailyTaskResponsibleObjectList = defineComponent({
  props: {
    value: {
      type: Array as PropType<ResponsibleObjectItem[]>,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:value"],
  setup: (props, { emit, expose }) => {
    const responsibleObjectList = ref<ResponsibleObjectItem[]>(props.value || []);
    const formState = reactive<{
      responsibleObjectList: ResponsibleObjectItem[];
    }>({
      responsibleObjectList: props.value || [],
    });

    watch(
      () => props.value,
      (newValue) => {
        responsibleObjectList.value = newValue || [];
        formState.responsibleObjectList = newValue || [];
      },
      { deep: true, immediate: true },
    );

    watch(
      () => formState.responsibleObjectList,
      (newValue) => {
        emit("update:value", newValue);
      },
      { deep: true },
    );

    const addItem = (): void => {
      const newItem: ResponsibleObjectItem = {
        key: `${Date.now()}-${Math.random()}`,
        type: "USER",
        userIds: [],
        userOptions: [],
        exceptionUserIds: [],
        exceptionUserOptions: [],
        deptIds: [],
        deptOptions: [],
        postIds: [],
        postOptions: [],
        roleIds: [],
        roleOptions: [],
        gridAreaIds: [],
        gridAreaOptions: [],
      };
      responsibleObjectList.value.push(newItem);
      formState.responsibleObjectList = [...responsibleObjectList.value];
    };

    const removeItem = (index: number): void => {
      responsibleObjectList.value.splice(index, 1);
      formState.responsibleObjectList = [...responsibleObjectList.value];
    };

    const updateItem = (index: number, field: keyof ResponsibleObjectItem, value: unknown): void => {
      if (responsibleObjectList.value[index]) {
        (responsibleObjectList.value[index] as Record<string, unknown>)[field] = value;
        formState.responsibleObjectList = [...responsibleObjectList.value];
      }
    };

    // 初始化时如果没有数据，添加一个默认项
    if (responsibleObjectList.value.length === 0) {
      addItem();
    }

    // 存储子组件引用
    type SelectInstance = ComponentPublicInstance & { validate: () => ResponsibleValidateResult };
    const itemRefs = ref<Map<string, SelectInstance>>(new Map());

    const setItemRef =
      (key: string) =>
      (el: Element | ComponentPublicInstance | null): void => {
        if (el && "$" in el) {
          itemRefs.value.set(key, el as SelectInstance);
        } else {
          itemRefs.value.delete(key);
        }
      };

    /** 验证所有项（子组件会自行显示错误提示） */
    const validate = (): ListValidateResult => {
      const list = formState.responsibleObjectList;

      if (list.length === 0) {
        return { valid: false, message: "请至少添加一个责任对象配置" };
      }

      let allValid = true;
      // 遍历所有项，调用每个子组件的 validate 方法触发错误提示显示
      list.forEach((item) => {
        const itemRef = itemRefs.value.get(item.key);
        if (itemRef?.validate) {
          const result = itemRef.validate();
          if (!result.valid) {
            allValid = false;
          }
        }
      });

      return { valid: allValid };
    };

    expose({
      validate,
    });

    return (): JSX.Element => (
      <div class={styles.container}>
        {formState.responsibleObjectList.map((item, index) => (
          <div key={item.key} class={styles.itemContainer}>
            <div class={styles.itemContent}>
              <DailyTaskResponsibleObjectSelect
                ref={setItemRef(item.key)}
                type={item.type}
                userIds={item.userIds}
                userOptions={item.userOptions}
                exceptionUserIds={item.exceptionUserIds}
                exceptionUserOptions={item.exceptionUserOptions}
                deptIds={item.deptIds}
                deptOptions={item.deptOptions}
                postIds={item.postIds}
                postOptions={item.postOptions}
                roleIds={item.roleIds}
                roleOptions={item.roleOptions}
                gridAreaIds={item.gridAreaIds}
                gridAreaOptions={item.gridAreaOptions}
                disabled={props.disabled}
                onUpdate:type={(v) => updateItem(index, "type", v)}
                onUpdate:userIds={(v) => updateItem(index, "userIds", v)}
                onUpdate:userOptions={(v) => updateItem(index, "userOptions", v)}
                onUpdate:exceptionUserIds={(v) => updateItem(index, "exceptionUserIds", v)}
                onUpdate:exceptionUserOptions={(v) => updateItem(index, "exceptionUserOptions", v)}
                onUpdate:deptIds={(v) => updateItem(index, "deptIds", v)}
                onUpdate:deptOptions={(v) => updateItem(index, "deptOptions", v)}
                onUpdate:postIds={(v) => updateItem(index, "postIds", v)}
                onUpdate:postOptions={(v) => updateItem(index, "postOptions", v)}
                onUpdate:roleIds={(v) => updateItem(index, "roleIds", v)}
                onUpdate:roleOptions={(v) => updateItem(index, "roleOptions", v)}
                onUpdate:gridAreaIds={(v) => updateItem(index, "gridAreaIds", v)}
                onUpdate:gridAreaOptions={(v) => updateItem(index, "gridAreaOptions", v)}
              />
            </div>
            {!props.disabled && (
              <div class={styles.actionButton}>
                {index === 0 ? (
                  <PlusCircleOutlined title="添加" onClick={addItem} style={{ color: "#00ba8b", fontSize: "20px", cursor: "pointer" }} />
                ) : (
                  <MinusCircleOutlined
                    title="移除"
                    onClick={() => removeItem(index)}
                    style={{ color: "#f5222d", fontSize: "20px", cursor: "pointer" }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
});

import { type RadioChangeEvent, RadioGroup } from "ant-design-vue";
import { defineComponent, type PropType } from "vue";

import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { PostSelect } from "../../ouaa-components/post-select";
import { RoleSelect } from "../../ouaa-components/role-select";
import { UserSelect } from "../../ouaa-components/user-select";
import { receiveTypeOptions } from "./constant";

import styles from "./index.module.less";
export const PersonLiableSelectCheck = defineComponent({
  props: {
    value: {
      type: String,
      default: "1",
    },
    checkUserIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    checkDeptIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    checkPostIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    checkRoleIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    treeDefaultExpandAll: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:value", "update:checkUserIds", "update:checkDeptIds", "update:checkPostIds", "update:checkRoleIds"],
  setup:
    (props, { emit }) =>
    (): JSX.Element => (
      <div class={styles.container}>
        <RadioGroup
          style={{ flexShrink: 0 }}
          buttonStyle="solid"
          optionType="button"
          onChange={(e: RadioChangeEvent) => {
            emit("update:value", e.target.value);
          }}
          value={props.value}
          options={receiveTypeOptions}
        />
        <div class={styles.selectContainer}>
          {props.value === "2" && (
            <>
              <DeptCascaderSelect
                placeholder="请选择部门"
                treeDefaultExpandAll={props.treeDefaultExpandAll}
                v-model:value={props.checkDeptIds}
                onUpdate:value={(v) => {
                  emit("update:checkDeptIds", v);
                }}
              />
              <PostSelect
                v-model:value={props.checkPostIds}
                onUpdate:value={(v) => {
                  emit("update:checkPostIds", v);
                }}
              />
              <RoleSelect
                v-model:value={props.checkRoleIds}
                onUpdate:value={(v) => {
                  emit("update:checkRoleIds", v);
                }}
              />
            </>
          )}
          {props.value === "1" && (
            <UserSelect
              multiple
              v-model:value={props.checkUserIds}
              onUpdate:value={(v) => {
                emit("update:checkUserIds", v);
              }}
            />
          )}
        </div>
      </div>
    ),
});

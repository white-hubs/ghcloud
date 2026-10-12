import { type RadioChangeEvent, RadioGroup } from "ant-design-vue";
import { defineComponent, type PropType } from "vue";

import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { PostSelect } from "../../ouaa-components/post-select";
import { RoleSelect } from "../../ouaa-components/role-select";
import { UserSelect } from "../../ouaa-components/user-select";
import { receiveTypeOptions } from "./constant";

import styles from "./index.module.less";
export const PersonLiableSelect = defineComponent({
  props: {
    value: {
      type: String,
      default: "1",
    },
    receiveIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    receiveDeptIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    receivePostIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    receiveRoleIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    treeDefaultExpandAll: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:value", "update:receiveIds", "update:receiveDeptIds", "update:receivePostIds", "update:receiveRoleIds"],
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
                v-model:value={props.receiveDeptIds}
                onUpdate:value={(v) => {
                  emit("update:receiveDeptIds", v);
                }}
              />
              <PostSelect
                v-model:value={props.receivePostIds}
                onUpdate:value={(v) => {
                  emit("update:receivePostIds", v);
                }}
              />
              <RoleSelect
                v-model:value={props.receiveRoleIds}
                onUpdate:value={(v) => {
                  emit("update:receiveRoleIds", v);
                }}
              />
            </>
          )}
          {props.value === "1" && (
            <UserSelect
              multiple
              v-model:value={props.receiveIds}
              onUpdate:value={(v) => {
                emit("update:receiveIds", v);
              }}
            />
          )}
        </div>
      </div>
    ),
});

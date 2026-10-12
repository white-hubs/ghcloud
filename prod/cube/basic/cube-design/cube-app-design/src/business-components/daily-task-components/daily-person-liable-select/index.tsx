import { DeptSelect } from "../../ouaa-components/dept-select";
import { PostSelect } from "../../ouaa-components/post-select";
import { RoleSelect } from "../../ouaa-components/role-select";
import { UserSelect } from "../../ouaa-components/user-select";
import { ReceiveTypeOptions } from "./constant";
import styles from "./index.module.less";
import { Select } from "ant-design-vue";
import { defineComponent, type PropType } from "vue";
export const DailyPersonLiableSelect = defineComponent({
  props: {
    value: {
      type: String,
      default: "USER",
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
  },
  emits: ["update:value", "update:receiveIds", "update:receiveDeptIds", "update:receivePostIds", "update:receiveRoleIds"],
  setup:
    (props, { emit }) =>
    (): JSX.Element => (
      <div class={styles.container}>
        <Select
          v-model:value={props.value}
          onUpdate:value={(v) => {
            emit("update:value", v);
          }}
          style={{ width: "100px" }}
          options={ReceiveTypeOptions}
          placeholder="请选人员"
          allowClear
        />
        {/* <RadioGroup
          style={{ flexShrink: 0 }}
          buttonStyle='solid'
          optionType='button'
          onChange={(e: RadioChangeEvent) => {
            emit('update:value', e.target.value)
          }}
          value={props.value} options={ReceiveTypeOptions}
        /> */}
        <div class={styles.selectContainer}>
          {props.value === "USER" && (
            <UserSelect
              multiple
              v-model:value={props.receiveIds}
              onUpdate:value={(v) => {
                emit("update:receiveIds", v);
              }}
            />
          )}
          {props.value === "DEPT" && (
            <DeptSelect
              multiple
              v-model:value={props.receiveDeptIds}
              onUpdate:value={(v) => {
                emit("update:receiveDeptIds", v);
              }}
            />
          )}
          {props.value === "POST" && (
            <PostSelect
              multiple
              v-model:value={props.receivePostIds}
              onUpdate:value={(v) => {
                emit("update:receivePostIds", v);
              }}
            />
          )}
          {props.value === "ROLE" && (
            <RoleSelect
              multiple
              v-model:value={props.receiveRoleIds}
              onUpdate:value={(v) => {
                emit("update:receiveRoleIds", v);
              }}
            />
          )}
          {/* {
            props.value === 'DEPT' &&
            <>
              <DeptSelect
                v-model:value={props.receiveDeptIds} onUpdate:value={(v) => {
                  emit('update:receiveDeptIds', v)
                }}
              />
              <PostSelect
                v-model:value={props.receivePostIds} onUpdate:value={(v) => {
                  emit('update:receivePostIds', v)
                }}
              />
              <RoleSelect
                v-model:value={props.receiveRoleIds} onUpdate:value={(v) => {
                  emit('update:receiveRoleIds', v)
                }}
              />
            </>
          } */}
        </div>
      </div>
    ),
});

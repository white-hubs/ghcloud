import { GridAreaTreeSelect } from "../../grid-area-tree-select/grid-area-tree-select";
import { DeptSelect } from "../../ouaa-components/dept-select";
import { PostSelect } from "../../ouaa-components/post-select";
import { RoleSelect } from "../../ouaa-components/role-select";
import { UserSelect } from "../../ouaa-components/user-select";
import { ResponsibleObjectTypeOptions } from "./constant";
import styles from "./index.module.less";
import { Select } from "ant-design-vue";
import { defineComponent, type PropType, reactive } from "vue";

export interface ResponsibleValidateResult {
  valid: boolean;
  message?: string;
}

/** 选项项（包含 id 和 name） */
export interface SelectOptionItem {
  id: string;
  name: string;
}

/** 字段验证状态 */
interface FieldValidateState {
  status: "" | "error";
  message: string;
}

export const DailyTaskResponsibleObjectSelect = defineComponent({
  props: {
    // 第一项选择类型：USER（人员）或 CONDITION（按条件多选）
    type: {
      type: String,
      default: "USER",
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 人员模式：选择的人员ID列表
    userIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    // 人员模式：选择的人员选项列表（包含 id 和 name）
    userOptions: {
      type: Array as PropType<SelectOptionItem[]>,
      default: () => [],
    },
    // 人员模式：异常任务时选择的人员ID列表
    exceptionUserIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    // 人员模式：异常任务时选择的人员选项列表
    exceptionUserOptions: {
      type: Array as PropType<SelectOptionItem[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的部门ID列表
    deptIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的部门选项列表
    deptOptions: {
      type: Array as PropType<SelectOptionItem[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的岗位ID列表
    postIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的岗位选项列表
    postOptions: {
      type: Array as PropType<SelectOptionItem[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的角色ID列表
    roleIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的角色选项列表
    roleOptions: {
      type: Array as PropType<SelectOptionItem[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的网格区域ID列表
    gridAreaIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    // 按条件多选模式：选择的网格区域选项列表
    gridAreaOptions: {
      type: Array as PropType<SelectOptionItem[]>,
      default: () => [],
    },
  },
  emits: [
    "update:type",
    "update:userIds",
    "update:userOptions",
    "update:exceptionUserIds",
    "update:exceptionUserOptions",
    "update:deptIds",
    "update:deptOptions",
    "update:postIds",
    "update:postOptions",
    "update:roleIds",
    "update:roleOptions",
    "update:gridAreaIds",
    "update:gridAreaOptions",
  ],
  setup: (props, { emit, expose }) => {
    // 各字段的验证状态
    // 部门/岗位/角色 共用一个验证状态
    const validateState = reactive<{
      type: FieldValidateState;
      userIds: FieldValidateState;
      condition: FieldValidateState;
      exceptionUserIds: FieldValidateState;
    }>({
      type: { status: "", message: "" },
      userIds: { status: "", message: "" },
      condition: { status: "", message: "" },
      exceptionUserIds: { status: "", message: "" },
    });

    /** 清除所有验证状态 */
    const clearValidate = (): void => {
      validateState.type = { status: "", message: "" };
      validateState.userIds = { status: "", message: "" };
      validateState.condition = { status: "", message: "" };
      validateState.exceptionUserIds = { status: "", message: "" };
    };

    /** 从选中的选项中提取选项列表 */
    const extractOptions = (options: unknown): SelectOptionItem[] => {
      if (!options) {
        return [];
      }
      if (Array.isArray(options)) {
        return options
          .map((opt: { id?: string; name?: string }) => ({
            id: String(opt.id ?? ""),
            name: String(opt.name ?? ""),
          }))
          .filter((opt) => opt.id);
      }
      const opt = options as { id?: string; name?: string };
      if (opt.id) {
        return [{ id: String(opt.id), name: String(opt.name ?? "") }];
      }
      return [];
    };

    /** 切换类型时清空不相关数据 */
    const handleTypeChange = (value: unknown): void => {
      const newType = value as string | undefined;
      emit("update:type", newType);
      // 切换类型时清除验证状态
      clearValidate();

      if (newType === "USER") {
        // 切换到 USER 模式，清空 CONDITION 相关数据
        emit("update:deptIds", []);
        emit("update:deptOptions", []);
        emit("update:postIds", []);
        emit("update:postOptions", []);
        emit("update:roleIds", []);
        emit("update:roleOptions", []);
        emit("update:gridAreaIds", []);
        emit("update:gridAreaOptions", []);
      } else if (newType === "CONDITION") {
        // 切换到 CONDITION 模式，清空 USER 相关数据
        emit("update:userIds", []);
        emit("update:userOptions", []);
      } else {
        // 清空类型时，清空所有数据
        emit("update:userIds", []);
        emit("update:userOptions", []);
        emit("update:deptIds", []);
        emit("update:deptOptions", []);
        emit("update:postIds", []);
        emit("update:postOptions", []);
        emit("update:roleIds", []);
        emit("update:roleOptions", []);
        emit("update:gridAreaIds", []);
        emit("update:gridAreaOptions", []);
        emit("update:exceptionUserIds", []);
        emit("update:exceptionUserOptions", []);
      }
    };

    /** 验证方法 */
    const validate = (): ResponsibleValidateResult => {
      // 先清除之前的验证状态
      clearValidate();

      if (!props.type) {
        validateState.type = { status: "error", message: "请选择责任对象类型" };
        return { valid: false, message: "请选择责任对象类型" };
      }

      if (props.type === "USER") {
        let hasError = false;

        if (!props.userIds || props.userIds.length === 0) {
          validateState.userIds = { status: "error", message: "请选择责任人员" };
          hasError = true;
        }
        if (!props.exceptionUserIds || props.exceptionUserIds.length === 0) {
          validateState.exceptionUserIds = { status: "error", message: "请选择异常时直接发给的人员" };
          hasError = true;
        }

        if (hasError) {
          // 返回第一个错误信息
          if (validateState.userIds.status === "error") {
            return { valid: false, message: validateState.userIds.message };
          }
          return { valid: false, message: validateState.exceptionUserIds.message };
        }
        return { valid: true };
      }

      if (props.type === "CONDITION") {
        let hasError = false;
        const hasDept = props.deptIds && props.deptIds.length > 0;
        const hasPost = props.postIds && props.postIds.length > 0;
        const hasRole = props.roleIds && props.roleIds.length > 0;
        const hasGridArea = props.gridAreaIds && props.gridAreaIds.length > 0;

        if (!hasDept && !hasPost && !hasRole && !hasGridArea) {
          validateState.condition = { status: "error", message: "请至少选择一个部门、岗位、角色或网格区域" };
          hasError = true;
        }
        if (!props.exceptionUserIds || props.exceptionUserIds.length === 0) {
          validateState.exceptionUserIds = { status: "error", message: "请选择异常时直接发给的人员" };
          hasError = true;
        }

        if (hasError) {
          if (validateState.condition.status === "error") {
            return { valid: false, message: validateState.condition.message };
          }
          return { valid: false, message: validateState.exceptionUserIds.message };
        }
        return { valid: true };
      }

      validateState.type = { status: "error", message: "请选择责任对象类型" };
      return { valid: false, message: "请选择责任对象类型" };
    };

    expose({
      validate,
      clearValidate,
    });

    return (): JSX.Element => (
      <div class={styles.container}>
        {/* 第一行：类型选择 */}
        <div class={styles.formItem}>
          <div class={[styles.firstRow, validateState.type.status === "error" ? styles.hasError : ""].filter(Boolean).join(" ")}>
            <Select
              value={props.type}
              onChange={handleTypeChange}
              style={{ width: "120px", flexShrink: 0 }}
              options={ResponsibleObjectTypeOptions}
              placeholder="请选择类型"
              allowClear
              disabled={props.disabled}
            />
          </div>
          {validateState.type.status === "error" && <div class={styles.errorMessage}>{validateState.type.message}</div>}
        </div>

        {/* 人员模式 */}
        {props.type === "USER" && (
          <div class={styles.formItem}>
            <div class={[styles.firstRow, validateState.userIds.status === "error" ? styles.hasError : ""].filter(Boolean).join(" ")}>
              <span class={styles.label}>人员：</span>
              <UserSelect
                multiple
                v-model:value={props.userIds}
                disabled={props.disabled}
                onUpdate:value={(v) => {
                  emit("update:userIds", v);
                  // 输入时清除该字段的错误状态
                  if (v && v.length > 0) {
                    validateState.userIds = { status: "", message: "" };
                  }
                }}
                onChange={(value: unknown, option: unknown) => {
                  emit("update:userOptions", extractOptions(option));
                }}
                style={{ flex: 1, minWidth: 200 }}
              />
            </div>
            {validateState.userIds.status === "error" && <div class={styles.errorMessage}>{validateState.userIds.message}</div>}
          </div>
        )}

        {/* 按条件多选模式 */}
        {props.type === "CONDITION" && (
          <div class={[styles.formItem, validateState.condition.status === "error" ? styles.hasError : ""].filter(Boolean).join(" ")}>
            {/* 第一行：部门 */}
            <div class={styles.conditionRow}>
              <span class={styles.label}>部门：</span>
              <DeptSelect
                multiple
                v-model:value={props.deptIds}
                disabled={props.disabled}
                onUpdate:value={(v) => {
                  emit("update:deptIds", v);
                  // 任一条件有值则清除错误
                  if (
                    (v && v.length > 0) ||
                    (props.postIds && props.postIds.length > 0) ||
                    (props.roleIds && props.roleIds.length > 0) ||
                    (props.gridAreaIds && props.gridAreaIds.length > 0)
                  ) {
                    validateState.condition = { status: "", message: "" };
                  }
                }}
                onChange={(value: unknown, option: unknown) => {
                  emit("update:deptOptions", extractOptions(option));
                }}
                style={{ flex: 1, minWidth: 200, width: "100%" }}
              />
            </div>
            {/* 第二行：岗位 */}
            <div class={styles.conditionRow}>
              <span class={styles.label}>岗位：</span>
              <PostSelect
                multiple
                v-model:value={props.postIds}
                disabled={props.disabled}
                onUpdate:value={(v) => {
                  emit("update:postIds", v);
                  if (
                    (v && v.length > 0) ||
                    (props.deptIds && props.deptIds.length > 0) ||
                    (props.roleIds && props.roleIds.length > 0) ||
                    (props.gridAreaIds && props.gridAreaIds.length > 0)
                  ) {
                    validateState.condition = { status: "", message: "" };
                  }
                }}
                onChange={(value: unknown, option: unknown) => {
                  emit("update:postOptions", extractOptions(option));
                }}
                style={{ flex: 1, minWidth: 200, width: "100%" }}
              />
            </div>
            {/* 第三行：角色 */}
            <div class={styles.conditionRow}>
              <span class={styles.label}>角色：</span>
              <RoleSelect
                multiple
                v-model:value={props.roleIds}
                disabled={props.disabled}
                onUpdate:value={(v) => {
                  emit("update:roleIds", v);
                  if (
                    (v && v.length > 0) ||
                    (props.deptIds && props.deptIds.length > 0) ||
                    (props.postIds && props.postIds.length > 0) ||
                    (props.gridAreaIds && props.gridAreaIds.length > 0)
                  ) {
                    validateState.condition = { status: "", message: "" };
                  }
                }}
                onChange={(value: unknown, option: unknown) => {
                  emit("update:roleOptions", extractOptions(option));
                }}
                style={{ flex: 1, minWidth: 200, width: "100%" }}
              />
            </div>
            {/* 第四行：网格区域 */}
            <div class={styles.conditionRow}>
              <span class={styles.label}>网格区域：</span>
              <GridAreaTreeSelect
                multiple
                checkable
                v-model:value={props.gridAreaIds}
                placeholder="请选择网格区域"
                readonly={props.disabled}
                onUpdate:value={(v) => {
                  emit("update:gridAreaIds", v);
                  if (
                    (v && v.length > 0) ||
                    (props.deptIds && props.deptIds.length > 0) ||
                    (props.postIds && props.postIds.length > 0) ||
                    (props.roleIds && props.roleIds.length > 0)
                  ) {
                    validateState.condition = { status: "", message: "" };
                  }
                }}
                onChange={(value: unknown, extra: unknown) => {
                  emit("update:gridAreaOptions", extractOptions(extra));
                }}
                style={{ flex: 1, minWidth: 200, width: "100%" }}
              />
            </div>
            {validateState.condition.status === "error" && <div class={styles.errorMessage}>{validateState.condition.message}</div>}
          </div>
        )}

        {/* 异常时直接发给：所有模式都显示 */}
        {props.type && (
          <div class={styles.formItem}>
            <div
              class={[styles.conditionRow, validateState.exceptionUserIds.status === "error" ? styles.hasError : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <span class={styles.label}>异常时直接发给：</span>
              <UserSelect
                multiple
                v-model:value={props.exceptionUserIds}
                disabled={props.disabled}
                onUpdate:value={(v) => {
                  emit("update:exceptionUserIds", v);
                  if (v && v.length > 0) {
                    validateState.exceptionUserIds = { status: "", message: "" };
                  }
                }}
                onChange={(value: unknown, option: unknown) => {
                  emit("update:exceptionUserOptions", extractOptions(option));
                }}
                style={{ flex: 1, minWidth: 200, width: "100%" }}
              />
            </div>
            {validateState.exceptionUserIds.status === "error" && (
              <div class={styles.errorMessage}>{validateState.exceptionUserIds.message}</div>
            )}
          </div>
        )}
      </div>
    );
  },
});

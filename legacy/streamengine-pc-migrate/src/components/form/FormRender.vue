<template>
  <!--渲染表单-->
  <a-form
    ref="formRef"
    class="process-form"
    laba-position="top"
    :model="formData"
    :rules="rules"
    :labelCol="{ style: { minWidth: '130px' } }"
    v-if="initialized"
  >
    <template v-for="(item, index) in formOptions">
      <Col :width="item.width" v-show="item.show" v-if="getPermission(item).show" :key="item.id">
        <!-- 组合容器 / hideLabel：标题在子组件内展示，外层单独收起标签列 -->
        <a-form-item
          v-if="isComboShellItem(item)"
          :name="item.id"
          :colon="false"
          :label-col="comboShellLabelCol"
          :wrapper-col="comboShellWrapperCol"
        >
          <FormItemRender
            v-model:value="formData[item.id]"
            :config="item"
            :formData="formData"
            ref="formItemRef"
            :readonly="getPermission(item).readonly"
            :formPerms="formPerms"
            :form-ref="formRef"
          />
        </a-form-item>
        <a-form-item
          v-else
          :name="item.id"
          :label="item.title"
          :class="{ 'description-component': item.name === 'Description' }"
          :labelCol="{ style: { minWidth: '130px', fontWeight: 600 } }"
        >
          <FormItemRender
            v-model:value="formData[item.id]"
            :config="item"
            :formData="formData"
            ref="formItemRef"
            :readonly="getPermission(item).readonly"
            :formPerms="formPerms"
            :form-ref="formRef"
          />
        </a-form-item>
      </Col>
      <span ref="formItemRef" v-else></span>
    </template>
  </a-form>
</template>
<script setup lang="ts">
import type { FormInstance } from "ant-design-vue";
import { Rule } from "ant-design-vue/lib/form";
import { isArray } from "lodash";
import { computed, onMounted, ref, inject, provide, Ref, ComputedRef, watch } from "vue";

import Col from "./components/Col.vue";
import FormItemRender from "./FormItemRender.vue";
import { getNode } from "./units";
import { archivesList } from "@/components/form/formItems/ComponentList";
import { CurrentTaskDetail, FlowForm } from "@/domain/form-flow";
import { ProcessType } from "@/typings/process";
import eventBus from "@/utils/event-bus";
type formOption = { id: string; title: string; width?: number; props: any; name: string; show?: boolean };
const processType = inject("processType");
const currentUser = inject("currentUser") as Ref;
const currentTaskDetail = inject("currentTaskDetail") as Ref<CurrentTaskDetail>;
const flowForm = inject("flowForm") as Ref<FlowForm>;
const initialized = ref(false);
const initFormOptions = ref<formOption[]>([]); //表单配置
const formData = ref<any>({}); //表单数据
const formOptions = computed(() => {
  return initFormOptions.value.map(enrichWithShow);
});
//当前所处于的结点
const nodeId = computed(() => {
  if (processType === ProcessType.ADD) {
    return "root";
  } else {
    return currentTaskDetail.value.key;
  }
});

//当前表单权限 只读 可编辑 隐藏
enum FormItemPermission {
  READONLY = "R",
  EDIT = "E",
  HIDE = "H",
}
interface FormPerms {
  id: string;
  perm: FormItemPermission;
  required: boolean;
  title: string;
}
const formPerms: ComputedRef<FormPerms[]> = computed(() => {
  if (processType === ProcessType.DETAIL) {
    //驳回和撤销使用上个节点的展示状态
    const status = currentTaskDetail.value.processInstanceRunningInfo.status;
    if (["REJECT", "UNDO"].includes(status)) {
      return currentTaskDetail.value.processInstanceRunningInfo.formPerms;
    }
  }
  if (flowForm.value && nodeId.value) {
    let nowNode = getNode(
      JSON.parse(processType === ProcessType.DETAIL ? currentTaskDetail.value.properties.processJson : flowForm.value.flowJson),
      nodeId.value,
    );
    if (flowForm.value.callType === "EXTERNAL") {
      return nowNode ? nowNode.props.outerFormPerms : [];
    } else {
      return nowNode ? nowNode.props.formPerms : [];
    }
  }
  return [];
});

const getPermission = (item: formOption): { show: boolean; readonly: boolean } => {
  const res = {
    show: false,
    readonly: false,
  };
  //流程结束情况 全部显示 全部只读
  if (nodeId.value === "") {
    res.show = true;
    res.readonly = true;
    return res;
  }
  const findIndex = formPerms.value.findIndex((e) => e.id === item.id);

  //如果没有获取到权限数据的情况
  if (formPerms.value.length === 0 || findIndex === -1) {
    res.show = true;
    res.readonly = processType === ProcessType.DETAIL;
    return res;
  }

  res.show = formPerms.value[findIndex].perm !== FormItemPermission.HIDE;
  res.readonly = formPerms.value[findIndex].perm === FormItemPermission.READONLY;
  return res;
};

/** 组合容器或 hideLabel：不在外层 Form.Item 重复展示标题 */
const isComboShellItem = (item: formOption): boolean => item.name === "GroupList" || Boolean(item.props?.hideLabel);

const comboShellLabelCol = { style: { width: 0, maxWidth: 0, padding: 0, margin: 0, overflow: "hidden" as const } };
const comboShellWrapperCol = { style: { flex: "1 1 auto", minWidth: 0, maxWidth: "100%" } };

const formRef = ref<FormInstance>(); //form组件
const formItemRef = ref<Record<string, any>>({});
const rules = computed(() => {
  let rule: Record<string, any> = {};
  formOptions.value.forEach((item: any, index: number) => {
    //基本校验
    if (item.props.required && item.name !== "Description") {
      rule[item.id] = [
        {
          required: item.show,
          message: `请填写${item.title}`,
          trigger: "blur",
        },
      ];
    }

    //组合容器内校验
    if (item.name === "GroupList") {
      rule[item.id] = [
        {
          validator: item.show
            ? formItemRef.value[index]?.validator
            : async () => {
                return Promise.resolve();
              },
          trigger: "blur",
        },
      ];
    }
    // 服务期限组件内校验
    if (item.name === "ServicePeriod") {
      rule[item.id] = [
        {
          validator: item.show
            ? formItemRef.value[index]?.validator
            : async () => {
                return Promise.resolve();
              },
          trigger: "change",
        },
      ];
    }
    // 门禁权限校验
    if (item.name === "AccessPermission") {
      rule[item.id] = [
        {
          validator: item.show
            ? formItemRef.value[index]?.validator
            : async () => {
                return Promise.resolve();
              },
          trigger: "change",
        },
      ];
    }
    // 人事管理电话，身份证号校验
    if (item.name === "TelPhone" || item.name === "IDNumber" || item.name === "CarId" || item.name === "TimePickerRange") {
      if (isArray(rule[item.id])) {
        rule[item.id].push({
          validator: item.show
            ? formItemRef.value[index]?.validator
            : async () => {
                return Promise.resolve();
              },
          trigger: "blur",
        });
      } else {
        rule[item.id] = [
          {
            validator: item.show
              ? formItemRef.value[index]?.validator
              : async () => {
                  return Promise.resolve();
                },
            trigger: "blur",
          },
        ];
      }
    }
    // 停车权限校验
    if (item.name === "parkingPermission") {
      rule[item.id] = [
        {
          validator: item.show
            ? formItemRef.value[index]?.validator
            : async () => {
                return Promise.resolve();
              },
          trigger: "change",
        },
      ];
    }

    // 耗材领用即使非必填，选择后也必须校验明细。
    if ((item.props.required && item.baseOn === "Table") || item.name === "ConsumablesOut") {
      rule[item.id] = [
        {
          validator: item.show
            ? formItemRef.value[index]?.validator
            : async () => {
                return Promise.resolve();
              },
          trigger: "blur",
        },
      ];
    }

    //人员档案校验
    if (archivesList.findIndex((e) => e.name === item.name) !== -1 && item.props.required) {
      rule[item.id] = [
        {
          validator: async (_rule: Rule, value: { id: string; name: string } | null) => {
            if (!value || !value.name) {
              return Promise.reject(item.title + "不存在");
            }
            return Promise.resolve();
          },
          trigger: "blur",
          required: true,
        },
      ];
    }

    //评分组件校验
    if (item.props.required && item.name === "RateInput") {
      rule[item.id] = [
        {
          validator: async () => {
            return Promise.resolve();
          },
          trigger: "blur",
          required: true,
        },
      ];
    }
  });
  return rule;
});

onMounted(async () => {
  const formJson = processType === ProcessType.ADD ? flowForm.value.formJson : currentTaskDetail.value.properties.formJson;
  initFormOptions.value = JSON.parse(formJson); //表单配置

  if (processType === ProcessType.DETAIL) {
    formData.value = JSON.parse(currentTaskDetail.value.data);
  } else {
    formData.value.sponsorId = currentUser.value.id; //插入当前用户id（发起人）
    initFormOptions.value.forEach((e) => {
      formData.value[e.id] = null;
    });
  }
  handleCheckRepeatData();

  initialized.value = true;
});

watch(
  () => formData.value,
  (val, oldVal) => {
    if (Object.keys(oldVal).length === 0) return;
    eventBus.emit("formRenderDataChange", val);
  },
  { deep: true },
);

/** 在表单配置树中按 id 查找项（含嵌套 GroupList.props.items） */
const findFormItemById = (id: string, list: formOption[]): formOption | undefined => {
  for (const node of list) {
    if (node.id === id) {
      return node;
    }
    if (node.name === "GroupList" && Array.isArray(node.props?.items)) {
      const found = findFormItemById(id, node.props.items as formOption[]);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

/** 联动字段值：优先从内层分组行向外查找，再到根 formData（嵌套单选值在 groupItem 上） */
const resolveRelateParamValue = (key: string, rowChain: Record<string, unknown>[] | undefined, root: Record<string, unknown>): unknown => {
  if (rowChain?.length) {
    for (let i = rowChain.length - 1; i >= 0; i--) {
      const ctx = rowChain[i];
      if (ctx && typeof ctx === "object" && !Array.isArray(ctx) && Object.prototype.hasOwnProperty.call(ctx, key)) {
        return (ctx as Record<string, unknown>)[key];
      }
    }
  }
  return root[key];
};

/** 预警记录不落库，只读时仍需展示并实时查询；时间区间等字段走表单副本 */
const READONLY_ALWAYS_SHOW_COMPONENTS = ["AlarmRecords"];

const hasDisplayValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
};

const getParamsHandler = (item: formOption, rowChain?: Record<string, unknown>[]): boolean => {
  if (!item.props?.relateParams) {
    if (processType === ProcessType.ADD) {
      return true;
    }
    //不为外部表单，不展示外部人员联系方式
    if (item.name === "OutsiderConcat") {
      return currentTaskDetail.value.processInstanceRunningInfo?.outSider ? true : false;
    }

    //只读并且没有值，不展示
    // const data=JSON.parse(currentTaskDetail.value.data)
    // if(getPermission(item).readonly){
    //   return data[item.id]?true:false
    // }
    // 兼容组合容器
    if (getPermission(item).readonly) {
      if (READONLY_ALWAYS_SHOW_COMPONENTS.includes(item.name)) {
        return true;
      }
      const value = resolveRelateParamValue(item.id, rowChain, formData.value as Record<string, unknown>);
      return hasDisplayValue(value);
    }

    //驳回和撤销使用上个节点的展示状态
    const status = currentTaskDetail.value.processInstanceRunningInfo.status;
    const formPerms = currentTaskDetail.value.processInstanceRunningInfo.formPerms as { perm: string; id: string }[];
    if (["REJECT", "UNDO"].includes(status)) {
      const perm = formPerms.find((x: { id: string }) => x.id === item.id)?.perm;
      return perm === "H" ? false : true;
    }
    return true;
  }
  if (typeof item.props.relateParams !== "object") {
    return true;
  }
  const key = Object.keys(item.props.relateParams)[0];
  const value = Object.values(item.props.relateParams)[0];
  const comItem = findFormItemById(key, initFormOptions.value);
  if (!comItem) return true;
  if (!["SelectInput", "MultipleSelect", "VacationType"].includes(comItem.name)) {
    return true;
  }
  const paramsValue = resolveRelateParamValue(key, rowChain, formData.value as Record<string, unknown>);
  if (!paramsValue) return false;
  if (typeof paramsValue === "string") {
    return paramsValue === value;
  }
  if (Array.isArray(paramsValue)) {
    return paramsValue.includes(value);
  }
  if (typeof paramsValue === "object") {
    return (paramsValue as { id?: unknown }).id === value;
  }
  return false;
};

provide("evaluateFormItemShow", getParamsHandler);

/** 嵌套在 GroupList 内的项不能在根 formData 上算 show，交给分组行内 evaluate；此处占位为 true */
const enrichChildItems = (items: formOption[]): formOption[] =>
  items.map((child) => {
    if (child.name === "GroupList" && Array.isArray(child.props?.items)) {
      return {
        ...child,
        show: true,
        props: {
          ...child.props,
          items: enrichChildItems(child.props.items as formOption[]),
        },
      };
    }
    return { ...child, show: true };
  });

const enrichWithShow = (item: formOption): formOption => {
  const show = getParamsHandler(item);
  if (item.name === "GroupList" && Array.isArray(item.props?.items)) {
    return {
      ...item,
      show,
      props: {
        ...item.props,
        items: enrichChildItems(item.props.items as formOption[]),
      },
    };
  }
  return { ...item, show };
};

/** 再次发起数据校验 */
const handleCheckRepeatData = () => {
  if (processType !== ProcessType.ADD) return;
  if (!sessionStorage.getItem("flow-repeat-data")) return;

  const repeatData = JSON.parse(sessionStorage.getItem("flow-repeat-data")!);
  sessionStorage.removeItem("flow-repeat-data");

  formOptions.value.forEach((e) => {
    if (getPermission(e).show && repeatData[e.id] && e.name !== "SponsorInput") {
      formData.value[e.id] = repeatData[e.id];
    }
  });
};
defineExpose({
  formData,
  formRef,
});
</script>
<style scoped lang="less">
.process-form {
  display: inline-flex;
  flex-wrap: wrap;
  width: 100%;

  .description-component {
    margin-bottom: 0;
  }
}
</style>

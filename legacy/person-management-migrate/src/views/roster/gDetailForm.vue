<template>
  <div class="detail-form">
    <a-form layout="inline" :model="form" :rules="route.query.type !== 'detail' ? rules : null" ref="formRef">
      <template v-for="(item, index) in formList">
        <template v-if="item.title || item.form">
          <div class="item-title" v-if="item.title" :key="index">
            {{ item.title }}
          </div>
          <template v-for="(f, fIndex) in item.form">
            <!-- 查看详情时 -->
            <a-form-item
              :key="fIndex"
              :label="f.label"
              v-if="route.query.type === 'detail' && (f.showCondition ? f.showCondition(form) : true)"
              :class="f.singleLine ? 'a-form-item-100' : ''"
            >
              <template v-if="f.detailFun">
                <span v-if="!f.html">
                  {{ f.detailFun(form[f.detailValue ? f.detailValue : f.value], form) }}
                </span>
                <span v-else v-html="f.detailFun(form[f.detailValue ? f.detailValue : f.value], form)"></span>
              </template>
              <template v-else-if="f.component === 'aSelect'">
                {{
                  typeof form[f.value] === "object"
                    ? (f.options ?? [])
                        .filter((e) => form[f.value]?.includes(e.value))
                        ?.map((x) => x.label)
                        .join(",") || "--"
                    : (f.options ?? []).find((e) => e.value === form[f.value])?.label || "--"
                }}
              </template>
              <template v-else-if="f.component === 'a-tree-select'">
                {{
                  treeToArr(f.options)
                    .filter((e) => form[f.value]?.includes(e.value))
                    ?.map((x) => x.title)
                    .join(",") || "--"
                }}
              </template>
              <template v-else>
                {{ form[f.value] ?? "--" }}
              </template>
            </a-form-item>
            <!-- 编辑新增时 -->
            <a-form-item
              :key="fIndex + '1'"
              :label="f.label"
              :name="f.value"
              v-else-if="route.query.type !== 'detail' && (f.showCondition ? f.showCondition(form) : true)"
              :class="f.singleLine ? 'a-form-item-100' : ''"
            >
              <component
                v-if="!f?.slot"
                v-model:value="form[f.value]"
                v-model:checked="form[f.value]"
                :imageData="form[f.value]"
                :is="f.component ? f.component : 'a-input'"
                :placeholder="f.placeholder ? f.placeholder : '请输入'"
                :options="f.options ? f.options : []"
                :tree-data="f.options ? f.options : []"
                :format="f.format ? f.format : ''"
                v-bind="getPopupContainerBind(f)"
                :showTime="f.showTime ? f.showTime : false"
                :showSearch="f.showSearch ? f.showSearch : false"
                :treeNodeFilterProp="f.treeNodeFilterProp ? f.treeNodeFilterProp : ''"
                :showCheckedStrategy="f.showCheckedStrategy ? f.showCheckedStrategy : false"
                :field="f.field ? f.field : null"
                :replace-fields="f.field ? f.field : null"
                :url="f.url ? f.url : null"
                :disabled="f.disabled ? f.disabled : false"
                :checked-children="f.checkedValue ? f.checkedValue : '启用'"
                :un-checked-children="f.unCheckedValue ? f.unCheckedValue : '禁用'"
                :mode="f.mode ? f.mode : undefined"
                :multiple="f.multiple ? f.multiple : false"
                :params="f.params ? f.params : false"
                :suffix="f.suffix ? f.suffix : null"
                :prefix="f.prefix ? f.prefix : null"
                :file="f.fileList ? form[f.fileList] : f?.detailValue ? form[f?.detailValue] : []"
                :min="f.min ?? undefined"
                :max="f.max ?? undefined"
                :precision="f.precision ?? undefined"
                :maxlength="f?.maxlength"
                :api="f?.api"
                :style="{ maxWidth: '300px !important', width: '100% !important' }"
                :labelInValue="f?.labelInValue"
                allowClear
                :valueFormat="f.valueFormat ? f.valueFormat : ''"
                @change="handleFieldChange(f, $event)"
              ></component>
              <slot v-else :name="f.value" :record="form"></slot>
            </a-form-item>
          </template>
        </template>
      </template>
      <slot name="edit-item" :record="form"></slot>
    </a-form>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs, onMounted, ref, nextTick } from "vue";
import { useRoute } from "vue-router";

import { getStaffDetail } from "@/api/index";

export default defineComponent({
  name: "gDetailForm",
  props: {
    formList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    api: {
      type: Object,
      default: () => {
        return {
          detail: null,
        };
      },
    },
    afterGet: {
      type: Function,
      default: null,
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 详情条件
    detailParam: {
      type: String,
      default: "id",
    },
  },
  emits: ["detail"],
  setup(props, { emit, expose }) {
    const route = useRoute();
    const formRef = ref();
    const state = reactive({
      form: {},
    });
    const getData = () => {
      if (route.query.type && props.api.detail && route.query.type !== "add") {
        getStaffDetail({ id: route.query[props.detailParam] }, route.query.type === "detail" ? true : false).then((res) => {
          emit("detail", res.data);
          state.form = props.afterGet && props.afterGet(res.data) ? props.afterGet(res.data) : res.data;
          for (const key in state.form) {
            if (state.form[key] === "") {
              state.form[key] = undefined;
            }
          }
        });
      }
    };

    const formValidate = async () => {
      let res;
      await formRef.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };
    const formValItem = async (value) => {
      let res;
      await formRef.value
        .validateFields(value)
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };
    /** 弹层挂到 .g-layout-container，避免 .content-table overflow 裁切日期等面板 */
    const defaultPickerPopupContainer = (triggerNode) => {
      if (!triggerNode || typeof triggerNode.closest !== "function") {
        return document.body;
      }
      return triggerNode.closest(".g-layout-container") || document.body;
    };
    const getPopupContainerForField = (f) => {
      if (f?.getPopupContainer) {
        return f.getPopupContainer;
      }
      const c = f?.component;
      if (typeof c !== "string") {
        return undefined;
      }
      const lower = c.toLowerCase();
      if (lower.includes("date-picker") || lower.includes("time-picker") || lower.includes("cascader") || lower.includes("tree-select")) {
        return defaultPickerPopupContainer;
      }
      return undefined;
    };
    const getPopupContainerBind = (f) => {
      const fn = getPopupContainerForField(f);
      return fn ? { getPopupContainer: fn } : {};
    };
    const handleFieldChange = (f, event) => {
      if (typeof f?.onChange === "function") {
        nextTick(() => {
          f.onChange(state.form[f.value], state.form, event);
        });
      }
    };
    onMounted(async () => {
      props.formList.forEach((item) => {
        if (item.form && item.form.length > 0) {
          item.form.forEach((f) => {
            if (f.detailValue) {
              state.form[f.detailValue] = f.defaultValue ? f.defaultValue : null;
            }
            if (f.value) {
              state.form[f.value] = f.defaultValue ? f.defaultValue : null;
            }
            if (item.component === "gUpload" && f.fileList) {
              state.form[f.fileList] = [];
            }
            if (f.mode === "multiple" || f.multiple) {
              state.form[f.value] = [];
            }
          });
        }
      });
      getData();
    });
    const toDaviceInfo = (data) => {
      localStorage.setItem("path", location.pathname + location.search);
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/genericEquipmentMonitor/equipmentMoitorDetail?type=detail&deviceId=${data.alarmTargetKey}`,
      );
    };
    const treeToArr = (data) => {
      let res = [];
      const recurse = (items) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            res.push({ title: item.title, value: item.value });
            if (item.children && Array.isArray(item.children)) {
              recurse(item.children);
            }
          });
        }
      };
      recurse(data);
      return res;
    };
    expose({
      formRef,
      getFormData: () => state.form,
    });
    return {
      toDaviceInfo,
      route,
      formRef,
      formValidate,
      formValItem,
      getPopupContainerBind,
      handleFieldChange,
      ...toRefs(state),
      getData,
      treeToArr,
    };
  },
});
</script>
<style lang="less" scoped>
.detail-form {
  height: 100%;
  overflow-y: scroll;
  overflow-y: overlay;
  .item-title {
    width: 100%;
    height: 35px;
    line-height: 35px;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #000000d9;
    border-top: 1px solid #e8e8e88c;
    padding-top: 5px;
    &:first-child {
      border: none;
    }
  }
  .item-line {
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed rgba(232, 232, 232, 1);
    margin-bottom: 16px;
    &:last-child {
      display: none;
      margin-bottom: 0;
    }
  }
  .a-form-item-100 {
    width: 100% !important;
  }
  :deep(.ant-form-inline .ant-form-item) {
    width: 33%;
    margin-right: 0;
    margin-bottom: 16px;
  }
  :deep(.ant-form-inline .ant-form-item > .ant-form-item-control) {
    text-align: left;
  }
  :deep(.ant-image) {
    margin-right: 10px;
    margin-bottom: 10px;
    overflow: hidden;
    background: #f0f0f0;
  }
  // :deep(.ant-image-img) {
  //   width: 100%;
  //   height: 100%;
  // }
  :deep(.ant-form-inline .ant-form-item > .ant-form-item-label) {
    width: 105px;
  }
  :deep(.ant-form-item .ant-cascader-picker) {
    width: 300px !important;
  }
  :deep(.ant-input-number) {
    width: 300px !important;
  }
  :deep(.timeline) {
    padding-left: 0;
  }
  :deep(.ant-timeline-item-content) {
    text-align: left;
  }
  .ant-form-item-control-input-content {
    > span {
      width: 300px !important;
      &.ant-upload-picture-card-wrapper {
        width: 100% !important;
      }
      &.ant-tag {
        width: auto !important;
      }
    }
    > input {
      width: 300px !important;
    }
    .ant-select {
      width: 300px !important;
    }
    .ant-cascader-picker {
      width: 300px !important;
    }
  }
}
</style>

<template>
  <div class="detail-form g-detail-form-wrap">
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
              <template v-if="f.component === 'a-upload'">
                <template v-if="!form[f.detailValue]?.length">
                  <a-image v-if="form[f.detailValue]?.path" :height="100" :width="100" :src="form[f.detailValue]?.path" />
                  <a-empty v-else description="暂无图片" style="width: 200px"></a-empty>
                </template>
                <a-image-preview-group v-else>
                  <a-image
                    v-for="(p, pIndex) in form[f.detailValue]"
                    :height="100"
                    :width="100"
                    :src="p ? p.path : null"
                    :key="pIndex"
                  ></a-image>
                </a-image-preview-group>
              </template>
              <span v-else>
                <span v-if="f.detailFun">
                  <span v-if="!f.html">
                    {{ f.detailFun(form[f.detailValue ? f.detailValue : f.value], form) }}
                  </span>
                  <span v-else v-html="f.detailFun(form[f.detailValue ? f.detailValue : f.value], form)"></span>
                </span>
                <span v-else>
                  <a @click="toDaviceInfo(form)" v-show="f.label == '报警设备'">
                    {{ f.detailValue ? (form[f.detailValue] ? form[f.detailValue] : "--") : form[f.value] ? form[f.value] : "--" }}
                    {{ f.unit ? f.unit : null }}
                  </a>
                  <span v-show="f.label !== '报警设备'" style="word-break: break-all">
                    {{ f.detailValue ? (form[f.detailValue] ? form[f.detailValue] : "--") : form[f.value] ? form[f.value] : "--" }}
                    {{ f.unit ? f.unit : null }}
                  </span>
                </span>
                <span>
                  <slot v-if="f?.slot" :name="f.value" :record="form"></slot>
                </span>
              </span>
            </a-form-item>
            <!-- 编辑新增时 -->
            <a-form-item
              :key="fIndex + '1'"
              :label="f.label"
              :name="f.value"
              v-else-if="route.query.type !== 'detail' && (f.showCondition ? f.showCondition(form) : true)"
              :class="f.singleLine ? 'a-form-item-100' : ''"
            >
              <span v-if="f.plaintext">
                <span v-if="f.detailFun">
                  <span v-if="!f.html">
                    {{ f.detailFun(form[f.detailValue ? f.detailValue : f.value], form) }}
                  </span>
                  <span v-else v-html="f.detailFun(form[f.detailValue ? f.detailValue : f.value], form)"></span>
                </span>
                <span v-else>
                  {{ f.detailValue ? (form[f.detailValue] ? form[f.detailValue] : "--") : form[f.value] ? form[f.value] : "--" }}
                  {{ f.unit ? f.unit : null }}
                </span>
              </span>
              <template v-else>
                <component
                  v-if="!f?.slot"
                  v-model:value="form[f.value]"
                  v-model:checked="form[f.value]"
                  :imageData="form[f.value]"
                  :is="f.component ? f.component : 'a-input'"
                  :placeholder="f.placeholder ? f.placeholder : '请输入'"
                  :options="f.options ? f.options : []"
                  :format="f.format ? f.format : ''"
                  :valueFormat="f.valueFormat ? f.valueFormat : undefined"
                  v-bind="getPopupContainerBind(f)"
                  :showTime="f.showTime ? f.showTime : false"
                  :showCheckedStrategy="f.showCheckedStrategy ? f.showCheckedStrategy : false"
                  :field="f.field ? f.field : null"
                  :url="f.url ? f.url : null"
                  :disabled="f.disabled ? f.disabled : false"
                  :checked-children="f.checkedValue ? f.checkedValue : '启用'"
                  :un-checked-children="f.unCheckedValue ? f.unCheckedValue : '禁用'"
                  :mode="f.mode ? f.mode : false"
                  :params="f.params ? f.params : false"
                  :suffix="f.suffix ? f.suffix : null"
                  :prefix="f.prefix ? f.prefix : null"
                  :file="f.fileList ? form[f.fileList] : f?.detailValue ? form[f?.detailValue] : []"
                  :max="f.max ? f.max : 1"
                  :maxlength="f?.maxlength"
                  :api="f?.api"
                  :style="f?.style"
                  :labelInValue="f?.labelInValue"
                  allowClear
                  showCount
                ></component>
                <slot v-else :name="f.value" :record="form"></slot>
              </template>
            </a-form-item>
          </template>
        </template>
      </template>
      <slot name="edit-item" :record="form"></slot>
    </a-form>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs, onMounted, getCurrentInstance, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  name: "gDetailForm",
  props: {
    formList: {
      type: Array,
      default: () => {
        return [
          // {
          //   title:'基本信息',
          //   form:[
          //     { label: "交易区（档位）",detailValue:'detailValue', value: "value1",component:'a-select',placeholder:'请选择' ,singleLine:true},
          //   ]
          // },
        ];
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
  emits: ["detile"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const formRef = ref();
    const router = useRouter();
    const state = reactive({
      form: {},
    });

    const getData = () => {
      if (route.query.type && props.api.detail && route.query.type !== "add") {
        proxy.$api[props.api.detail](route.query[props.detailParam], "get").then((res) => {
          emit("detile", res);
          state.form = props.afterGet && props.afterGet(res) ? props.afterGet(res) : res;
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
    /** 与 gSelect 一致：弹层挂到布局根节点，避免 .content-table { overflow: hidden } 裁切日期/时间面板 */
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
    onMounted(() => {
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
    return {
      toDaviceInfo,
      route,
      formRef,
      formValidate,
      formValItem,
      getPopupContainerBind,
      ...toRefs(state),
      getData,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("../../../styles/gComponents/gDetailform.less");
.detail-form .ant-form-inline .ant-form-item,
:deep(.detail-form .ant-form-inline .ant-form-item) {
  width: 33%;
  margin-right: 0;
  margin-bottom: 16px;
}
</style>

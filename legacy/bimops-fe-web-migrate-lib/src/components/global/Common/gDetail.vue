<template>
  <g-layout :title="title">
    <template #content-table>
      <g-detail-form
        ref="gDetailForm"
        :formList="formList"
        :api="api"
        :rules="rules"
        :afterGet="afterGet"
      >
        <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}" />
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <slot name="btn" :record="gDetailForm"></slot>
      <a-button
        type="primary"
        @click="saveRecord"
        :loading="isLoading"
        v-if="route.query.type && route.query.type !== 'detail' && saveBtn"
        >保存</a-button
      >
    </template>
  </g-layout>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  name: "gDetail",
  props: {
    title: {
      type: String,
      default: "详情页面",
    },
    formList: {
      type: Array,
      default: () => {
        return [
          {
            title: "基本信息",
            form: [
              {
                label: "交易区（档位）",
                detailValue: "detailValue1",
                value: "value1",
                component: "a-select",
                placeholder: "请选择",
              },
            ],
          },
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
    beforeSave: {
      type: Function,
      default: null,
    },
    afterGet: {
      type: Function,
      default: null,
    },
    rules: {
      type: Object,
      default: () => {
        return {
          value1: [{ required: true, message: "请选择" }],
        };
      },
    },
    saveBtn: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const gDetailForm = ref();
    const route = useRoute();
    const router = useRouter();
    const state = reactive({ isLoading: false });
    const { proxy } = getCurrentInstance();

    /*保存数据*/
    const saveRecord = () => {
      gDetailForm.value.formRef.validate().then(async (res) => {
        state.isLoading = true;
        try {
          if (props.beforeSave) {
            const form = await props.beforeSave(gDetailForm.value.form);
            if (!form) {
              state.isLoading = false;
              return;
            }
            if (props.api.add && route.query.type === "add") {
              proxy.$api[props.api.add](form, "post").then((res) => {
                proxy.$message.success("操作成功");
                state.isLoading = false;
                goBack();
              });
            } else if (props.api.edit && route.query.type === "edit") {
              proxy.$api[props.api.edit](form, "put").then((res) => {
                proxy.$message.success("操作成功");
                goBack();
                state.isLoading = false;
              });
            }
          } else {
            if (props.api.add && route.query.type === "add") {
              proxy.$api[props.api.add](gDetailForm.value.form, "post").then(
                (res) => {
                  proxy.$message.success("操作成功");
                  state.isLoading = false;
                  goBack();
                }
              );
            } else if (props.api.edit && route.query.type === "edit") {
              proxy.$api[props.api.edit](gDetailForm.value.form, "put").then(
                (res) => {
                  proxy.$message.success("操作成功");
                  state.isLoading = false;
                  goBack();
                }
              );
            }
          }
        } catch (error) {
          state.isLoading = false;
        }
      });
    };
    /*返回*/
    const goBack = () => {
      history.go(-1);
    };

    const getData = () => {
      gDetailForm.value.getData();
    };

    return {
      gDetailForm,
      route,
      ...toRefs(state),
      getData,
      goBack,
      saveRecord,
    };
  },
});
</script>
<style lang="less" scoped></style>

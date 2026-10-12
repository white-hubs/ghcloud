<template lang="pug">
g-layout(:title="title")
    template(#content-table)
      g-detail-form(
        ref="gDetailForm"
        :formList="formList"
        :api="api"
        :rules="rules"
      )
    template(#footer-page)
      a-button(@click="goBack") 返回
      slot(name="btn" :record="gDetailForm")
      a-button(type="primary" @click="saveRecord" v-if="route.query.type&&route.query.type!=='detail'") 保存
        
</template>
<script lang='jsx'>
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
    rules: {
      type: Object,
      default: () => {
        return {
          value1: [{ required: true, message: "请选择" }],
        };
      },
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const gDetailForm = ref();
    const route = useRoute();
    const router = useRouter();
    const state = reactive({});

    onMounted(() => {
    });
    /*保存数据*/
    const saveRecord = () => {
      gDetailForm.value.formRef.validate().then((res) => {
        if (props.api.add && route.query.type === "add") {
          proxy.$api[props.api.add]("post", gDetailForm.value.form).then(
            (res) => {
              proxy.$message.success("操作成功");
              goBack();
            }
          );
        } else if (props.api.edit && route.query.type === "edit") {
          proxy.$api[props.api.edit]("put", gDetailForm.value.form).then(
            (res) => {
              proxy.$message.success("操作成功");
              goBack();
            }
          );
        }
      });
    };
    /*返回*/
    const goBack = () => {
      router.go(-1);
    };
    return {
      gDetailForm,
      route,
      ...toRefs(state),
      goBack,
      saveRecord,
    };
  },
});
</script>
<style lang="less" scoped></style>

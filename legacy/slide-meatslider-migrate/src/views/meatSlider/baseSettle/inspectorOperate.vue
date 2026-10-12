<template lang="pug">
g-layout(title="抽检员")
  template(#content-table)
    g-detail-form(
      ref="formRef"
      :api="api"
      :formList="formList"
      :layout="layout"
      :rules="rules"
      :afterGet="afterGet")
      template(v-slot:name="{record}")
        a-select(
          v-model:value="personList"
          placeholder="请选择抽检员" 
          :dropdownStyle="{display: 'none'}"
          :dropdownClassName="'hide'"
          :labelInValue="true"
          :allowClear='true'
          @click="openPerson")
  template(#footer-page)
    a-button(@click="cancel")  {{ type === 'detail' ? '返回' : '取消'}}
    a-button(type="primary" @click="submit" v-if="type !== 'detail'") 保存
  personModal(
    :visible="personVisible"
    :activeId="inspectorForm.userId"
    @close="closePerson"
  )
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import personModal from "./components/personModal.vue";

export default defineComponent({
  components: {
    personModal,
  },
  setup() {
    // 方法
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    // 数据
    const id = route.query.id;
    const state = reactive({
      rules: {
        type: [
          {
            required: true,
            message: "请选择创建方式",
          },
        ],
        name: [
          {
            required: true,
            message: "请添加抽检员",
          },
        ],
      },
      api: {
        detail: "inspectorId",
        add: "getInspector",
        edit: "getInspector",
      },
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: "创建方式",
              value: "type",
              component: "a-radio-group",
              singleLine: true,
              options: [
                { value: "INSPECTOR_TYPE_STAFF", label: "员工列表选择" },
                { value: "INSPECTOR_TYPE_NORMAL", label: "创建抽检员" },
              ],
              detailFun: (value) => {
                if (value) {
                  if (value === "INSPECTOR_TYPE_STAFF") {
                    return "员工列表选择";
                  }
                  if (value === "INSPECTOR_TYPE_NORMAL") {
                    return "创建抽检员";
                  }
                }
              },
            },
            {
              label: "抽检员",
              value: "name",
              singleLine: true,
              showCondition: (form) => {
                return form.type === "INSPECTOR_TYPE_NORMAL";
              },
            },
            {
              label: "抽检员",
              value: "name",
              slot: true,
              detailFun: (value) => {
                return inspectorForm.name || "--";
              },
              showCondition: (form) => {
                return form.type === "INSPECTOR_TYPE_STAFF";
              },
            },
            {
              label: "启用状态",
              value: "enabled",
              component: "a-switch",
              url: "",
              defaultValue: true,
              detailFun: (value) => {
                if (value) {
                  return "启用";
                } else {
                  return "禁用";
                }
              },
            },
            {
              label: "备注信息",
              value: "remark",
              component: "a-textarea",
              singleLine: true,
              placeholder: "请输入",
            },
          ],
        },
      ],
      personVisible: false,
      personList: [],
    });
    const formRef = ref();
    const inspector = ref();
    const inspectorForm = reactive({
      id: "",
      userId: "",
      type: null,
      name: null,
      remark: "",
      enabled: true,
    });

    const handleChange = (value) => {};

    const filterOption = (input, option) => {
      return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    const cancel = () => {
      router.back(-1);
    };
    const submit = async () => {
      const res = await formRef.value.formValidate();
      if (res) {
        formRef.value.form.id
          ? await proxy.$api.getInspector(formRef.value.form,"put")
          : await proxy.$api.getInspector(formRef.value.form,"post");
        proxy.$message.success("操作成功");
        cancel();
      }
    };
    const openPerson = () => {
      state.personVisible = true;
    };
    const closePerson = (data) => {
      if (data) {
        state.personList = [ {value: data.id, label: data.name}]
        formRef.value.form.userId = data.id
        formRef.value.form.name = data.name
        inspectorForm.userId = data.id
      }
      state.personVisible = false
    };
    const afterGet = (form) => {
      form.userId = formRef.value.form.userId || inspectorForm.userId
      form.name = formRef.value.form.name || inspectorForm.name
      return { ...form };
    };

    onMounted(() => {
      if (id) {
        state.spinning = true;
        proxy.$api
          .inspectorId({ id: id },`get` )
          .then((res) => {
            inspectorForm.name = res.name;
            inspectorForm.type = res.type;
            inspectorForm.remark = res.remark;
            inspectorForm.enabled = res.enabled;
            inspectorForm.id = res.id;

            state.personList = [ {value: res.userId, label: res.name}]
            inspectorForm.userId = res.userId;
          })
          .finally(() => {
            state.spinning = false;
          });
      }
    });

    return {
      labelCol: {
        span: 8,
      },
      // 数据
      ...toRefs(state),
      inspector,
      inspectorForm,
      value: ref(undefined),
      // 方法
      handleChange,
      filterOption,
      cancel,
      submit,
      // 人员弹窗
      formRef,
      closePerson,
      openPerson,
      afterGet
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-form) {
  display: grid;
}
</style>

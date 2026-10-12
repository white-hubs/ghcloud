<template lang="pug">
g-layout(:title="type==='detail'? '商家详情': type === 'add' ? '新增商家' : '编辑商家'")
  template(#content-table)
    g-detail-form(
      ref="formRef"
      :api="api"
      :formList="formList"
      :layout="layout"
      :rules="rules"
      :afterGet="afterGet")
      template(v-slot:stallIds="{record}")
        a-select(
          v-model:value="stallList"
          :style="'maxWidth: 300px'" 
          placeholder="请选择经营档位" 
          :dropdownStyle="{display: 'none'}"
          :dropdownClassName="'hide'"
          :labelInValue="true"
          mode="multiple"
          @change="changeStall"
          @click="openStall")
  template(#footer-page)
    a-button(@click="cancel")  {{ type === 'detail' ? '返回' : '取消'}}
    a-button(type="primary" @click="submit" v-if="type !== 'detail'") 保存
  gearModal(
    v-model:visible="visible" :activeId="[]" @close="closeStall"
  )
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  watch,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { millennial } from "@/utils/common";
import areaOpions from "../businessManage/area.json";
import gearModal from "./gear.vue";
let str = [];
export default defineComponent({
  components: {
    gearModal,
  },
  setup() {
    const dateFormat = "YYYY/MM/DD";
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const type = route.query.type;

    const form = ref();
    const formRef = ref();

    const state = reactive({
      api: {
        detail: "wholeSalerId",
      },
      stallList: [],
      visible: false,
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "店铺名称", value: "name" },
            { label: "档主编号", value: "code", },
            { label: "档主姓名", value: "shiftMaster" },
            { label: "档主手机号", value: "shiftMasterPhone" },
            { label: "档主身份证号码", value: "shiftMasterCard" },
            { label: "联系人", value: "liaison" },
            { label: "联系人手机号", value: "phone" },
            { label: "备注说明", value: "remark", component: "a-textarea" },
          ],
        },
      ],
      layout: {
        labelCol: {
          style: {
            minWidth: "120px",
          },
        },
        wrapperCol: {
          style: {
            maxWidth: "calc(100% - 120px)",
          },
        },
      },
      rules: {
        name: [{ required: true, message: "请输入店铺名称" }],
        code: [{ required: true, message: "请输入档主编号" }],
        shiftMasterPhone: [{ required: true, message: "请输入管理员手机号", disabled: type === 'edit' ? true : false },
        {
          pattern: new RegExp(/^1[3|4|5|6|7|8|9][0-9]{9}$/, "g"),
          message: "请输入正确的电话",
        }],
        shiftMaster: [{ required: true, message: "请输入档主姓名" }],
        liaison: [{ required: true, message: "请输入联系人" }],
        phone: [{ required: true, message: "请输入联系人手机号", },
        {
          pattern: new RegExp(/^1[3|4|5|6|7|8|9][0-9]{9}$/, "g"),
          message: "请输入正确的电话",
        }],
      },
    });

    const getAreaName = (value, arr) => {
      arr.forEach((item) => {
        if (value.indexOf(item.value) > -1) {
          str.push(item.label);
        }
        if (item.children && item.children.length > 0) {
          getAreaName(value, item.children);
        }
      });
      return str;
    };
    const changeStall = (value) => {
      // formRef.value.form.stallIds = state.stallList.map(item => { return item.value })
    };
    const openStall = () => {
      state.visible = true;
    };
    const closeStall = (data) => {
      if (data) {
        state.stallList = data.map(item => { return { value: item.id, label: item.name } })
        // formRef.value.form.stallIds = data.map(item => { return item.id })
      }
      state.visible = false
    };
    const submit = async () => {
      const res = await formRef.value.formValidate();
      if (res) {
        formRef.value.form.id
          ? await proxy.$api.wholeSalerId(formRef.value.form, "put")
          : await proxy.$api.wholeSalerAdd(formRef.value.form, "post");
        proxy.$message.success("操作成功");
        cancel();
      }
    };

    const cancel = () => {
      router.back(-1);
    };
    const afterGet = (form) => {
      let fileList = [];
      if (form.logo && form.logo.id) {
        fileList = [
          {
            uid: form.logo.id,
            id: form.logo.id,
            name: form.logo.name,
            status: "done",
            url: form.logo.path,
          },
        ];
      }
      return { ...form, fileList: fileList };
    };

    return {
      type,
      form,
      formRef,
      ...toRefs(state),
      cancel,
      submit,
      afterGet,
      closeStall,
      openStall,
      changeStall,
    };
  },
});
</script>
<style scoped lang="less"></style>

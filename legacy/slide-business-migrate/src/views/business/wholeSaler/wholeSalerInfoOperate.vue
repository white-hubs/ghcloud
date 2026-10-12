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
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
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
            { label: "商家名称", value: "name" },
            { label: "管理员手机号", value: "adminPhone", disabled: type === 'edit' ? true : false },
            { label: "负责人姓名", value: "shiftMaster" },
            { label: "负责人手机号", value: "shiftMasterPhone" },
            { label: "负责人身份证号码", value: "shiftMasterCard" },
            { label: "联系人", value: "liaison" },
            { label: "联系人手机号", value: "phone" },
            {
              label: "所在地区",
              value: "areaIds",
              component: "g-cascader",
              options: areaOpions,
              placeholder: "请选择",
              detailFun: (value) => {
                if (value) {
                  str = [];
                  return getAreaName(value, areaOpions).join("/");
                }
              },
            },
            { label: "详细地址", value: "address" },
            { label: "备注", value: "remark", component: "a-textarea" },
            {
              label: "企业LOGO",
              value: "fileId",
              sceneCode:GLOBAL_SCENE_CODE.merchant,
              fileList: "fileList",
              component: type === "detail" ? "a-upload" : "gUpload",
              detailValue: "logo",
            },
          ],
        },
        {
          title: "业务信息",
          form: [
            {
              label: "经营档位",
              value: "stallIds",
              slot: true,
              detailFun: (value) => {
                return state.stallList.map(item => { return item.label }).join(',') || "--";
              },
            },
            {
              label: "主营品类",
              value: "categoryIds",
              component: "g-TreeSelect",
              url: "getGoodsTypeList",
              mode: true,
              detailValue: "categoryName",
              showCheckedStrategy: "SHOW_CHILD",
              detailFun: (value) => {
                return value?.length ? value.join(",") : "--";
              },
            },
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
        name: [{ required: true, message: "请输入商家名称" }],
        liaison: [{ required: false, message: "请输入联系人姓名" }],
        phone: [{ required: false, message: "请输入联系人手机号" }],
        categoryIds: [{ required: false, message: "请选择主营品类" }],
        stallIds: [{ required: false, message: "请选择经营档位" }],
        areaIds: [{ required: false, message: "请选择所在地区" }],
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
    const getStallInfo = () => {
      if (route.query.id && route.query.type !== "add") {
        proxy.$api.getMerchantBooth({
          merchantId: route.query.id
        }).then((res) => {
          state.stallList = res.map(item => { return { value: item.id, label: item.name } })
          formRef.value.form.stallIds = res.map(item => { return item.id })
        });
      }
    };
    const changeStall = (value) => {
      formRef.value.form.stallIds = state.stallList.map(item => { return item.value })
    };
    const openStall = () => {
      state.visible = true;
    };
    const closeStall = (data) => {
      if (data) {
        state.stallList = data.map(item => { return { value: item.id, label: item.name } })
        formRef.value.form.stallIds = data.map(item => { return item.id })
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
      form.stallIds = [...formRef.value.form.stallIds]
      return { ...form, fileList: fileList };
    };
    onMounted(() => {
      getStallInfo()
    });

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
      getStallInfo,
    };
  },
});
</script>
<style scoped lang="less"></style>

<template lang="pug">
g-layout(
  :title="`租户详情`")   
  template(#content-table)
    g-detail-form(
      :api="api"
      :formList="formList")
  template(#footer-page)  
    a-button(@click="cancel") 返回
</template>
<script lang='jsx'>
import { defineComponent, reactive, getCurrentInstance, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat, millennial } from "@/utils/common";
import { time } from "echarts";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();

    const state = reactive({
      api: {
        detail: "tenantCode",
      },
      formList: [
        {
          title: "",
          form: [
            { label: `租户ID`, value: "code" },
            { label: `租户名称`, value: "name" },
            { label: "管理用户", value: "username" },
            {
              label: "启用状态",
              value: "enabled",
              html: true,
              detailFun: (value) => {
                return `<span class="${value ? "normalRow" : "deleteRow"}">${
                  value ? "已启用" : "已禁用"
                }</span>`;
              },
            },
            {
              label: "所在地区",
              value: "locations",
              component: "AreaCascader",
              onlyLabel: true,
            },
            { label: "详细地址", value: "address" },
            {
              label: "占地面积",
              value: "areaCovered",
              detailFun: (value) => {
                return `${millennial(value, true)}m²`;
              },
            },
            {
              label: "楼栋数",
              value: "building",
              detailFun: (value) => {
                return `${millennial(value, false)}栋`;
              },
            },
            {
              label: "注册时间",
              value: "createTime",
              detailFun: (value) => {
                return value ? timeFormat(value, true) : "--";
              },
            },
            {
              label: "更新时间",
              value: "updateTime",
              detailFun: (value) => {
                return value ? timeFormat(value, true) : "--";
              },
            },
            {
              label: `租户LOGO`,
              value: "logo",
              detailValue: "logo",
              component: "a-upload",
            },
            {
              label: `租户宣传图`,
              value: "fileVOS",
              detailValue: "files",
              component: "a-upload",
            },
            { label: `租户简介`, value: "remark" },
          ],
        },
      ],
    });

    const cancel = () => {
      router.back(-1);
    };

    return {
      ...toRefs(state),
      cancel,
      timeFormat,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/dataDetails/index.less");
.dataTitle {
  height: calc(100% - 122px);
}
</style>

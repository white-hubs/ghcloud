<template lang="pug">
g-detail(
  title="档位信息"
  :formList="formList"
  :api="api"
  :rules="rules"
)
</template>

<script lang='jsx'>
import { defineComponent, ref, reactive, toRefs, createVNode } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      api: {
        detail: "getStallId",
        add: "postStall",
        edit: "postStall",
      },
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: "档位编号",
              value: "code",
            },
            {
              label: "所在区域",
              value: "areaIds",
              component: "gCascader",
              url: "getAreaList",
              detailValue: "areaNames",
              placeholder: "请选择",
              detailFun: (a) => {
                if (a && a.length > 0) {
                  return a.join(",");
                }
              },
            },

            {
              label: "管理部门",
              value: "deptIds",
              component: "gCascader",
              url: "getOrganizations",
              detailValue: "deptNames",
              placeholder: "请选择",
              detailFun: (a) => {
                if (a && a.length > 0) {
                  return a.join(",");
                }
              },
            },
            {
              label: "档位名称",
              value: "name",
            },
            {
              label: "具体位置",
              value: "location",
            },
            {
              label: "备注说明",
              value: "remark",
              component: "a-textarea",
            },
          ],
        },
      ],
      rules: {
        code: [
          {
            required: true,
            message: "请输入档位编号",
          },
        ],
        areaIds: [
          {
            required: true,
            message: "请选择所在区域",
          },
        ],
        deptIds: [
          {
            required: true,
            message: "请选择所属部门",
          },
        ],
      },
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped></style>

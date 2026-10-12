<template lang="pug">
g-detail(
    title="屠宰场信息"
    :api="api"
    :formList="formList"
    :rules="rules"
    ref="gDetail"
)
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const gDetail = ref();
    const state = reactive({
      api: {
        detail: "abattoirId",
        add: "abattoir",
        edit: "abattoir",
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入",
          },
        ],
      },
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "屠宰场全称", value: "name" },
            {
              label: "屠宰场简称",
              value: "abbr",
              plaintext: true,
              detailFun: (value, form) => {
                if (form.name && route.query.type === "add") {
                  (async () => {
                    const data = await proxy.$api.getAbattoirGenerate({
                      name: form.name,
                    });
                    gDetail.value.gDetailForm.form.abbr = data.abbr;
                    gDetail.value.gDetailForm.form.code = data.code;
                  })();
                }

                if (value) {
                  return value;
                } else {
                  return "--";
                }
              },
            },
            {
              label: "屠宰场代码",
              value: "code",
              plaintext: true,
              detailFun: (value) => {
                if (value) {
                  return value;
                } else {
                  return "--";
                }
              },
            },
            { label: "屠宰场地址", value: "address" },
            { label: "备注信息", value: "remark", component: "a-textarea" },
          ],
        },
      ],
    });

    return {
      ...toRefs(state),
      gDetail,
    };
  },
});
</script>

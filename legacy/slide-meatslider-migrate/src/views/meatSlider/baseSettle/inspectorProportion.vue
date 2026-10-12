<template lang="pug">
g-layout(title="抽检比例")
  template(#content-table)
    .detail-form
      a-form(ref="proportion" :model="proportionForm" :rules="rules")
        .item-title 猪肉抽检比例设置
        a-form-item(label="总片数 X" name="value" :colon="false")
          a-input-number(v-model:value.trim="proportionForm.value" placeholder="比例" :min="0")
          span.p1 %
  template(#footer-page)
    a-button(type="primary"  @click="submit") 保存   
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
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    // 数据
    const state = reactive({
      rules: {
        value: [
          {
            required: true,
            message: "请输入抽检比例",
          },
        ],
      },
    });
    const proportionForm = reactive({
      id: "",
      value: "",
      type: "SPOT_CHECK",
    });

    const proportion = ref();

    const getProportion = () => {
      proxy.$api
        .configType({ type: proportionForm.type },"get" )
        .then((res) => {
          if (res) {
            proportionForm.id = res.id;
            proportionForm.value = res.value;
            proportionForm.type = res.type;
          } else {
            proportionForm.id = "";
            proportionForm.value = "";
            proportionForm.type = "SPOT_CHECK";
          }
        });
    };

    const submit = () => {
      if (!proportionForm.value) {
        proxy.$message.warn("请输入正确的抽检比例");
        return;
      }
      proportion.value.validate().then(() => {
        proxy.$api
          .config(proportionForm,proportionForm.id ? "put" : "post" )
          .then(() => {
            getProportion();
            proxy.$message.success("操作成功");
          })
          .catch(() => {
            proxy.$message.error("保存失败");
          });
      });
    };

    const cancel = () => {
      router.back(-1);
    };

    onMounted(() => {
      getProportion();
    });

    return {
      ...toRefs(state),
      // 方法
      proportionForm,
      cancel,
      proportion,
      submit,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>

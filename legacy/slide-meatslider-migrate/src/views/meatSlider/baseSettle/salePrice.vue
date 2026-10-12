<template lang="pug">
g-layout(title="最低价格设置")
  template(#content-table)
    .detail-form
      a-form(ref="price" :model="priceForm" :rules="rules")
        .item-title 销售价格设置 
        .item-title 设置市场最低价格信息，低于最低价格不允许进行交易（最多设置两位小数）
        a-form-item(label="价格不低于" name="value")
          a-input-number(v-model:value.trim="priceForm.value" placeholder="最低价" :min="0"  allowClear)
          span.pl1 元/kg 
  template(#footer-page)
    a-button(type="primary" @click="submit") 保存  
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
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    // 数据
    const state = reactive({
      rules: {
        value: [
          {
            required: true,
            message: "请正确输入最低价格",
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
          },
        ],
      },
      loading: false,
    });

    const price = ref();

    const priceForm = reactive({
      id: "",
      value: "",
      type: "SELLING_PRICE",
    });

    const getPrice = () => {
      state.loading = true;
      proxy.$api
        .configType({ type: priceForm.type },"get" )
        .then((res) => {
          if (res) {
            priceForm.id = res.id;
            priceForm.value = res.value;
          } else {
            priceForm.id = "";
            priceForm.value = "";
          }
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const submit = () => {
      if (!priceForm.value) {
        proxy.$message.warn("请输入正确的最低价格");
        return;
      }
      price.value.validate().then(() => {
        proxy.$api
          .config(priceForm,priceForm.id ? "put" : "post")
          .then(() => {
            getPrice();
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
      getPrice();
    });
    return {
      ...toRefs(state),
      price,
      priceForm,
      // 方法
      submit,
      cancel,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>

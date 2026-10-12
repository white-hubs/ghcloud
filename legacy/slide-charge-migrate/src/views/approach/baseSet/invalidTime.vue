<template lang="pug">
g-layout(title="报备失效时间")
  template(#content-search)
    a-alert(message="超过规定天数未进场，对应报备信息失效，进场需再次报备" type="warning" show-icon)
    a-form(ref="time" :model="timeForm" :rules="rules")
      a-form-item(label="失效时间：超过" name="value")
        span
          a-input-number(v-model:value.trim="timeForm.value" placeholder="天数" :min="0" :max="999" allowClear)
        span.p1 天未进场,该条报备信息自动失效
  template(#footer-page)  
    a-button(type="primary" @click="submit" :loading="saveLoading") 保存    
</template>
<script lang='jsx'>
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
    const reg = /^[1-9]\d*$/;
    // 数据
    const state = reactive({
      rules: {
        value: [
          {
            required: true,
            message: "",
          },
          {
            validator() {
              if (!timeForm.value) {
                return Promise.reject("请输入失效时间");
              } else {
                if (!reg.test(timeForm.value)) {
                  return Promise.reject("请输入正整数");
                } else {
                  return Promise.resolve();
                }
              }
            },
          },
        ],
      },
      loading: false,
      saveLoading: false,
    });

    const time = ref();
    const timeForm = reactive({
      value: "",
    });

    const gettime = () => {
      state.loading = true;
      proxy.$api
        .expireTime(null,"get")
        .then((res) => {
          timeForm.value = res;
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const submit = () => {
      time.value.validate().then(() => {
        state.saveLoading = true;
        proxy.$api
          .expireTime({ paramValue: timeForm.value },"put")
          .then(() => {
            gettime();
            proxy.$message.success("操作成功");
          })
          .catch(() => {
            proxy.$message.error("保存失败");
          })
          .finally(() => {
            state.saveLoading = false;
          });
      });
    };

    const cancel = () => {
      history.back()
    };
    onMounted(() => {
      gettime();
    });
    return {
      ...toRefs(state),
      time,
      timeForm,
      // 方法
      submit,
      cancel,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.price {
  width: 100%;
  height: 100%;
  background-color: @white;
}

.btnCtr {
  width: 100%;
  height: 70px;
  line-height: 70px;
  position: relative;
  bottom: 0;
  padding-right: 20px;
  text-align: right;
  background-color: @white;
  border-top: 1px solid @colorEee;
  button {
    width: 100px;
  }
}
.formTitle {
  text-align: left;
  padding: 10px;
  display: flex;
  align-items: center;
  .tips {
    font-size: 12px;
    color: @t_body_color;
  }
}
:deep(.ant-form-item-control) {
  text-align: left;
}
:deep(.ant-alert-warning) {
  text-align: left;
  margin-bottom: 20px;
}
</style>

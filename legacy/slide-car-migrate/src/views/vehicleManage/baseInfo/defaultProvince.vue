<template lang="pug">
g-layout(
  title="默认省份")
  template(#content-table)
    a-spin(:spinning="loading")
      a-form(ref="form" :model="model" :rules="rules" :labelCol="{span: 2}" :wrapperCol="{span:6}")
        div.tips.pb2
          sub 设置车牌默认归属省份，用于车牌号输入默认省份展示
        a-form-item(label="默认省份" name="carNoPre")
          g-select(v-model:value="model.carNoPre" placeholder="请选择默认省份" :options="options")
  template(#footer-page)   
    a-button(type="primary" :loading="btnLoading || loading" @click="save") 保存
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const form = ref();
    const state = reactive({
      model: {
        id: "",
        carNoPre: "",
      },
      rules: {
        carNoPre: [{ required: true, message: "请选择默认省份" }],
      },
      loading: false,
      btnLoading: false,
      options: [
        {
          name: "浙",
          id: "浙",
          key: "浙江",
        },
        {
          name: "鲁",
          id: "鲁",
          key: "山东",
        },
        {
          name: "苏",
          id: "苏",
          key: "江苏",
        },
        {
          name: "沪",
          id: "沪",
          key: "上海",
        },
        {
          name: "闽",
          id: "闽",
          key: "福建",
        },
        {
          name: "皖",
          id: "皖",
          key: "安徽",
        },
        {
          name: "赣",
          id: "赣",
          key: "江西",
        },
        {
          name: "粤",
          id: "粤",
          key: "广东",
        },
        {
          name: "桂",
          id: "桂",
          key: "广西",
        },
        {
          name: "琼",
          id: "琼",
          key: "海南",
        },
        {
          name: "鄂",
          id: "鄂",
          key: "湖北",
        },
        {
          name: "湘",
          id: "湘",
          key: "湖南",
        },
        {
          name: "豫",
          id: "豫",
          key: "河南",
        },
        {
          name: "京",
          id: "京",
          key: "北京",
        },
        {
          name: "津",
          id: "津",
          key: "天津",
        },
        {
          name: "冀",
          id: "冀",
          key: "河北",
        },
        {
          name: "晋",
          id: "晋",
          key: "山西",
        },
        {
          name: "蒙",
          id: "蒙",
          key: "内蒙古",
        },
        {
          name: "宁",
          id: "宁",
          key: "宁夏",
        },
        {
          name: "新",
          id: "新",
          key: "新疆",
        },
        {
          name: "清",
          id: "清",
          key: "青海",
        },
        {
          name: "陕",
          id: "陕",
          key: "陕西",
        },
        {
          name: "甘",
          id: "甘",
          key: "甘肃",
        },
        {
          name: "川",
          id: "川",
          key: "四川",
        },
        {
          name: "云",
          id: "云",
          key: "云南",
        },
        {
          name: "贵",
          id: "贵",
          key: "贵州",
        },
        {
          name: "藏",
          id: "藏",
          key: "西藏",
        },
        {
          name: "渝",
          id: "渝",
          key: "重庆",
        },
        {
          name: "辽",
          id: "辽",
          key: "辽宁",
        },
        {
          name: "吉",
          id: "吉",
          key: "吉林",
        },
        {
          name: "黑",
          id: "黑",
          key: "黑龙江",
        },
      ],
    });

    const getDefaultPro = () => {
      state.loading = true;
      proxy.$api
        .defaultProvince(null,"get")
        .then((res) => {
          if (res && typeof res === "object") {
            state.model = res;
          }
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const save = () => {
      state.btnLoading = true;
      form.value
        .validate()
        .then(() => {
          proxy.$api.defaultProvOperate(state.model,"post" ).then(() => {
            proxy.$message.success("操作成功");
            getDefaultPro();
          });
        })
        .finally(() => {
          state.btnLoading = false;
        });
    };

    onMounted(() => {
      getDefaultPro();
    });

    return {
      form,
      ...toRefs(state),
      save,
    };
  },
});
</script>

<style lang="less" scoped>
.tips {
  text-align: left;
  color: #999999;
}
:deep(.ant-form) {
  text-align: left;
}
</style>

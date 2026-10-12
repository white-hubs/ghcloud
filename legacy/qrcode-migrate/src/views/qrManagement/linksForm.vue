<template>
  <div class="links-wrap">
    <a-form
      :model="model"
      :rules="rules"
      id="linkForm"
      ref="linkFormRef"
      :label-col="{ style: { width: '90px' } }"
      :style="{ width: 'calc( 100% - 30px)' }"
    >
      <a-form-item label="业务名称" name="thirdLinkName">
        <a-input v-model:value="model.thirdLinkName" placeholder="请输入业务名称" allow-clear
        @change="() => {model.thirdLinkName = model.thirdLinkName ? model.thirdLinkName.replace(/\s+/g, '') : ''}" ></a-input>
      </a-form-item>
      <a-form-item label="第三方URL" name="thirdLinkUrl">
        <a-input v-model:value="model.thirdLinkUrl" placeholder="请输入第三方URL" allow-clear
        @change="() => {model.thirdLinkUrl = model.thirdLinkUrl ? model.thirdLinkUrl.replace(/\s+/g, '') : ''}" ></a-input>
      </a-form-item>
    </a-form>
    <div class="delete">
      <MinusCircleOutlined id="reduceBtn" @click="deleteArea" title="删除"></MinusCircleOutlined>
    </div>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
  nextTick,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import _ from "lodash";
export default defineComponent({
  props: {
    model: {
      type: Object,
    },
    rules: {
      type: Object,
    },
    index: {
      type: Object,
    },
    length: {
      type: Object,
    },
    type: {
      type: String,
      default: "equipModel",
    },
  },
  components: { MinusCircleOutlined },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const linkFormRef = ref();

    const state = reactive({
      selectStyle: { width: "100% !important" },
    });

    const deleteArea = () => {
      emit("delete-item", props.index);
    };
    const formVali = async () => {
      return await linkFormRef.value.validate()
    };
    watch(
      () => props.model,
      (n) => {
        nextTick(() => {
          formVali();
        });
      },
      {deep: true}
    );
    return {
      linkFormRef,
      ...toRefs(state),
      deleteArea,
      formVali,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
#reduceBtn {
  width: 14px !important;
  max-width: 14px !important;
}
.links-wrap{
  display:flex;
  margin-bottom: 15px;
}
.delete{
  position: absolute;
  right: 0;
  bottom: 45px;
  width: 14px !important; 
}
</style>

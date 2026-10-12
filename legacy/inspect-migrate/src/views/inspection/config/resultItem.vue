<template>
  <a-form :label-col="{span:5 }" ref="form" :model="model" :rules="rules" class="flex-start">
    <!-- <a-form-item name="itemValue" class="mr1" label="结果">
      <a-input v-model:value.trim="model.itemValue" placeholder="请输入结果项值"></a-input>
    </a-form-item> -->
    <a-form-item name="itemName" class="mr1" label="结果">
      <a-input v-model:value.trim="model.itemName" placeholder="请输入结果项描述"></a-input>
    </a-form-item>
    <a-form-item class="mr1" >
      <a-checkbox style="font-size: 12px;" v-model:checked="model.errorFlag"> 异常点 </a-checkbox>
    </a-form-item>
    <a-form-item v-if="length > 1">
      <MinusCircleOutlined style="font-size: 12px;" @click="deleteItem"></MinusCircleOutlined>
    </a-form-item>
  </a-form>
</template>

<script>
import { defineComponent, reactive, toRefs, ref } from "vue";
import { MinusCircleOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  props: {
    model: {
      type: Object,
    },
    index: Number,
    length: Number,
  },
  components: {
    MinusCircleOutlined,
  },
  setup(props, { emit }) {
    const state = reactive({
      rules: {
        // itemName: [{ required: true, message: "请输入结果项描述" }],
        itemValue: [{ required: true, message: "请输入结果项值" }],
      },
    });
    const form = ref();

    const formVali = async () => {
      let res;
      await form.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };

    const deleteItem = () => {
      emit("delete-item", props.index);
    };

    return {
      form,
      ...toRefs(state),
      deleteItem,
      formVali,
    };
  },
});
</script>

<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
}
</style>

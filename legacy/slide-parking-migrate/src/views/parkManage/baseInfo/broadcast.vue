<template lang="pug">
g-layout(
  title="播报信息")
  template(#content-table)
    div.tips.pb2 播报内容用于出入口显示屏展示
    a-spin(:spinning="spinning")
      a-form(ref="form" :model="model" :rules="rules")
        a-form-item(label="入口播报内容显示")
          a-textarea(v-model:value="model.sloganForEntrance" :maxlength="200" :autoSize="{minRows: 3, maxRows: 5}" showCount placeholder="请输入入口播报内容")
        a-form-item(label="出口播报内容显示")
          a-textarea(v-model:value="model.sloganForExit" :maxlength="200" :autoSize="{minRows: 3, maxRows: 5}" showCount placeholder="请输入出口播报内容")
  template(#footer-page)      
    a-button(type="primary" @click="save" :loading="loading") 保存
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  ref,
  watch,
} from "vue";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      model: {
        id: "",
        laneCode: "",
        sloganForEntrance: "",
        sloganForExit: "",
      },
      loading: false,
      spinning: false,
    });

    const getData = async () => {
      state.spinning = true;
      const data = await proxy.$api.broadcast(null,"get");

      state.model =
        data && typeof data === "object"
          ? data
          : {
              id: "",
              laneCode: "",
              sloganForEntrance: "",
              sloganForExit: "",
            };
      state.spinning = false;
    };

    const save = () => {
      state.loading = true;
      proxy.$api
        .editBroadcast(state.model,"post" )
        .then(() => {
          proxy.$message.success("操作成功");
        })
        .finally(() => {
          state.loading = false;
          getData();
        });
    };

    onMounted(() => {
      getData();
    });

    return {
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
</style>

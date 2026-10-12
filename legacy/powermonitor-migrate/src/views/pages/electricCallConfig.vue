<template>
  <div>报警配置</div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
export default defineComponent({
  name: "",
  components: {},
  setup() {
    const state = reactive({});
    const { proxy } = getCurrentInstance();
    const data = ref();
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less"></style>

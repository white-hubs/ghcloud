<template lang="pug">
.layout 档位管理
</template>

<script lang="jsx">
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({});
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style></style>

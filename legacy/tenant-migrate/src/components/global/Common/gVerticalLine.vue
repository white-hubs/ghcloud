<template lang="pug">
span.verticalLine.primary-color-before {{title}}
</template>
<script lang="jsx">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  setup() {},
});
</script>

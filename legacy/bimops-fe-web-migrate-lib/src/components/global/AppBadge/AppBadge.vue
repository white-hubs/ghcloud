<template lang="pug">
a-badge(
  :count="count"
  :offset="offset"
  :title="title"
  :numberStyle="numberStyle")
  template(v-if="customIcon" #count)
    slot
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    count: [Number],
    color: [String],
    placement: {
      default: () => {
        return "start";
      },
    },
    title: [String, Number],
    customIcon: [Boolean],
    offset: {
      type: Array,
      // default: () => {
      //   return [15, -5];
      // },
    },
    numberStyle: {
      type: Object,
      default: () => {
        return { backgroundColor: "#ff827b", fontSize: "12px" };
      },
    },
  },
});
</script>

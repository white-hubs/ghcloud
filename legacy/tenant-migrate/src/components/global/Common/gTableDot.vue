<template lang="pug">
span
    span(:class="statusClass")
    span.tableStatus.pl1 {{content}}
</template>
<script lang="jsx">
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    content: {
      type: String,
      default: "状态",
    },
    status: {
      type: String,
      default: "normal",
    },
  },
  setup(props) {
    const statusClass = computed(() => {
      let str = "normal";
      if (props.status === "normal") {
        str = "tableDotNormal";
      } else if (props.status === "delete") {
        str = "tableDotDelete";
      } else if (props.status === "audit") {
        str = "tableDotAudit";
      }
      return str;
    });
    return {
      statusClass,
    };
  },
});
</script>
<style lang="less" scoped>
.tableDotNormal {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
}
.tableDotDelete {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
}
.tableDotAudit {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
}
.tableStatus {
  vertical-align: middle;
}
</style>

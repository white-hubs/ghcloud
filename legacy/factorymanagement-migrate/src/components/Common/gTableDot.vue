<template>
  <span>
    <span :class="statusClass"></span>
    <span class="tableStatus">
      {{ content }}
      <slot />
    </span>
  </span>
</template>
<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "gTableDot",
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
      } else if (props.status === "blue") {
        str = "tableDotBlue";
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
  background-color: @green;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
}
.tableDotDelete {
  background-color: @danger_color;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
}
.tableDotAudit {
  background-color: @t_body_color;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
}
.tableDotBlue {
  background-color: @blue;
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

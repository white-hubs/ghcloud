<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select
        class="max-fill"
        size="medium"
        v-model="_value"
        disabled
        :placeholder="placeholder"
      />
    </div>
    <div v-else>
      <el-select
        class="max-fill"
        v-model="_value"
        size="medium"
        clearable
        :placeholder="placeholder"
      >
        <el-option
          v-for="(op, index) in options"
          :key="index"
          :value="op"
          :label="op"
        ></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";

export default {
  mixins: [componentMinxins],
  name: "OutSourceHandleResult",
  components: {},
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "请选择处理结果",
    },
    expanding: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped></style>

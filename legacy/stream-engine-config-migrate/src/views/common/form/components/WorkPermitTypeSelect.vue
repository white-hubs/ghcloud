<template>
  <div>
    <el-select v-if="mode === 'DESIGN'" class="max-fill" size="medium" disabled :placeholder="placeholder" />
    <el-select
      v-else
      class="max-fill"
      v-model="selectedId"
      size="medium"
      clearable
      filterable
      remote
      reserve-keyword
      :remote-method="searchTypes"
      :loading="loading"
      :placeholder="placeholder"
      @clear="handleClear"
      @change="handleChange"
    >
      <el-option v-for="item in options" :key="item.id" :label="item.typeName" :value="item.id" />
    </el-select>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import { getWorkPermitTypeNames } from "@/api/workPermit";

export default {
  mixins: [componentMinxins],
  name: "WorkPermitTypeSelect",
  props: {
    value: {
      type: Object,
      default: null,
    },
    placeholder: {
      type: String,
      default: "请选择作业类型",
    },
  },
  data() {
    return {
      loading: false,
      options: [],
      selectedId: null,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.selectedId = val && val.id ? val.id : null;
        if (val && val.id && !this.options.some((item) => item.id === val.id)) {
          this.options = [val, ...this.options];
        }
      },
    },
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.searchTypes("");
    }
  },
  methods: {
    async searchTypes(keyword) {
      this.loading = true;
      try {
        const res = await getWorkPermitTypeNames({ typeName: keyword });
        this.options = Array.isArray(res) ? res : [];
      } finally {
        this.loading = false;
      }
    },
    handleChange(id) {
      const item = this.options.find((option) => option.id === id);
      this.$emit("input", item ? { id: item.id, typeName: item.typeName } : null);
    },
    handleClear() {
      this.$emit("input", null);
    },
  },
};
</script>

<style scoped></style>

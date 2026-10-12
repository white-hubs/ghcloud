<template>
  <div>
    <el-select v-if="mode === 'DESIGN'" class="max-fill" size="medium" disabled :placeholder="placeholder" />
    <el-select v-else class="max-fill" v-model="_value" size="medium" clearable filterable :placeholder="placeholder">
      <el-option v-for="item in filteredOptions" :key="item" :label="item" :value="item" />
    </el-select>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import { getWorkPermitLevels } from "@/api/workPermit";

export default {
  mixins: [componentMinxins],
  name: "WorkPermitLevelSelect",
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "请选择作业等级",
    },
    params: {
      type: String,
      default: null,
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      options: [],
    };
  },
  computed: {
    filteredOptions() {
      return this.options;
    },
    workPermitTypeName() {
      const value = this.params ? this.formData[this.params] : null;
      if (!value) {
        return null;
      }
      if (typeof value === "string") {
        return value;
      }
      return value.typeName || value.name || null;
    },
  },
  watch: {
    workPermitTypeName() {
      this.$emit("input", "");
      if (this.mode !== "DESIGN") {
        this.loadLevels();
      }
    },
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.loadLevels();
    }
  },
  methods: {
    async loadLevels() {
      const params = this.workPermitTypeName ? { typeName: this.workPermitTypeName } : undefined;
      const res = await getWorkPermitLevels(params);
      this.options = Array.isArray(res) ? res : [];
    },
  },
};
</script>

<style scoped></style>

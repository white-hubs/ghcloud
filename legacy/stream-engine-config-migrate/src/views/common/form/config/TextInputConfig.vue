<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit />
    </el-form-item>
    <el-form-item label="默认值">
      <el-input size="small" v-model="value.defaultValue" maxlength="20" show-word-limit />
    </el-form-item>
    <el-form-item label="设置为标题">
      <el-switch v-model="value.useAsBackLogTitle"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "TextInput",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {};
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

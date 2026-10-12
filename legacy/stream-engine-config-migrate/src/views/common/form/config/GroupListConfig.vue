<template>
  <div>
    <el-form-item label="关闭添加(根节点)">
      <el-switch v-model="value.closeAdd"></el-switch>
    </el-form-item>
    <el-form-item label="关闭添加(子节点)">
      <el-switch v-model="value.closeAddChild"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "GroupListConfig",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="less" scoped>
/deep/ .el-form-item__label {
  padding: 0 12px 0 0;
  width: 120px !important;
}
</style>

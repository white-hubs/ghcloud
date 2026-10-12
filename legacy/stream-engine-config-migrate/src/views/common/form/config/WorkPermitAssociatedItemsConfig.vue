<template>
  <div>
    <el-form-item label="关联作业类型">
      <el-select v-model="value.params" placeholder="请选择作业类型组件" size="small" clearable>
        <el-option v-for="item in options" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="关联作业等级">
      <el-select v-model="value.params2" placeholder="请选择作业等级组件" size="small" clearable>
        <el-option v-for="item in options" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "WorkPermitAssociatedItemsConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    options() {
      return this.$store.state.design.formItems || [];
    },
  },
};
</script>

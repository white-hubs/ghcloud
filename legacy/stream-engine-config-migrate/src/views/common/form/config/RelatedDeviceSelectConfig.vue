<template>
  <div>
    <el-form-item label="是否多选">
      <el-switch v-model="value.multiple"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "RelatedDeviceSelectConfig",
  props: {
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
};
</script>

<style scoped></style>

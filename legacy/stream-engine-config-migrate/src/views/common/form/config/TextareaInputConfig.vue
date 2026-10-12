<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit />
    </el-form-item>
    <el-form-item label="默认值">
      <el-input size="small" v-model="value.defaultValue" />
    </el-form-item>
    <el-form-item label="显示行数">
      <el-input-number min="2" max="99" :step="1" step-strictly size="small" v-model="value.rows" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "TextareaInput",
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

<style scoped></style>

<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit/>
    </el-form-item>
    <el-form-item label="默认值">
      <el-switch v-model="value.defaultValue"></el-switch>
      <span style="display:block;line-height: normal;">勾选后自动带出发起人</span>
    </el-form-item>
    <el-form-item label="是否多选">
      <el-switch v-model="value.multiple"></el-switch>
    </el-form-item>
  </div>

</template>

<script>
export default {
  name: "OrgPicker",
  components: {},
  props:{
    value:{
      type: Object,
      default: ()=>{
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

<style scoped>

</style>

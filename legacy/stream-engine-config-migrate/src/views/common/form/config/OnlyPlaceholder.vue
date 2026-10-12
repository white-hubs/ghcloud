<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit/>
    </el-form-item>
  </div>

</template>

<script>
export default {
  name: "TextInput",
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
    return {

    }
  },
  methods: {}
}
</script>

<style scoped>

</style>

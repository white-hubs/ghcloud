<template>
  <div>
    <el-form-item label="最大值">
      <el-input-number size="small" v-model="value.rateNum" placeholder="默认为5"/>
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
        return {
          rateNum:5
        }
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

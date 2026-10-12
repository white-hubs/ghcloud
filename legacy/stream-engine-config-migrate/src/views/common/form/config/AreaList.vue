<template>
  <div>
    <el-form-item label="数据源">
      <el-input size="small" v-model="value.api"/>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "AreaList",
  components: {},
  props:{
    value:{
      type: Object,
      default: ()=>{
        return {
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

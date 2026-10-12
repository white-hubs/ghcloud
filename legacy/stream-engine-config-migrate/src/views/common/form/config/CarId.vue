<template>
  <el-form-item label="关联参数">
     <el-select v-model="value.params" placeholder="请选择" size="small" clearable>
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.title"
          :value="item.id">
        </el-option>
      </el-select>
  </el-form-item>
</template>

<script>
/*车牌号码配置*/
export default {
  name: "CarId",
  components: {},
  props:{
    value:{
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  created(){
    this.getData()
  },
  computed:{
     forms() {
      return this.$store.state.design.formItems;
    },
  },
  data() {
    return {
       options: [],
    }
  },
  methods: {
    getData(){
      this.options = this.$store.state.design.formItems
    }
  }
}
</script>

<style scoped>

</style>

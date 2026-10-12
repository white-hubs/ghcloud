<template>
  <div>
    <el-form-item label="请假类型">
      <el-select v-model="value.params" placeholder="请选择" size="small">
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.title"
            :value="item.id">
          </el-option>
        </el-select>
    </el-form-item>
    <el-form-item label="请假时间">
      <el-select v-model="value.params2" placeholder="请选择" size="small">
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.title"
            :value="item.id">
          </el-option>
        </el-select>
    </el-form-item>
  </div>
  
</template>

<script>
/*人员档案基础配置*/
export default {
  name: "ArchivesInput",
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
      // this.$api.getAuthenticatedUserPage().then(res=>{
      //   this.options = res?.records??res
      // })
      this.options = this.$store.state.design.formItems
    }
  }
}
</script>

<style scoped>

</style>

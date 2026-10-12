<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select class="max-fill" v-if="!expanding" size="medium" v-model="_value" disabled :placeholder="placeholder"/>
    </div>
    <div v-else>
      <el-select class="max-fill" v-if="!expanding" v-model="_value" size="medium" clearable :placeholder="placeholder">
        <el-option v-for="(op, index) in options" :key="index" :value="op.id" :label="op.name"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "SupplementClass",
  components: {},
  props:{
    value:{
      type: String,
      default: null
    },
    placeholder:{
      type: String,
      default: '请选择选项'
    },
    expanding:{
      type: Boolean,
      default: false
    },
     formData: {
      type: Object,
      default: null,
    },
    params: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
        options:[]
    }
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.getData();
    }
  },
   watch:{
    repairDate:{
      deep:true,
      handler:function(n,o){
        this.getData()
      }
    }
  },
  computed:{
    userId(){
      let id = this.formData.sponsorId
      return id
    },
    repairDate(){
      let id = this.params?this.formData[this.params]:null
      return id
    },
  },
  methods: {
    getData(id){
      if(this.userId&&this.repairDate){
        this.$api.getClockClasses({userId:this.userId,repairDate:this.repairDate}).then(res=>{
          this.options = res
        })
      }

    }
  }
}
</script>

<style scoped>

</style>

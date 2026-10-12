<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select class="max-fill" v-if="!expanding" size="medium" v-model="_value" disabled :placeholder="placeholder"/>
    </div>
    <div v-else>
      <template v-if="timeUnit === 'HALF_DAY'">
       <el-select class="max-fill"  size="medium" v-model="timeUnitValue" >
         <el-option v-for="(op, index) in options" :key="index" :value="op.value" :label="op.label"></el-option>
      </el-select>
      <el-date-picker v-if="timeUnitValue" v-model="curValue" @change="changeDate" value-format="yyyy-MM-dd" size="medium"  type="date" :placeholder="placeholder"></el-date-picker>
      </template>
      <el-date-picker v-else v-model="curValue" @change="changeDate" value-format="yyyy-MM-dd HH:mm:ss" size="medium" clearable type="datetimerange"  start-placeholder="开始日期"
      end-placeholder="结束日期"></el-date-picker>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "VacationDate",
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
        options:[
          {label:"上午",value:'AM'},
          {label:"下午",value:'PM'},
        ],
        timeUnit:null,
        timeUnitValue:null,
         curValue: "",
    }
  },
  watch:{
    type:{
      deep:true,
      handler:function(n,o){
        this.getData()
      }
    }
  },
  computed:{
    type(){
      let id = this.params?this.formData[this.params]:""
      return id
    }
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.getData();
    }
  },
  methods: {
    getData(){
      /*
      示例一: 2020-01-01 00:00:00,2020-02-02 18:00:00,TIME_RANGE
      示例二: 2020-01-01,AM 表示1月1日上午
      示例三: 2020-01-01,PM 表示1月1日下午
      */

      if(this.type){
        this.timeUnitValue = null
        this.curValue = null
        this.$api.getHolidayDetailType(this.type).then(res=>{
          this.timeUnit = res.minimumLeaveTimeUnitConvert.minimumLeaveTimeUnit
        })
      }
     
    },
    changeDate(){
      if(this.timeUnit === 'HALF_DAY'){
        this.$emit("input", this.curValue+','+this.timeUnitValue);
      }else{
        let time = this.curValue?this.curValue.join(','):null
        this.$emit("input", time+',TIME_RANGE');
      }
    }
  }
}
</script>

<style scoped>

</style>

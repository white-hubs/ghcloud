<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input size="medium" :disabled="true" :placeholder="placeholder"/>
    </div>
    <div v-else>
      <el-input size="medium" :disabled="disabled" clearable v-model="curValue" :placeholder="placeholder"/>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "DepartureTimeLength",
  components: {},
  props: {
    value: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '系统自动计算'
    },
      formData: {
      type: Object,
      default: null,
    },
     params: {
      type: String,
      default: null,
    },
    params2: {
      type: String,
      default: '',
    },
  },
 data() {
    return {
      curValue: "",
      periodString:""
    };
  },
 watch:{
    workOvertimeType:{
      deep:true,
      handler:function(n,o){
        if (this.mode !== "DESIGN") {
          this.getTime();

        }
      }
    },
    period:{
      deep:true,
      handler:function(n,o){
        if (this.mode !== "DESIGN") {
          this.getTime();
        }
      }
    },
  },
  computed:{
    workOvertimeType(){
      let id = this.params?this.formData[this.params]:""
      return id
    },
    period(){
      let id = this.params2?this.formData[this.params2]:""
      return id
    },
  },
  methods: {
    getData(workOvertimeType,period) {
      this.$api.getWorkOvertimeDuration({
            workOvertimeType:workOvertimeType,
            period:period
          }).then(res=>{
              this._value = {
                name: res?.name??"",
                id: res?.id??""
              };
              this.curValue = res.name;
          })
    },
    getTime(){
      if(this.workOvertimeType&&this.period){
        let period = this.period.join(',')
        this.$api.getWorkOvertimePeriod({
          workOvertimeType:this.workOvertimeType,
              period:period
        }).then(res=>{
          this.periodString = res?.name??null
          if(this.periodString){
            this.getData(this.workOvertimeType,this.periodString)
          }else{
            this.getData(this.workOvertimeType,period)
          }

        })
      }
    
    }
  },
}
</script>

<style scoped>

</style>

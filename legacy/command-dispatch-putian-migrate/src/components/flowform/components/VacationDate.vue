<template>
  <div>
    <template v-if="timeUnit === 'HALF_DAY'">
      <VacationDateHalf :disabled="disabled" v-model:value="curValue" :value="[]" />
    </template>
    <a-range-picker v-else v-model:value="momentValue" :show-time="showTimeFormat" :disabled="disabled" @change="changeDate" :format="valueFmt" size="medium" style="width:100%"></a-range-picker>
  </div>
</template>

<script>
import moment from 'moment'
import componentMinxins from '../ComponentMinxins'
import VacationDateHalf from './vacation-date/vacation-date-half.vue'

const format = 'YYYY-MM-DD HH:mm'

export default {
  mixins: [componentMinxins],
  name: "VacationDate",
  components: { VacationDateHalf },
  props: {
    value: {
      type: Array,
    },
    placeholder: {
      type: String,
      default: "请选择选项",
    },
    expanding: {
      type: Boolean,
      default: false,
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
    const [start, end] = this.value ?? []
    return {
      options: [
        { label: "上午", value: 'AM' },
        { label: "下午", value: 'PM' },
      ],
      timeUnit: null,
      timeUnitValue: null,
      curValue: [start, end],
      momentValue: this.value ? [moment(start, format), moment(end, format)] : null
    }
  },
  watch: {
    type: {
      deep: true,
      handler: function (n, o) {
        this.getData()
        this.momentValue=[]
      }
    },
    curValue: function (n, o) {
      this._value = n
    },
    momentValue: function (n, o) {
      this._value = n.map(d => d.format(this.valueFmt))
    }
  },
  computed: {
    type() {//假期类型
      let id = this.params ? this.formData[this.params] : ""
      return id
    },
    disabled() {
      if(!this.type){
        return true;
      }
      return !this.$route.query.type||this.$route.query.type === 'detail'
    },
    showTimeFormat(){
      return this.timeUnit==='HOUR'?{ format: 'HH:mm'}:null
    },
    valueFmt(){
      let val='YYYY-MM-DD HH:mm';
      if(this.type){
        if(this.timeUnit==='DAY'){
          val='YYYY-MM-DD'
        }
      }
      return val
    }
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.getData();
    }
  },
  methods: {
    getData() {
      /*
        小时：["2022-01-01 09:00","2022-01-01 18:00"]
         * 天:  ["2022-01-01","2022-01-01"]
         * 上午：["2022-01-01,AM","2022-01-01,AM"]
         * 下午: ["2022-01-01,PM","2022-01-01,PM"]
      */

      if (this.type) {
        this.timeUnitValue = null
        this.$api.getHolidayDetailType(this.type?.id).then(res => {
          this.timeUnit = res.minimumLeaveTimeUnitConvert.minimumLeaveTimeUnit
        })
      }

    },
  }
}
</script>

<style scoped>

</style>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-time-picker size="medium" is-range v-model="_value" disabled range-separator="至" :start-placeholder="placeholder[0]" :end-placeholder="placeholder[1]"/>
    </div>
    <div v-else>
      <el-time-picker v-model="_value" is-range size="medium" clearable range-separator="至"  :start-placeholder="placeholder[0]" :end-placeholder="placeholder[1]"/>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "TimePickerRange",
  components: {},
  props:{
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    format:{
      type: String,
      default: 'yyyy-MM-dd HH:mm'
    },
    placeholder:{
      type: Array,
      default: ()=>{
        return ['开始时间', '结束时间']
      }
    },
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
.length{
  margin-top: 5px;
}
.length:nth-child(2){
  color: #8c8c8c;
}
</style>

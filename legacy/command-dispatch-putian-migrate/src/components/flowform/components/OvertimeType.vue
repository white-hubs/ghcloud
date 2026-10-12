<template>
  <div>
    <a-select class="max-fill" :disabled="disabled" v-if="!expanding" v-model:value="_value" size="medium" clearable :placeholder="placeholder">
        <a-select-option v-for="(op, index) in options" :key="index" :value="op.value">{{op.label}}</a-select-option>
      </a-select>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "OvertimeType",
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
  },
   computed: {
    disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
    }
  },
  data() {
    return {
        options:[{
            label:'工作日',
            value:'WORK'
        },{
            label:'休息日',
            value:'REST',
        },{
            label:'节假日',
            value:'FESTIVAL', 
        }]
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>

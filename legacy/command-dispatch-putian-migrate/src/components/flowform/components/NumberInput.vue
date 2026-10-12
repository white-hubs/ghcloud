<template>
  <div>
    <a-input-number :disabled="disabled" v-model:value="_value" size="default" clearable :placeholder="placeholder" type="number"/>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "NumberInput",
  components: {},
  props:{
    value:{
      type: Number,
      default: null
    },
    placeholder:{
      type: String,
      default: '请输入数值'
    }
  },
     computed: {
    disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>

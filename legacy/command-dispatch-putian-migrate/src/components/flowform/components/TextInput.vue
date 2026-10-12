<template>
  <div>
    <a-input size="default" :disabled="disabled" clearable v-model:value="_value" :placeholder="placeholder"/>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "TextInput",
  components: {},
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },    
    defaultValue: {
      type: String,
      default: null
    },
  },
  computed:{
    disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
    }
  },
  created(){
    if(this.defaultValue){
      this._value=this.defaultValue;
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

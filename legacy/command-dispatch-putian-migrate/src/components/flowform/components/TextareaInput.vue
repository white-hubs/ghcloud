<template>
  <div>
    <a-input :disabled="disabled" size="default" v-model:value="_value" clearable :maxlength="255"  :placeholder="placeholder" show-word-limit :rows="3" type="textarea"/>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "TextareaInput",
  components: {},
  props:{
    value: {
      type: String,
      default: null
    },
    placeholder:{
      type: String,
      default: '请输入内容'
    },
    defaultValue: {
      type: String,
      default: null
    },
  },
  computed: {
    _value: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
        this.$emit("update:value", val);
      }
    },
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

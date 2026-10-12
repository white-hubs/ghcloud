<template>
  <div>
    <a-date-picker
      :disabled="disabled"
      v-model:value="_value"
      :format="antFormat"
      size="default"
      :show-time="{ format: 'HH:mm' }"
      clearable
      :placeholder="placeholder"
    ></a-date-picker>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import moment from 'moment'
export default {
  mixins: [componentMinxins],
  name: "DateTime",
  components: {},
  props: {
    value: {
      default: null,
    },
    format: {
      type: String,
      default: "YYYY-MM-DD HH:mm:ss",
    },
    placeholder: {
      type: String,
      default: "请选择日期时间",
    },
    defaultValue: {
      type: String,
      default: null
    },
    autoCurrentTime:{
      type: Boolean,
      default: false
    }
  },
  computed: {
    antFormat() {
      switch (this.format) {
        case "yyyy":
          return "YYYY";
        case "yyyy-MM":
          return "YYYY-MM";
        case "yyyy-MM-dd":
          return "YYYY-MM-DD";
        case "yyyy-MM-dd HH:mm":
          return "YYYY-MM-DD HH:mm";
        case "yyyy-MM-dd HH:mm:ss":
          return "YYYY-MM-DD HH:mm:ss";
        default:
          return "YYYY-MM-DD HH:mm:ss";
      }
    },
    disabled() {
      return !this.$route.query.type||this.$route.query.type === 'detail';
    },
  },
  data() {
    return {};
  },
  created(){
    if(this.defaultValue){
      this._value=this.defaultValue;
    }
    if(this.autoCurrentTime){
      this._value=moment().format()
    }
  },
  methods: {},
};
</script>

<style scoped>
</style>

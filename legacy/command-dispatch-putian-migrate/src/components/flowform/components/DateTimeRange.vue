<template>
  <div>
    <a-range-picker
      :disabled="disabled"
      show-time
      v-model:value="_value"
      :format="antFormat"
      :valueFormat="antFormat"
      size="default"
      clearable
      :type="type"
      :placeholder="placeholder"
    ></a-range-picker>
    <div v-if="showLength" class="length">
      <span>时长：</span>
      <span>{{ timeLength }}</span>
    </div>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import moment from "moment";

export default {
  mixins: [componentMinxins],
  name: "DateTimeRange",
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
      default: '请选择日期时间'
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
  computed:{
    antFormat() {
      switch (this.format) {
        case "yyyy":
          return "YYYY";
        case "yyyy-MM":
          return "YYYY-MM";
        case "yyyy-MM-dd":
          return "YYYY-MM-DD";
        case "yyyy-MM-dd HH:mm":
          return "YYYY-MM-DD HH:mm:ss";
        case "yyyy-MM-dd HH:mm:ss":
          return "YYYY-MM-DD HH:mm:ss";
        default:
          return "YYYY-MM-DD HH:mm:ss";
      }
    },
    disabled() {
      return !this.$route.query.type||this.$route.query.type === 'detail';
    },
    timeLength() {
      //求时长算法
      if (Array.isArray(this.value)) {
        let start = moment(this.value[0]).format(
          this.format.replaceAll("dd", "DD")
        );
        let end = moment(this.value[1]).format(
          this.format.replaceAll("dd", "DD")
        );
        if (start === end) {
          return "0 （时长为0，请确认）";
        }
        let mstart = moment(start);
        let mend = moment(end);
        let years = mend.diff(start, "years");
        let months = mend.diff(start, "months");
        let days = mend.diff(start, "days");
        let hours = mend.diff(start, "hours");
        let minutes = mend.diff(start, "minutes");
        minutes = minutes % 60;
        hours = hours % 24;
        months = months % 12;
        //因为每月天不固定，所以天要特殊动态处理
        if (mstart.date() < mend.date()) {
          days = mend.date() - mstart.date();
          if (minutes > 0 || hours > 0) {
            days--;
          }
        }
        //处理超过俩月且天超过31
        if (days > 31 && mend.month() - mstart.month() >= 2) {
          //将日期推至上月求差
          days = mend.diff(
            mstart.add(mend.month() - mstart.month() - 1, "month"),
            "days"
          );
        }
        return `${years > 0 ? years + "年 " : " "}${
          months > 0 ? months + "个月 " : " "
        }
                ${days > 0 ? days + "天 " : " "}${
          hours > 0 ? hours + "小时 " : " "
        }
                ${minutes > 0 ? minutes + "分钟 " : " "}`;
      } else {
        return "先选择时间哦";
      }
    },
  },
  created(){
    if(this.defaultValue){
      this._value=[this.defaultValue,this.defaultValue];
    }
    if(this.autoCurrentTime){
      this._value=[moment().format(),moment().format()];
    }
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped>
</style>

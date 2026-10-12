<template>
  <div>
    <a-input
      size="medium"
      clearable
      :disabled="disabled"
      v-model:value="curValue"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
import moment from "moment";
import componentMinxins from "../ComponentMinxins";
export default {
  mixins: [componentMinxins],
  name: "OvertimeLength",
  components: {},
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "系统自动计算",
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
      default: "",
    },
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      curValue: "",
      periodString: "",
    };
  },
  watch: {
    workOvertimeType: {
      deep: true,
      handler: function (n, o) {
        if (this.mode !== "DESIGN") {
          this.getTime();
        }
      },
    },
    period: {
      deep: true,
      handler: function (n, o) {
        if (this.mode !== "DESIGN") {
          this.getTime();
        }
      },
    },
  },
  computed: {
    workOvertimeType() {
      let id = this.params ? this.formData[this.params] : "";
      return id;
    },
    period() {
      let id = this.params2 ? this.formData[this.params2] : "";
      return id;
    },
  },
  mounted() {
    if (this.value) {
      this.curValue = this.value.name;
    }
    this.getTime();
  },
  methods: {
    getData(workOvertimeType, period) {
      this.$api
        .getWorkOvertimeDuration({
          workOvertimeType: workOvertimeType,
          period: period,
        })
        .then((res) => {
          this._value = {
            name: res?.name ?? "",
            id: res?.id ?? "",
          };
          this.curValue = res.name;
        });
    },
    getTime() {
      const isDetail = this.$route.query.type === "detail";
      if (!this.period) return;
      const start = moment(this.period[0]).format("YYYY-MM-DD HH:mm:ss");
      const end = moment(this.period[1]).format("YYYY-MM-DD HH:mm:ss");
      const diff = moment(end).diff(start, "minutes");
      if (diff < 0) return this.$message.error("请选择正确的时间区间");
      if (this.workOvertimeType && this.period && !isDetail) {
        let period = [
          moment(this.period[0]).format("YYYY-MM-DD HH:mm:ss"),
          moment(this.period[1]).format("YYYY-MM-DD HH:mm:ss"),
        ].join(",");
        this.$api
          .getWorkOvertimePeriod({
            workOvertimeType: this.workOvertimeType,
            period: period,
          })
          .then((res) => {
            this.periodString = res?.name ?? null;
            if (this.periodString) {
              if(this.formData[this.params2].toString()!==this.periodString.split(",").toString()){
                this.formData[this.params2] = this.periodString.split(",");
              }
              this.getData(this.workOvertimeType, this.periodString);
            } else {
              this.getData(this.workOvertimeType, period);
            }
          });
      }
    },
  },
};
</script>

<style scoped>
</style>

<template>
  <div>
    <a-input size="medium" clearable :disabled="disabled" v-model:value="curValue" :placeholder="placeholder" />
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
export default {
  mixins: [componentMinxins],
  name: "VacationLength",
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
      unitStr: {
        DAY: "天",
        HOUR: "小时",
      }
    };
  },
  watch: {
    workVacationType: {
      deep: true,
      handler: function (n, o) {
        if (this.mode !== "DESIGN") {
          this.curValue='';
          this._value=null;
          setTimeout(() => {
            this.getTime();
          }, 0);
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
    workVacationType() {
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
    getTime() {
      const isDetail = this.$route.query.type === "detail";
      if ((!this.period||this.period.length===0)||!this.workVacationType) return;

      const params = {
        "holidayType": this.workVacationType.id,
        "leaveTimeStr": `["${this.period[0]}","${this.period[1]}"]`
      }
      this.$api.getVacationDuration(params).then(res => {
        this._value = {
          unit: res?.unit ?? "",
          value: res?.value ?? "",
        };
        this.curValue = res.value + this.unitStr[res.unit];
      })
    },
  },
};
</script>

<style scoped>

</style>

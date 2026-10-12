<template>
  <div>
    <a-input size="medium" clearable :disabled="disabled" v-model:value="curValue" :placeholder="placeholder" />
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
export default {
  mixins: [componentMinxins],
  name: "VacationBalance",
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
    workVacationType: {
      deep: true,
      handler: function (n, o) {
        if (this.mode !== "DESIGN") {
          this.getBalance();
        }
      },
    }
  },
  computed: {
    workVacationType() {
      let id = this.params ? this.formData[this.params] : "";
      return id;
    },
    userId(){
       let user = this.formData.sponsorId
      return user&&user.id?user.id:user
    },
  },
  mounted() {
    // if (this.value) {
    //   this.curValue = this.value.name;
    // }
    this.getBalance();
  },
  methods: {

    getBalance() {
      if(!this.workVacationType){
        return;
      }
      const params={
        "staffId":this.userId,
        "holidayType":this.workVacationType.id
      }
      this.$api.getVacationBalance(params).then(res=>{
        this.curValue = res;
        if(res==='NO_LIMITED'){
          this.curValue = '不限制';
        }
        if(res==='NOT_CONFIGURED'){
          this.curValue = '-';
        }
        this._value=res;
      })
    },
  },
};
</script>

<style scoped>

</style>

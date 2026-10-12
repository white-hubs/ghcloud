<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input size="medium" disabled :placeholder="placeholder" key="DESIGN"/>
    </div>
  </div>
</template>

<script>
/*考勤档案公用组件*/
import componentMinxins from "../ComponentMinxins";

export default {
  mixins: [componentMinxins],
  name: "AttendanceStat",
  components: {},
  props: {
    value: {
      type: Object,
      default: null,
    },
    formData: {
      type: Object,
      default: null,
    },
    placeholder: {
      type: String,
      default: "系统自动拉取数据",
    },
    params: {
      type: String,
      default: null,
    },
    attr: {
      type: String,
      default: 'gender',
    },
  },
  data() {
    return {
      curValue: "",
    };
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.getData();
    }
  },
 watch:{
    associationId:{
      deep:true,
      handler:function(n,o){
        let ids = n
        if(n instanceof Array){
          ids = n.map(item=>item.id).join(',')
        }else if(n instanceof Object){
          ids = n?.id??""
        }
        this.getData(ids)
      }
    }
  },
  computed:{
    associationId(){
      let id = this.params?this.formData[this.params]:""
      return id
    }
  },
  methods: {
    getData(data) {
      let id = data?data:(this.formData?.sponsorId??"")
      this.$api.getStaffInfo({
        attr:this.attr,
        id:id
      }).then(res=>{
         this._value = {
          name: res?.name??"",
          id: res?.id??""
        };
        this.curValue = res.name;
      })
    },
  },
};
</script>

<style scoped>
</style>

<template>
  <div>
     <a-input
        size="medium"
        disabled
        clearable
        v-model:value="curValue"
        :placeholder="this.placeholder"
        key="SHOW"
      />
  </div>
</template>

<script>
/*人员档案公用组件*/
import componentMinxins from "../ComponentMinxins";

export default {
  mixins: [componentMinxins],
  name: "SponsorInput",
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
      default: "默认为发起人性别",
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
    associationId:{//管理表单其他组件的id
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
      this.$api.getStaffDetail({
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

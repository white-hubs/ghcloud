<template>
  <div>
     <a-input  size="medium" disabled  v-model:value="curName"  v-if="curName"></a-input>
      <a-select  class="max-fill" v-else v-model:value="curValue" :disabled="disabled" size="medium" clearable :placeholder="placeholder" @change="changeValue">
        <a-select-option v-for="(op, index) in options" :key="index" :value="op.id">{{op.name}}</a-select-option>
      </a-select>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "ChangeClass",
  components: {},
  props:{
    value:{
      type: String,
      default: null
    },
    placeholder:{
      type: String,
      default: '请选择选项'
    },
    expanding:{
      type: Boolean,
      default: false
    },
       formData: {
      type: Object,
      default: null,
    },
     params: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
        options:[],
        curValue:null,
        curName:null,

    }
  },
  created() {
    if (this.mode !== "DESIGN") {
      // this.getData();
    }
    if(this.value){
      this.curValue = this.value.id
      this.curName = this.value.name
    }
  },
   watch:{
    userId:{
      deep:true,
      handler:function(n,o){
        if (this.mode !== "DESIGN") {
          this.curValue=null;
          this.getData();
          this.$emit("input", '');
          this.$emit("update:value", '');
        }
      }
    },
  },
  computed:{
    userId(){
      let user = this.params?this.formData[this.params]:this.formData.sponsorId
      return user&&user.id?user.id:user
    },
    disabled(){
      return !this.userId
    }
  },
  methods: {
    getData(){
      this.$api.getWorkClasses({userId:this.userId}).then(res=>{
        this.options = res
      })
    },
    changeValue(){
      const data  = this.options.filter(item=>item.id === this.curValue)
      this.$emit("input", data[0]);
      this.$emit("update:value", data[0]);
    }
  }
}
</script>

<style scoped>

</style>

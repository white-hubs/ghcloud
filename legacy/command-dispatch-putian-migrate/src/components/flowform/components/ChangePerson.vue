<template>
  <div>
    <a-input  size="medium" disabled  v-model:value="curName"  v-if="curName"></a-input>
      <a-select class="max-fill" v-else v-model:value="curValue" size="medium" clearable :placeholder="placeholder" @change="changeValue">
        <a-select-option v-for="(op, index) in options" :key="index" :value="op.id">{{op.name}}</a-select-option>
      </a-select>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "VacationType",
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
      this.getData();
    }
     if(this.value){
      this.curValue = this.value.id
      this.curName = this.value.name
    }
  },
  methods: {
    getData(){
      this.$api.getWorkUsers().then(res=>{
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

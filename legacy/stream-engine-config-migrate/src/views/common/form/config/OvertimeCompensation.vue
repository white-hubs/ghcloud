<template>
  <div>
    <el-form-item label="加班类型">
      <el-cascader v-model="params" :options="options" :props="{value:'id' ,label:'title',children:'children'}" clearable @change="(val)=>{changeParams(val)}"/>
    </el-form-item>
  </div>
  
</template>

<script>
export default {
  name: "OvertimeCompensation",
  components: {},
  props:{
    value:{
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  created(){
    this.getData()
    this.params=this.value.params.split(',')
  },
  computed:{
     forms() {
      return this.$store.state.design.formItems;
    },
  },
  data() {
    return {
       options: [],
       params:[],
    }
  },
  methods: {
    getData(){
      const tableData = [];
      const pushTableData = (formItem, parent) => {
        if (formItem.name === "GroupList") {
          tableData.push({
            ...formItem,
            children: [],
          });
        } else if (parent) {
          const father = tableData.find(x => x.id === parent.id)
          father.children && father.children?.push(formItem);
        } else {
          tableData.push(formItem);
        }
      };
      this.$store.state.design.formItems.forEach((item) => {
        if (item.name === "GroupList") {
          pushTableData(item)
          if (item.props.items?.length) {
            item.props.items.forEach((element) =>
              pushTableData(element, item)
            );
          }
        } else {
          pushTableData(item)
        }
      });
      
      this.options=tableData
    },
    changeParams(val){
        this.value.params=val.join(',')
    }
  }
}
</script>

<style scoped>

</style>

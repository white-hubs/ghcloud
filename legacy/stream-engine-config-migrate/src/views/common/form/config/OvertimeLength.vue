<template>
  <div>
    <el-form-item label="加班类型">
      <el-cascader v-model="params" :options="options" :props="{value:'id' ,label:'title',children:'children'}" clearable @change="(val)=>{changeParams(val,1)}"/>
    </el-form-item>
    <el-form-item label="加班时间">
      <el-cascader v-model="params2" :options="options" :props="{value:'id' ,label:'title',children:'children'}" clearable  @change="(val)=>{changeParams(val,2)}"/>
    </el-form-item>
  </div>
</template>

<script>
/*人员档案基础配置*/
export default {
  name: "ArchivesInput",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  created() {
    this.getData()
   this.params=this.value.params.split(',')
   this.params2=this.value.params2.split(',')
  },
  computed: {
    forms() {
      return this.$store.state.design.formItems;
    },
  },
  data() {
    return {
      options: [],
      params:[],
      params2:[]
    }
  },
  methods: {
    getData() {
      // this.$api.getAuthenticatedUserPage().then(res=>{
      //   this.options = res?.records??res
      // })
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
    changeParams(val,index){
      if(index===1){
        this.value.params=val.join(',')
      }else{
        this.value.params2=val.join(',')
      }
    }
  },
}
</script>

<style scoped></style>

<template>
  <div style="max-width: 350px">
     <a-button :disabled="disabled" type="primary" shape="round" @click="$refs.orgPicker.show()"> 选择部门</a-button>
      <org-picker title="部门" :url="'deptList'" :columns="columns" ref="orgPicker" :activeId="activeId" @close="selected"/>
      <span class="placeholder"> {{placeholder}}</span>
      <div style="margin-top: 5px">
        <div class="org-item" style="margin: 5px" :key="i"  v-for="(dept, i) in _value">{{dept.name}}
          <CloseOutlined  @click="delDept(dept)"/>
        </div>
      </div>
  </div>
</template>

<script lang="jsx">
import {
CloseOutlined
} from '@ant-design/icons-vue';
import componentMinxins from '../ComponentMinxins';
import OrgPicker from "./OrgPicker";
export default {
  mixins: [componentMinxins],
  name: "DeptPicker",
  components: {OrgPicker,CloseOutlined},
  props: {
    value:{
      type: Array,
      default: () => {
        return []
      }
    },
    placeholder: {
      type: String,
      default: '请选择部门'
    },
    multiple:{
      type: Boolean,
      default: false
    }
  },
  computed:{
     disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
    }
  },
  data() {
    return {
     columns: [
        {
          title: "部门名称",
          dataIndex: "name",
          align: "left",
           customRender: ({ text }) => {
             return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "人数",
          dataIndex: "members",
          align: "left",
          customRender: ({ text }) => {
            if (text) {
              return  <PopOver content={text}>{text}</PopOver>;
            } else {
              return  <PopOver content='0'>0</PopOver>;
            }
          },
        },
        {
          title: "备注",
          dataIndex: "remark",
          align: "left",
          customRender: ({ text }) => {
            if (text) {
              return text;
            } else {
              return "--";
            }
          },
        },
      ],
      activeId:[]
    }
  },
  methods: {
    selected(values){
      if(values){
        this._value = values
        this.activeId = []
        values.forEach(item=>{
          this.activeId.push(item.id) 
        })
      }
    },
    delDept(i){
      this._value.splice(this._value.findIndex(item=>item.id ===i.id), 1)
        this.activeId = []
        this._value.forEach(item=>{
          this.activeId.push(item.id) 
        })
    }
  }
}
</script>

<style scoped>
.placeholder{
  margin-left: 10px;
  color: #adabab;
  font-size: smaller;
}
.org-item{
  display: inline-block;
  height: 24px;
  padding: 0 5px;
  line-height: 24px;
  border: 1px solid transparent;
    box-shadow: 0 2px #00000004;
    color: #000000d9;
    background: #fff;
    border-color: #d9d9d9;
}
</style>

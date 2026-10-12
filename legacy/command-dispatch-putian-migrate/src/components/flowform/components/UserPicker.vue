<template>
  <div style="max-width: 350px">
    <a-button type="primary" shape="round" @click="$refs.orgPicker.show()" :disabled="disabled"> 选择人员</a-button>
      <org-picker title="人员" :url="'getStaffList'" :columns="columns" ref="orgPicker" :activeId="activeId" @close="selected"/>
      <span class="placeholder"> {{placeholder}}</span>
      <div style="margin-top: 5px">
        <div class="org-item" style="margin: 5px" :key="i"  v-for="(dept, i) in _value">{{dept.name}}
          <CloseOutlined v-if="!disabled" @click="delDept(dept)"/>
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
  name: "UserPicker",
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
      default: '请选择人员'
    },
    multiple:{
      type: Boolean,
      default: false
    },
    defaultValue:{
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: null,
    },
  },
  computed:{
    disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
    },
    userId() {
      return this.formData.sponsorId;
    },
  },
  data() {
    return {
     columns: [
        {
          title: "人员名称",
          dataIndex: "name",
          align: "left",
           customRender: ({ text }) => {
             return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "性别",
          dataIndex: "genderName",
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
          title: "联系电话",
          dataIndex: "mobile",
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
  },
  mounted() {
    if (this.defaultValue) {
      const formParams = {
        id:this.userId
      };
      this.$api['getStaffDetail'](formParams).then((res) => {
        if(res){
          this.selected([res])
        }
      });
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

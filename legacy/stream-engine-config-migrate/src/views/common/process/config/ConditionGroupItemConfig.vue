<template>
  <div>
    <div v-for="(group, index) in selectedNode.props.groups" :key="index + '_g'" class="group">
      <div class="group-header">
        <span class="group-name">条件组 {{ groupNames[index] }}</span>
        <div class="group-cp">
          <span>组内条件关系：</span>
          <el-switch v-model="group.groupType" active-color="#409EFF"
                     inactive-color="#c1c1c1" active-value="AND" inactive-value="OR"
                     active-text="且" inactive-text="或"/>
        </div>
        <div class="group-operation">
          <el-popover placement="bottom" title="选择审批条件" width="300" trigger="click">
            <!-- <div>以下条件将决定具体的审批流程</div>-->
            <el-checkbox-group v-model="group.cids" value-key="id">
              <el-checkbox :label="condition.id" v-for="(condition, cindex) in conditionList" :key="condition.id" @change="conditionChange(cindex, group)">
                {{ condition.title }}
              </el-checkbox>
            </el-checkbox-group>
            <i class="el-icon-plus" slot="reference"></i>
          </el-popover>
          <i class="el-icon-delete" @click="delGroup(index)"></i>
        </div>
      </div>
      <div class="group-content">
        <p v-if="group.conditions.length === 0">点击右上角 + 为本条件组添加条件 ☝</p>
        <div v-else>
          <el-form ref="condition-form" label-width="100px">
            <!--构建表达式-->
            <el-form-item  v-for="(condition, cindex) in group.conditions" :key="condition.id + '_' + cindex" >
              <ellipsis slot="label" hover-tip :content="condition.title"/>
              <span v-if="['VacationLength','OvertimeLength','DepartureTimeLength'].includes(condition.name)">
                <el-select size="small" placeholder="判断符" style="width: 120px;" v-model="condition.compare" @change="condition.value = []">
                  <el-option :label="exp.label" :value="exp.value" :key="exp.value" v-for="exp in explains"></el-option>
                </el-select>
                <span style="margin-left: 10px">
                  <el-input-number style="width: 280px;" size="small" placeholder="输入比较值" type="number" v-model="condition.value[0]" :min="0" :precision="2" :max="999.99" :controls="true" controls-position="right"  v-if="conditionValType(condition.compare) === 0">
                    <span slot="suffix">天</span>
                  </el-input-number>
                  <el-select style="width: 280px;" multiple filterable allow-create v-else-if="conditionValType(condition.compare) === 1" size="small" v-model="condition.value" placeholder="输入可能包含的值"></el-select>
                  <span v-else>
                    <el-input-number style="width: 130px;" size="small" type="number" placeholder="输入比较值" v-model="condition.value[0]" :min="0" :max="condition.value[1]||999.99" :precision="2" :controls="true" controls-position="right"><span slot="suffix">天</span></el-input-number>
                    <span> ~
                      <el-input-number size="small" style="width: 130px;" type="number" placeholder="输入比较值" v-model="condition.value[1]" :min="condition.value[0]||0" :max="999.99" :precision="2" :controls="true" controls-position="right"><span slot="suffix">天</span></el-input-number>
                    </span>
                  </span>
                </span>
              </span>
              <span v-else-if="condition.valueType === ValueType.string||  condition.valueType === ValueType.array">
                <el-select size="small" placeholder="判断符" style="width: 120px;" v-model="condition.compare" @change="condition.value = []">
                  <el-option label="等于" value="="></el-option>
                  <el-option label="属于" value="IN"></el-option>
                </el-select>
                 <span v-if="isSelect(condition.id)" style="margin-left: 10px">
                   <el-select v-if="condition.compare === 'IN'" style="width: 280px;" clearable multiple size="small" v-model="condition.value" placeholder="选择值">
                     <el-option v-for="(option, oi) in getOptions(condition.id)" :key="oi" :label="option" :value="option"></el-option>
                   </el-select>
                   <el-select v-else style="width: 280px;" clearable size="small" v-model="condition.value[0]" placeholder="选择值">
                     <el-option v-for="(option, oi) in getOptions(condition.id)" :key="oi" :label="option" :value="option"></el-option>
                   </el-select>
                 </span>
                 <span v-else style="margin-left: 10px">
                   <el-input v-if="condition.compare === '='" style="width: 280px;" placeholder="输入比较值" size="small" v-model="condition.value[0]"/>
                   <el-select v-else style="width: 280px;" value-key="id" multiple clearable filterable allow-create size="small"  v-model="condition.value" placeholder="输入可能包含的值">
                    <el-option v-for="(option, oi) in getOptions(condition.id)" :key="option.id" :label="option.name" :value="option"></el-option>
                   </el-select>
                 </span>
              </span>
              <span v-else-if="condition.valueType === ValueType.number">
                <el-select size="small" placeholder="判断符" style="width: 120px;" v-model="condition.compare" @change="condition.value = []">
                  <el-option :label="exp.label" :value="exp.value" :key="exp.value" v-for="exp in explains"></el-option>
                </el-select>
                <span style="margin-left: 10px">
                  <el-input style="width: 280px;" v-if="conditionValType(condition.compare) === 0" size="small" placeholder="输入比较值" type="number" v-model="condition.value[0]"/>
                  <el-select style="width: 280px;" multiple filterable allow-create v-else-if="conditionValType(condition.compare) === 1" size="small" v-model="condition.value" placeholder="输入可能包含的值"></el-select>
                  <span v-else>
                    <el-input style="width: 130px;" size="small" type="number" placeholder="输入比较值" v-model="condition.value[0]"/>
                    <span> ~
                      <el-input size="small" style="width: 130px;" type="number" placeholder="输入比较值" v-model="condition.value[1]"/>
                    </span>
                  </span>
                </span>
              </span>
              <span v-else-if="[ValueType.user, ValueType.dept, ValueType.role,ValueType.post,ValueType.outsider].includes(condition.valueType)">
                <el-radio-group v-model="condition.valueType" @change="changeSenderSelectMode(condition)" style="margin-right:15px">
                  <el-radio :label="ValueType.user">人员</el-radio>
                  <el-radio :label="ValueType.dept">部门</el-radio>
                  <el-radio :label="ValueType.role">角色</el-radio>
                  <el-radio :label="ValueType.post">职位</el-radio>
                  <el-radio :disabled="!isPublicForm" :label="ValueType.outsider">外部人员</el-radio>
                </el-radio-group>
                <template v-if="condition.valueType === ValueType.dept">
                  <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser(condition.value, 'deptList')" round>选择部门</el-button>
                  <org-items v-model="condition.value"/>
                </template>
                <template v-else-if="condition.valueType === ValueType.user">
                  <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser(condition.value, 'getStaffList')" round>选择人员</el-button>
                  <org-items v-model="condition.value"/>
                </template>
                <template v-else-if="condition.valueType === ValueType.role">
                  <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser(condition.value, 'getRoles')" round>选择角色</el-button>
                  <org-items v-model="condition.value"/>
                </template>
                <template v-else-if="condition.valueType === ValueType.post">
                  <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser(condition.value, 'getPositionList')" round>选择职位</el-button>
                  <org-items v-model="condition.value"/>
                </template>
              </span>
              <span v-else-if="condition.valueType === ValueType.formDept">
                <template>
                  <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser(condition.value, 'deptList')" round>选择部门</el-button>
                  <org-items v-model="condition.value"/>
                </template>
              </span>
              <i class="el-icon-delete" @click="rmSubCondition(group, cindex)"></i>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <org-picker :type="orgType" :multiple='orgMultiple' ref="orgPicker" :selected="users" @ok="selected"></org-picker>
  </div>
</template>

<script>
import OrgPicker from "@/components/common/OrgPicker";
import OrgItems from '../OrgItems'
import {ValueType} from '@/views/common/form/ComponentsConfigExport'
import {getProblemTypeList,getFaultTypeList} from '@/api/process'
export default {
  name: "ConditionGroupItemConfig",
  components: {OrgPicker, OrgItems},
  data() {
    return {
      ValueType,
      users: [],
      problemTypeList:[],
      faultTypeList:[],
      orgType: 'getStaffList',
      showOrgSelect: false,
      groupNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      supportTypes:[ValueType.array, ValueType.number, ValueType.string, ValueType.dept, ValueType.role, ValueType.user, ValueType.outsider, ValueType.formDept],
      explains:[
        {label: '等于', value:'='},
        {label: '大于', value:'>'},
        {label: '大于等于', value:'>='},
        {label: '小于', value:'<'},
        {label: '小于等于', value:'<='},
        {label: '属于', value:'IN'},
        {label: 'x < 值 < x', value:'B'},
        {label: 'x ≤ 值 < x', value:'AB'},
        {label: 'x < 值 ≤ x', value:'BA'},
        {label: 'x ≤ 值 ≤ x', value:'ABA'},
      ],
      orgMultiple: true,
    }
  },
  computed: {
    selectedNode() {
      const groups=this.$store.state.selectedNode
      if(!this.$store.state.design.publicForm){
        groups.props.groups.forEach(x=>{
        x.conditions.forEach(i=>{
          if(i.valueType==='OutSider'){
            i.valueType='User'
          i.value=[]
          }
        })
      })
      }
      return this.$store.state.selectedNode
    },
    select() {
      return this.selectedNode.props.assignedUser || []
    },
    formItems(){
      // 隐患类型下拉
      this.$store.state.design.formItems.forEach(item=>{
        if(item.name==='ProblemTypeSelect'){
          item.props.options=this.problemTypeList
        }
        if(item.name==='FaultTypeSelect'){
          item.props.options=this.faultTypeList
        }
      })
      return this.$store.state.design.formItems
    },
    formMap(){
      const map = new Map();
      this.formItems.forEach(item => this.itemToMap(map, item))
      return map
    },
    conditionList() {
      //构造可用条件选项
      const conditionItems = []
      this.formItems.forEach(item => this.filterCondition(item, conditionItems))
      if (conditionItems.length === 0 || conditionItems[0].id !== 'root'){
        conditionItems.unshift({id: 'root', title: '发起人', valueType: 'User'})
      }
      return conditionItems
    },
    isPublicForm() {
      return this.$store.state.design.publicForm
    },
  },
  methods: {
    itemToMap(map, item){
      map.set(item.id, item)
      if (item.name === 'GroupList'){
        item.props.items.forEach(sub => this.itemToMap(map, sub))
      }
    },
    isSelect(formId){
      let form = this.formMap.get(formId)
      if (form && (form.name === 'SelectInput' || form.name === 'MultipleSelect')){
        return true
      }
      return false
    },
    getOptions(formId){
      return this.formMap.get(formId).props.options || []
    },
    conditionValType(type){
      switch (type){
        case '=':
        case '>':
        case '>=':
        case '<':
        case '<=': return 0;
        case 'IN': return 1;
        default: return 2;
      }
    },
    selectUser(value, orgType) {
      this.orgType = orgType
      this.users = value
      this.$nextTick(() => {
        this.$refs.orgPicker.show()
      })
    },
    changeSenderSelectMode(condition) {
      if(condition.valueType===ValueType.outsider){
        condition.value = ['outsider'];
      }else{
        condition.value = [];
      }
    },
    filterCondition(item, list){
      const NotSupport=["TextareaInput","TextInput"];
      if (item.name === 'GroupList'){
        item.props.items.forEach(sub => this.filterCondition(sub, list))
      }else if (this.supportTypes.indexOf(item.valueType) > -1 && !NotSupport.includes(item.name)){
        list.push({title: item.title, id: item.id, valueType: item.valueType,name:item.name})
      }
    },
    selected(select) {
      this.users.length = 0
      select.forEach(u => this.users.push(u))
    },
    delGroup(index) {
      this.selectedNode.props.groups.splice(index, 1)
    },
    rmSubCondition(group, index){
      group.cids.splice(index, 1)
      group.conditions.splice(index, 1)
    },
    conditionChange(index, group) {
      //判断新增的
      group.cids.forEach(cid => {
        if (0 > group.conditions.findIndex(cd => cd.id === cid)){
          //新增条件
          let condition = {...this.conditionList[index]}
          condition.compare = '';
          condition.value = []
          group.conditions.push(condition)
        }
      })
      for (let i = 0; i < group.conditions.length; i++) {
        //去除没有选中的
        if (group.cids.indexOf(group.conditions[i].id) < 0){
          group.conditions.splice(i, 1)
        }
      }
    },
    async getProblemType(){
     this.problemTypeList= await getProblemTypeList()
    },
    async getFaultType(){
     this.faultTypeList= await getFaultTypeList({applicationCode:'FAULT'})
    }
  },
  mounted() {
    this.getProblemType()
    this.getFaultType()
  }
}
</script>

<style lang="less" scoped>
.group {
  margin-bottom: 20px;
  color: #5e5e5e;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e3e3e3;

  .group-header {
    padding: 5px 10px;
    background: #e3e3e3;
    position: relative;

    div {
      display: inline-block;
    }

    .group-name {
      font-size: small;
    }

    .group-cp {
      font-size: small;
      position: absolute;
      left: 100px;
      display: flex;
      top: 5px;
      justify-content: center;
      align-items: center;
    }

    .group-operation {
      position: absolute;
      right: 10px;

      i {
        padding: 0 10px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .group-content{
    padding: 10px 5px;
    p{
      text-align: center;
      font-size: small;
    }
    .el-icon-delete{
      position: absolute;
      cursor: pointer;
      top: 12px;
      right: 0;
    }
  }

  .condition-title{
    display: block;
    width: 100px;
  }
}
</style>

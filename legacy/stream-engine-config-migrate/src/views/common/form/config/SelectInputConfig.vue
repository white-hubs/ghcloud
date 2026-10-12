<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit />
    </el-form-item>
    <el-form label-position="top">
      <div label="选项设置" class="options">
        <div class="option-item-label">
          <span>选项设置</span>
          <el-button icon="el-icon-plus" type="text" size="mini" @click="value.options.push('新选项')">新增选项</el-button>
          <el-button type="text" size="mini" @click="handleOpenDialog">关联参数</el-button>
        </div>
        <draggable :list="value.options" group="option" handler=".el-icon-rank" :options="dragOption">
          <div v-for="(op, index) in value.options" :key="index" class="option-item">
            <i class="el-icon-rank"></i>
            <el-input v-model="value.options[index]" size="medium" placeholder="请设置选项值" clearable>
              <el-button icon="el-icon-delete" slot="append" type="danger" size="medium"
                @click="value.options.splice(index, 1)"></el-button>
            </el-input>
          </div>
        </draggable>
      </div>
    </el-form>
    <!-- <el-form-item label="选项展开">
      <el-switch v-model="value.expanding"></el-switch>
    </el-form-item> -->
    <el-dialog title="选项关联" :visible.sync="dialogVisible">
      <div style="margin-bottom: 20px;">根据选择的选项，显示其他控件。当前控件和上级选项不能被关联显示</div>
      <el-table :data="optionContactData" border width>
        <el-table-column property="opt" label="当选项为"></el-table-column>
        <el-table-column property="contactComponent" label="显示以下控件">
          <template slot-scope="{row}">
            <el-select v-model="row.contactComponent" placeholder="请选择" size="small" clearable>
              <el-option v-for="item in contactSelectOption" :key="item.id" :label="item.title" :value="item.id">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import _ from 'lodash'
export default {
  name: "SelectInputConfig",
  components: { draggable },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dragOption: {
        animation: 300,
        sort: true
      },
      optionContactData: [],
      dialogVisible: false,
      initOptions: []
    }
  },
  computed: {
    formItems() {
      return this.$store.state.design.formItems;
    },
    contactSelectOption() {
      let optionComponents
      const findCustom=(FormItems)=>{
        FormItems.forEach(item=>{
          if(item.id===this.id){
            optionComponents=FormItems.filter(item => item.id !== this.id)
          }
          if(item.name==="GroupList"){
            findCustom(item.props.items)
          }
        })
      }
      findCustom(this.$store.state.design.formItems)
      return optionComponents
    }
  },
  created() {

  },
  watch: {
    'value.options': {
      handler: function (val) {
        this.initOptions = val
      },
      immediate: true
    }
  },
  methods: {
    handleOptionContactComponents() {
      const designFormItems = _.cloneDeep(this.formItems)
      let customComponents
      const findCustom=(FormItems)=>{
        FormItems.forEach(item=>{
          if(item.id===this.id){
            customComponents= item
          }
          if(item.name==="GroupList"){
            findCustom(item.props.items)
          }
        })
      }
      findCustom(designFormItems)
      this.optionContactData = this.initOptions.map(item => {
        return {
          opt: item,
          optId: item,
          contactComponent: ''
        }
      })
      if (customComponents?.props?.optionRelateParams) {
        this.optionContactData = this.optionContactData.map(item => {
          const findIndex =
            customComponents.props.optionRelateParams.findIndex(items => items.opt === item.opt)
          const relateParams = customComponents.props.optionRelateParams[findIndex]
          return {
            ...item,
            contactComponent: relateParams ? relateParams.contactComponent : ''
          }
        })
      }
    },
    handleOpenDialog() {
      if (new Set(this.value.options).size !== this.value.options.length) return this.$message.error('选项不可重复')
      this.handleOptionContactComponents()
      if (this.value.options.includes('')) return this.$message.error('当前选项有为空不可配置')
      this.dialogVisible = true
    },
    handleConfirm() {
      const handleData = this.optionContactData.filter(item => item.contactComponent)
      const componentForOption = {}
      const loopLen = handleData.length
      for (let i = 0; i < loopLen; i++) {
        const item = handleData[i]
        componentForOption[item.contactComponent] = item.opt
      }
      const designFormItems = _.cloneDeep(this.formItems)
      let currentComponents
      const findCustom = (FormItems) => {
        FormItems.forEach(item => {
          if (item.id === this.id) {
            currentComponents = item
          }
          if (item.name === "GroupList") {
            findCustom(item.props.items)
          }
        })
      }
      findCustom(designFormItems)
      if (!currentComponents) {
        this.$message.error('未找到当前控件')
        return
      }
      currentComponents.props.optionRelateParams = this.optionContactData
      const selectId = this.id
      const mapRelateRec = (item) => {
        if (item.id === selectId) {
          return { ...currentComponents }
        }
        let base = item
        if (item.name === 'GroupList' && Array.isArray(item.props?.items)) {
          base = {
            ...item,
            props: {
              ...item.props,
              items: item.props.items.map(mapRelateRec)
            }
          }
        }
        const oldRelateParams =
          typeof base.props?.relateParams === 'object' && base.props?.relateParams
            ? { ...base.props.relateParams }
            : {}
        delete oldRelateParams[selectId]
        if (Object.prototype.hasOwnProperty.call(componentForOption, base.id)) {
          oldRelateParams[selectId] = componentForOption[base.id]
        }
        const relateParams =
          Object.keys(oldRelateParams).length > 0 ? oldRelateParams : null
        return {
          ...base,
          props: {
            ...base.props,
            relateParams
          }
        }
      }
      const formItems = designFormItems.map(mapRelateRec)
      this.$store.commit("loadForm", { ...this.$store.state.design, formItems });
      this.$message.success('操作成功')
      this.dialogVisible = false
    },
    handleCloseDialog() {
      this.optionContactData = this.value.options.map(item => ({ contactComponent: "", opt: item }))
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .options {
  .el-form-item__label {
    display: block;
    width: 100%;
    text-align: left;
  }

  .el-icon-rank {
    padding-right: 5px;
    cursor: move;
  }

  .option-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;

    .el-input {
      width: 250px;
    }
  }
}

.option-item-label {
  height: 30px;
  line-height: 30px;

  button {
    float: right;
    margin-left: 10px;
  }
}

/*/deep/ .el-form-item {
  margin-bottom: 10px;

  .el-form-item__label {
    padding: 0;
  }
  .options{
    .el-icon-rank{
      cursor: move;
    }
  }
}*/
</style>

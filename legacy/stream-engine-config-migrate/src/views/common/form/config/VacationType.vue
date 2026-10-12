<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit />
    </el-form-item>
    <el-form label-position="top">
      <div label="选项设置" class="options">
        <div class="option-item-label">
          <span>选项设置</span>
          <el-button type="text" size="mini" @click="handleOpenDialog">关联参数</el-button>
        </div>
      </div>
    </el-form>
    <el-dialog title="选项关联" :visible.sync="dialogVisible">
      <div style="margin-bottom: 20px;">根据选择的选项，显示其他控件。当前控件和上级选项不能被关联显示</div>
      <el-table :data="optionContactData" border width>
        <el-table-column property="opt" label="当选项为">
          <template slot-scope="{row}">
            {{ row.opt.name }}({{row.opt.unit }})
          </template>
        </el-table-column>
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
      options: [],
      optionContactData: [],
      dialogVisible: false
    }
  },
  computed: {
    formItems() {
      return this.$store.state.design.formItems;
    },
    contactSelectOption() {
      return this.formItems.filter(item => item.id !== this.id)
    }
  },
  created() {

  },

  methods: {
    async getData() {
      this.options = await this.$api.getHolidayList()
    },
    findFormItemById(FormItems, id) {
      for (const item of FormItems) {
        if (item.id === id) {
          return item
        }
        if (item.name === 'GroupList' && Array.isArray(item.props?.items)) {
          const found = this.findFormItemById(item.props.items, id)
          if (found) {
            return found
          }
        }
      }
      return undefined
    },
    handleContactComponents() {
      const designFormItems = _.cloneDeep(this.formItems)
      const customComponents = this.findFormItemById(designFormItems, this.id)
      this.optionContactData = this.options.map(item => {
        return {
          opt: item,
          optId: item.id,
          contactComponent: ''
        }
      })
      if (customComponents?.props?.optionRelateParams) {
        this.optionContactData = this.optionContactData.map(item => {
          const findIndex =
            customComponents.props.optionRelateParams.findIndex(items => items.optId === item.optId)
          const relateParams = customComponents.props.optionRelateParams[findIndex]
          return {
            ...item,
            contactComponent: relateParams ? relateParams.contactComponent : ''
          }
        })
      }
    },
    async handleOpenDialog() {
      await this.getData()
      this.handleContactComponents()
      this.dialogVisible = true
    },
    handleConfirm() {
      let contactComponentIds = this.optionContactData.filter(item => item.contactComponent).map(item => item.contactComponent)
      const handleData = this.optionContactData.filter(item => item.contactComponent)
      const componentForOption = {}
      const loopLen = handleData.length
      for (let i = 0; i < loopLen; i++) {
        const item = handleData[i]
        componentForOption[item.contactComponent] = item.opt.id
      }
      const designFormItems = _.cloneDeep(this.formItems)
      const currentComponents = this.findFormItemById(designFormItems, this.id)
      if (!currentComponents) {
        this.$message.error('未找到当前控件')
        return
      }
      currentComponents.props.optionRelateParams = this.optionContactData
      const vacationId = this.id
      const mapVacationRec = (item) => {
        if (item.id === vacationId) {
          return { ...currentComponents }
        }
        let base = item
        if (item.name === 'GroupList' && Array.isArray(item.props?.items)) {
          base = {
            ...item,
            props: {
              ...item.props,
              items: item.props.items.map(mapVacationRec)
            }
          }
        }
        return {
          ...base,
          props: {
            ...base.props,
            relateParams: contactComponentIds.includes(base.id)
              ? {
                [vacationId]: componentForOption[base.id]
              }
              : null
          }
        }
      }
      const formItems = designFormItems.map(mapVacationRec)
      this.$store.commit("loadForm", { ...this.$store.state.design, formItems });
      this.$message.success('操作成功')
      this.dialogVisible = false
    },
    handleCloseDialog() {
      this.optionContactData = this.options.map(item => ({ contactComponent: "", opt: item }))
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

<template>
  <div>
    <el-table :header-cell-style="{background:'#f5f6f6'}" :data="formOperate" border style="width: 100%">
      <el-table-column prop="title" show-overflow-tooltip label="操作名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="操作别名" >
        <template slot-scope="scope">
          <el-input v-model="scope.row.alias" label="R" :name="scope.row.code"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="show" label="显示" width="80">
        <template slot="header" slot-scope="scope">
          <el-radio label="S" v-model="permSelect" @change="allSelect('S')">显示</el-radio>
        </template>
        <template slot-scope="scope">
          <el-radio v-model="scope.row.perm"  label="S" :name="scope.row.code"></el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="hide" label="隐藏" width="80">
        <template slot="header" slot-scope="scope">
          <el-radio label="H" v-model="permSelect" @change="allSelect('H')">隐藏</el-radio>
        </template>
        <template slot-scope="scope">
          <el-radio v-model="scope.row.perm" label="H" :name="scope.row.code"></el-radio>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: "OperateAliasConfig",
  components: {},
  props:{
    formType:{
      type:String,
      default:''
    }
  },
  data() {
    return {
      permSelect: '',
      formData:[]
    }
  },
  computed: {
    formOperate() {
      const data=_.cloneDeep(this.$store.state.selectedNode.props.operateAlias)
      this.$store.state.selectedNode.props.operateAlias=data.map(x=>{
         if(!x.perm)x.perm='S'
         return x
      })
      return this.$store.state.selectedNode.props.operateAlias
    },

  },
  methods:{
    allSelect(type) {
      this.permSelect = type
        this.formOperate.forEach(f => f.perm = type)
    },
    formPermsLoad(oldPermMap, forms) {
      forms.forEach(form => {
          //刷新名称
          let old = oldPermMap.get(form.code)
          if (old){
            this.formOperate.push(old)
          }else {
            this.formOperate.push({
              alias: form.alias,
              code: form.code,
              name: form.name,
              perm: form.perm
            })
          }
      })
    },
  },
  watch: {
    formOperate: {
      deep: true,
      handler() {
        const set = new Set(this.formOperate.map(f => f.perm))
        this.permSelect = set.size === 1 ? set.values()[0] : ''
      }
    },
    formType: {
      deep: true,
      immediate: true,
      handler() {
       //备份
       let oldPermMap = this.formOperate.toMap('code')
       this.formData=_.cloneDeep(this.$store.state.selectedNode.props.operateAlias)
        //重新清空，按顺序加载权限
        this.formOperate.length = 0;
        this.formPermsLoad(oldPermMap, this.formData)
      }
    },
  }
}
</script>

<style lang="less" scoped>

/deep/ .el-table__row {
  & > td:first-child {
    .cell {
      text-align: left;
    }
  }

  .cell {
    text-align: center;
  }

}

/deep/ .el-table__row {
  & > td:first-child {
    .cell {
      text-align: left;
    }
  }

  .cell {
    text-align: center;
  }

  .el-radio__label {
    display: none;
  }
}
</style>

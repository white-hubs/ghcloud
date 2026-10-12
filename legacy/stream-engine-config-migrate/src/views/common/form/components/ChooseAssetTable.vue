<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <div style="text-align: right;margin-bottom: 10px;">
        <el-button type="primary" size="small" >选择资产</el-button>
      </div>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column label="资产编码" width="150"></el-table-column>
        <el-table-column label="资产名称" width="120"></el-table-column>
        <el-table-column label="资产类别" width="120"></el-table-column>
        <el-table-column label="管理员" width="120"></el-table-column>
        <el-table-column label="购入日期" width="120"></el-table-column>
        <el-table-column label="原值" width="120"></el-table-column>
        <el-table-column label="规格型号" width="120"></el-table-column>
        <el-table-column label="计量单位" width="120"></el-table-column>
        <el-table-column label="数量" width="120"></el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template>
            <el-button type="text" size="small" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    </div>
    <div v-else>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "AddAssetTable",
  components: {},
  props: {
    value: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    }
  },
  data() {
    return {
      tableData: []
    }
  },
  methods: {}
}
</script>

<style scoped></style>

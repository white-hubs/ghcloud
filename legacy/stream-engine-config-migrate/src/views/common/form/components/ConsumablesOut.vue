<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <div style="text-align: right;margin-bottom: 10px;">
        <el-button type="primary" size="small" >选择耗材</el-button>
      </div>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column label="图片" width="150"></el-table-column>
        <el-table-column label="耗材名称" width="120"></el-table-column>
        <el-table-column label="耗材编码" width="120"></el-table-column>
        <el-table-column label="规格型号" width="120"></el-table-column>
        <el-table-column label="品牌" width="120"></el-table-column>
        <el-table-column label="耗材分类" width="120"></el-table-column>
        <el-table-column label="单位" width="120"></el-table-column>
        <el-table-column label="库存量" width="120"></el-table-column>
        <el-table-column label="单价" width="120"></el-table-column>
        <el-table-column label="数量" width="120"></el-table-column>
        <el-table-column label="金额" width="120"></el-table-column>
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
  name: "ConsumablesEnter",
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

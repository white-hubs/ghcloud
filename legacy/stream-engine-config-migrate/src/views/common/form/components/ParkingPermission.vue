<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-switch disabled v-model="_value.parkingControl">
      </el-switch>
      <div class="custom-table">
        <div class="title">
          停车设备列表
        </div>
        <el-form :inline="true" class="form-inline" disabled size="mini">
          <el-form-item label="所属区域">
            <el-select v-model="form.selectValue" placeholder="活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.keyword" placeholder="请输入设备编码/名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">查询</el-button>
            <el-button>重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableData" height="250" border size="mini" style="width: 100%">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column prop="date" label="设备编码">
          </el-table-column>
          <el-table-column prop="name" label="设备名称">
          </el-table-column>
          <el-table-column prop="address" label="门禁类型">
          </el-table-column>
          <el-table-column prop="address" label="所属区域">
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div v-else>
      <el-switch v-model="_value.accessControl">
      </el-switch>
      <div class="table">
        <div class="title">
          门禁设备列表
        </div>
        <el-form :inline="true" class="form-inline" size="mini">
          <el-form-item label="门禁类型">
            <el-select placeholder="活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属区域">
            <el-select placeholder="活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input placeholder="请输入设备编码/名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">查询</el-button>
            <el-button>重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableData" height="250" border size="mini" style="width: 100%">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column prop="date" label="设备编码" width="180">
          </el-table-column>
          <el-table-column prop="name" label="设备名称" width="180">
          </el-table-column>
          <el-table-column prop="address" label="门禁类型">
          </el-table-column>
          <el-table-column prop="address" label="所属区域">
          </el-table-column>
        </el-table>
      </div>
      <!-- <el-radio-group v-model="_value.radioValue">
        <el-radio :label="'limited'">有期限</el-radio>
        <el-radio :label="'unlimited'">无期限</el-radio>
      </el-radio-group> -->
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "ParkingPermission",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          parkingControl: true,
          parkingControlList: [],
        }
      }
    },
    placeholder: {
      type: String,
      default: '请选择选项'
    },
    expanding: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
  },
  data() {
    return {
      tableData: [],
      form: {
        selectValue: '',
        keyword: ''
      }
    }
  },
  methods: {}
}
</script>

<style scoped lang="less">
.form-inline {
  padding: 6px;
}

.custom-table {
  width: 100%;
  margin-top: 12px;
  border: 1px solid #ccc;

  .title {
    padding: 6px;
    border-bottom: 1px solid #ccc;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
  }



  .el-form {}
}
</style>

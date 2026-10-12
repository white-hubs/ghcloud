<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-radio-group v-model="_value.radioValue" disabled>
        <el-radio :label="'limited'">
          <span>有期限</span>
          <div class="radio-content">
            <el-date-picker size="medium" disabled v-model="_value.date" type="datetime" placeholder="选择日期时间">
            </el-date-picker>
          </div>

        </el-radio>
        <el-radio :label="'unlimited'">无期限</el-radio>
      </el-radio-group>
    </div>
    <div v-else>
      <el-radio-group v-model="_value.radioValue">
        <el-radio :label="'limited'">有期限</el-radio>
        <el-radio :label="'unlimited'">无期限</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "ServicePeriod",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          radioValue: 'limited',
          date: ''
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
    return {}
  },
  methods: {}
}
</script>

<style scoped>
.radio-content {
  display: inline-block;
  margin-left: 10px;
}
</style>

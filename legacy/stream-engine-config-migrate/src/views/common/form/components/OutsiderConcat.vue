<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      姓名：<el-input size="medium" :disabled="true" :placeholder="placeholder"/>
      电话：<el-input size="medium" :disabled="true" :placeholder="placeholder"/>
    </div>
    <div v-else>
      <el-input size="medium" :disabled="disabled" clearable v-model="_value" :placeholder="placeholder"/>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "TextInput",
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
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-switch v-model="_value" disabled>
      </el-switch>
    </div>
    <div v-else>
      <el-switch v-model="value">
      </el-switch>
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
      type: Boolean,
      default: false
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

<style scoped></style>

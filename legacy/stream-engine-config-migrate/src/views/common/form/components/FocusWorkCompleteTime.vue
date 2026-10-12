<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input size="medium" :disabled="true" :placeholder="placeholder"/>
    </div>
    <div v-else>
      <el-input size="medium" :disabled="disabled" clearable v-model="_value" :placeholder="placeholder" />
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
      default: '系统自动带入'
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

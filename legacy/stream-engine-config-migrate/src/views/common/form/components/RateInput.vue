<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-rate size="medium" :disabled="true" :max="rateNum"></el-rate>
    </div>
    <div v-else>
      <el-rate size="medium" :disabled="disabled" v-model="_value" :max="rateNum"></el-rate>
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
    rateNum: {
      type: Number,
      default: 5
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

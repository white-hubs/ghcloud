<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-radio-group v-model="_value">
        <el-radio disabled v-for="(op, index) in options" :key="index" :label="op">{{op}}</el-radio>
      </el-radio-group>
    </div>
    <div v-else>
      <el-radio-group v-model="_value">
        <el-radio v-for="(op, index) in options" :key="index" :label="op">{{op}}</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "AssetIsExpired",
  components: {},
  props:{
    value:{
      type: String,
      default: null
    },
    placeholder:{
      type: String,
      default: '请选择选项'
    },
    options:{
      type: Array,
      default: () => {
        return ['是','否']
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

</style>

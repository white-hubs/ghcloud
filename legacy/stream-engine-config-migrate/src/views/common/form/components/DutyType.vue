<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select class="max-fill" v-if="!expanding" size="medium" v-model="_value" disabled :placeholder="placeholder" />
    </div>
    <div v-else>
      <el-select class="max-fill" v-if="!expanding" v-model="_value" size="medium" clearable :placeholder="placeholder">
        <el-option v-for="(op, index) in options" :key="index" :value="op.value" :label="op.name"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "DutyType",
  components: {},
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: '请选择选项'
    },
    expanding: {
      type: Boolean,
      default: false
    },

  },
  data() {
    return {
      options: []
    }
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.getData();
    }
  },
  methods: {
    getData() {
      this.options = [
        {value:'ARRANGE',name:"排班制"},
        {value:'DUTY',name:"值班制"},
      ]
    }
  }
}
</script>

<style scoped></style>

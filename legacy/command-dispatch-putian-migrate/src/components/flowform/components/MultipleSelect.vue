<template>
  <div>
      <a-select :disabled="disabled" class="max-fill" v-if="!expanding" v-model:value="_value" mode="multiple" size="default" clearable :placeholder="placeholder">
        <a-select-option  v-for="(op, index) in options" :key="index" :value="op">{{op}}</a-select-option>
      </a-select>
      <a-checkbox-group v-else v-model:value="_value" :disabled="disabled">
        <a-checkbox v-for="(op, index) in options" :key="index" :label="op">{{op}}</a-checkbox>
      </a-checkbox-group>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "OvertimeLength",
  components: {},
  props:{
    placeholder:{
      type: String,
      default: '请选择选项'
    },
    value:{
      type: Array,
      default: () => {
        return []
      }
    },
    expanding:{
      type: Boolean,
      default: false
    },
    options:{
      type: Array,
      default: () => {
        return []
      }
    },
  },
  computed:{
     disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
    }
  },
  data() {
    return {
      checks:[]
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>

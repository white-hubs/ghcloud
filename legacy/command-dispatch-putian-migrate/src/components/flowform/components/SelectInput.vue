<template>
  <div>
      <a-select :disabled="disabled" class="max-fill" v-if="!expanding" v-model:value="_value" size="default" clearable :placeholder="placeholder">
        <a-select-option  v-for="(op, index) in options" :key="index" :value="op">{{op}}</a-select-option>
      </a-select>
      <a-radio-group :disabled="disabled" v-model:value="_value" v-else>
        <a-radio v-for="(op, index) in options" :key="index" :label="op">{{op}}</a-radio>
      </a-radio-group>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: "SelectInput",
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
   computed: {
    disabled(){
      return !this.$route.query.type||this.$route.query.type === 'detail'
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

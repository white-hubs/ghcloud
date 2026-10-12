<template>
  <div>
    <a-select :disabled="disabled" class="max-fill" v-model:value="selected" size="medium" clearable
      :placeholder="placeholder">
      <a-select-option v-for="(op, index) in options" :key="index" :value="op.id">{{ op.name }}</a-select-option>
    </a-select>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins';

export default {
  mixins: [componentMinxins],
  name: "VacationType",
  components: {},
  props: {
    value: {
      type: Object,
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
      options: [],
      selected: this.value?.id ?? null
    }
  },
  watch: {
    selected (n) {
      this._value = this.options.find(d => d.id === n)
    }
  },
  computed: {
    disabled() {
      return !this.$route.query.type||this.$route.query.type === 'detail'
    }
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.getData();
    }
  },
  methods: {
    getData() {
      this.$api.getHolidayList().then(res => {
        this.options = res.map(d => ({
          id: d.value,
          name: d.label
        }))
      })
    }
  }
}
</script>

<style scoped>

</style>

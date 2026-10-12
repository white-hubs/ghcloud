<template lang="pug">
span
  a-select(v-if="!onlyCustom" v-bind="$attrs" v-on="$listeners" :value="parseValue" style="min-width: 150px;")
    a-select-option(v-for="item in selectOptions" :key="item[field.label]" :value="field.name ? item[field.name] : item" :data="item") {{ labelFormatter ? labelFormatter(item) : item[field.label] }}
  a-range-picker(v-if="value === 'custom' && !onlyDate" :class="{ ml1: !onlyCustom }"  
    :value="dateRange" format='YYYY-MM-DD HH:mm:ss' valueFormat='YYYY-MM-DD HH:mm:ss' show-time @change="handleDateRangeChange") 
  a-range-picker(v-if="value === 'custom' && onlyDate" :class="{ ml1: !onlyCustom }" 
    :value="dateRange" format='YYYY-MM-DD' valueFormat='YYYY-MM-DD' @change="handleDateRangeChange" ) 
</template>

<script>
import moment from 'moment';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
    api: String,
    params: Object,
    options: {
      type: Array,
      default: () => [
        { code: 'today', name: '今天' },
        { code: 'week', name: '本周' },
        { code: 'month', name: '本月' },
        { code: 'all', name: '所有' },
        // { code: 'custom', name: '自定义' },
      ],
    },
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    hasEmptyOption: Boolean,
    dataFormatter: Function,
    labelFormatter: Function,
    onlyCustom: Boolean,
    onlyDate: Boolean,
    beginTime: String,
    endTime: String,
  },
  data() {
    return {
      selectOptions: [],
      dateRange: null,
    };
  },
  computed: {
    parseValue() {
      return this.value || [];
    },
  },
  watch: {
    code: 'loadData',
    params: 'loadData',
    options() {
      if (this.options?.length) {
        this.loadOptions();
      }
    },
    beginTime: 'handleParentTimeChange',
    endTime: 'handleParentTimeChange',
  },
  created() {
    if (!this.options?.length) {
      this.loadData();
    } else {
      this.loadOptions();
    }
    if (this.onlyCustom) {
      this.$emit('change', 'custom');
    }
    this.handleParentTimeChange();
  },
  methods: {
    async loadData() {
      this.selectOptions = this.api
        ? await this.$axios.restful(this.api, this.params)
        : [];
      if (this.dataFormatter) {
        this.selectOptions = this.dataFormatter(this.selectOptions);
      }
      if (this.hasEmptyOption) {
        this.selectOptions = [
          {
            [this.field.name]: 'none',
            [this.field.label]: '无',
          },
          ...this.selectOptions,
        ];
      }
    },
    loadOptions() {
      this.selectOptions = this.options;
      if (this.hasEmptyOption) {
        this.selectOptions = [
          {
            [this.field.name]: 'none',
            [this.field.label]: '无',
          },
          ...this.selectOptions,
        ];
      }
    },
    handleDateRangeChange(val) {
      if (!this.onlyDate) {
        this.dateRange = val;
      } else {
        this.dateRange = val.length
          ? [val[0] + ' 00:00:00', val[1] + ' 23:59:59']
          : val;
      }
      this.$emit('change', this.dateRange);
    },
    handleParentTimeChange() {
      if (this.beginTime && this.endTime) {
        this.dateRange = [this.beginTime, this.endTime];
      } else {
        this.dateRange = [];
      }
    },
  },
};
</script>

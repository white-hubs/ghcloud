<template lang="pug">
a-select(
  v-bind='$attrs',
  v-on='$listeners',
  :value='parseValue',
  :filter-option='false',
  :show-search='showSearch',
  @search='handleSearch'
)
  a-select-option(
    v-for='item in filteredOptions',
    :key='item[field.label]',
    :value='field.name ? item[field.name] : item',
    :data='item'
  ) {{ labelFormatter ? labelFormatter(item) : item[field.label] }}
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
    api: String,
    params: Object,
    options: [Array, String],
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    hasEmptyOption: Boolean,
    dataFormatter: Function,
    labelFormatter: Function,
    showSearch: Boolean,
  },
  data() {
    return {
      selectOptions: [],
      search: null,
    };
  },
  computed: {
    parseValue() {
      return this.value || [];
    },
    filteredOptions() {
      const options = this.selectOptions || [];
      const items = options.filter((item) => {
        return !this.search || item[this.field.label].includes(this.search);
      });
      return items;
    },
  },
  watch: {
    code: 'loadData',
    params: 'loadData',
    api: 'loadData',
    options() {
      if (this.options?.length) {
        this.loadOptions();
      }
    },
    value() {
      this.search = null;
    },
  },
  created() {
    if (!this.options?.length) {
      this.loadData();
    } else {
      this.loadOptions();
    }
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
      this.selectOptions =
        typeof this.options === 'string'
          ? JSON.parse(this.options)
          : this.options;
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
    handleSearch(search) {
      this.search = search;
    },
  },
};
</script>

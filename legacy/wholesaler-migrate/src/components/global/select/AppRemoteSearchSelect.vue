<template lang="pug">
a-select(
  v-bind='$attrs',
  v-on='$listeners',
  :value='parseValue',
  show-search,
  :filter-option='false',
  :not-found-content='null',
  @search='handleSearch',
  @change='handleChange'
)
  //- a-spin(v-if="loading" :loading="loading")
  a-select-option(
    v-for='item in selectOptions',
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
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    hasEmptyOption: Boolean,
    dataFormatter: Function,
    labelFormatter: Function,
  },
  data() {
    return {
      loading: false,
      search: null,
      selectOptions: [],
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
    value: 'loadData',
    options() {
      if (this.options?.length) {
        this.loadOptions();
      }
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
      this.loading = true;
      this.selectOptions = await this.$axios.restful(this.api, {
        ...this.params,
        search: this.search,
      });
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
      this.loading = false;
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
    handleSearch(search) {
      this.search = search;
      this.loadData();
    },
    handleChange() {
      this.loading = false;
      // this.search = this.value;
    },
  },
};
</script>

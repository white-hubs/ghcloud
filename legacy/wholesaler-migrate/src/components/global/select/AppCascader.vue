<template lang="pug">
  //- a-select(v-bind="$attrs" v-on="$listeners" :value="parseValue")
  //-   a-select-option(v-for="item in selectOptions" :key="item[field.label]" :value="field.name ? item[field.name] : item" :data="item") {{ labelFormatter ? labelFormatter(item) : item[field.label]}}
  a-cascader(v-bind="$attrs" v-on="$listeners" :value="parseValue" :options="selectOptions||[]" @change="handleChange" :fieldNames='fieldNames' change-on-select)
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change-value',
  },
  props: {
    value: [String, Number, Object, Array],
    api: String,
    params: Object,
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name', children: 'children' };
      },
      type: Object,
    },
    hasEmptyOption: Boolean,
    dataFormatter: Function,
    labelFormatter: Function,
    mode: String, // multiple single
  },
  data() {
    return {
      selectOptions: [],
      fieldNames: {
        label: this.field.label,
        value: this.field.name,
        children: this.field.children || 'children',
      },
      parseValue: [],
    };
  },
  computed: {
    // parseValue() {
    //   if (this.mode === 'single') {
    //     return this.value ? [this.value] : [];
    //   }
    //   return this.value || [];
    // },
  },
  watch: {
    value: 'handleValueChange',
    params: 'loadData',
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
      this.selectOptions = await this.$axios.restful(this.api, this.params);
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
      setTimeout(() => {
        this.handleValueChange();
      }, 100);
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
      setTimeout(() => {
        this.handleValueChange();
      }, 100);
    },
    handleChange(v) {
      this.parseValue = [...v];
      if (this.mode === 'single') {
        this.$emit('change-value', v.reverse().shift() || null);
      } else {
        this.$emit('change-value', v || null);
      }
    },
    handleValueChange() {
      let val;
      if (this.mode === 'single') {
        // 写死找三层
        let ids = [];
        this.selectOptions.forEach((item) => {
          if (this.value === item[this.field.name]) {
            ids = [item[this.field.name]];
          } else {
            item.children?.forEach((item2) => {
              if (this.value === item2[this.field.name]) {
                ids = [item[this.field.name], item2[this.field.name]];
              } else {
                item2.children?.forEach((item3) => {
                  if (this.value === item3[this.field.name]) {
                    ids = [
                      item[this.field.name],
                      item2[this.field.name],
                      item3[this.field.name],
                    ];
                  }
                });
              }
            });
          }
        });
        // val = this.value ? [this.value] : [];
        //   'ids--------------',
        //   ids,
        //   JSON.parse(JSON.stringify(this.selectOptions)),
        // );
        this.parseValue = ids;
      } else {
        val = this.value || [];
        this.parseValue = val;
      }
    },
  },
};
</script>

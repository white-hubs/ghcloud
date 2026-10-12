<template lang="pug">
    a-cascader(:options="selectOptions",:fieldNames='fieldNames',@change="onChange",:placeholder="placeholder",change-on-select)
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { GETTER_PROJECT } from '@store/account';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
    api: String,
    // params: Object,
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    hasEmptyOption: Boolean,
    dataFormatter: Function,
    maxTagCount: Number,
    labelFormatter: Function,
    placeholder: String,
    onChange: Function,
    // selectOptions: [],
    // fieldNames: {},
  },
  data() {
    return {
      selectOptions: [],
      fieldNames: {
        label: 'name',
        value: 'id',
        children: 'children',
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    // parseValue() {
    //   return this.value || [];
    // },
    params() {
      return {
        projectId: this.project.id,
      };
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.$axios.restful(`/project-merchant/areas/all-graph`, this.params).then((Res) => {
        this.selectOptions = Res;
      });
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
    // onChange() {},
  },
};
</script>

<template lang="pug">
  div.filter-item
    a-select.label.control(v-model="model.field" placeholder="字段" showSearch :filterOption="filterOption")
      a-select-option(v-for='(filter,index) in modelFilters' :value="filter.field" :key="filter.field+index") {{filter.title}}
    operator-selector.control.operator(:operators="operators" v-model="model.operator" placeholder="比较操作符")
    filter-control.control.value(v-model="model.value" :control="control" :mode="mode" :disabled="disableControl" placeholder="值") 
</template>
<script>
import OperatorSelector from './OperatorSelector';
import Operators from '@/models/common/Operators';
import FilterControl from './FilterControl';
import { findFilters } from '@/services/ModelService';
import _ from 'lodash';

export default {
  components: { OperatorSelector, FilterControl },
  props: {
    name: {
      required: true,
      type: String
    },
    model: {
      required: true,
      type: Object
    }
  },
  data() {
    return {};
  },
  computed: {
    modelFilters() {
      return findFilters(this.name);
    },
    operators() {
      if (this.model.field) {
        return this.modelFilters.find(a => a.field === this.model.field)
          .operators;
      }
      return [];
    },
    control() {
      if (this.model.field) {
        return this.modelFilters.find(a => a.field === this.model.field)
          .control;
      }
      return null;
    },
    // 对于In，NotIn时 使用multi
    mode() {
      if ([Operators.In, Operators.NotIn].includes(this.model.operator)) {
        return 'multiple';
      }
      return 'default';
    },
    // 对于In，NotIn时 使用multi
    disableControl() {
      return [Operators.IsNull, Operators.NotNull].includes(
        this.model.operator
      );
    }
  },
  watch: {
    mode(nv) {
      if (nv === 'multiple') {
        if (!_.isArray(this.model.value)) {
          this.model.value = _.compact([this.model.value]);
        }
      } else {
        if (_.isArray(this.model.value)) {
          this.model.value = _.first(this.model.value);
        }
      }
    },
    'model.field'() {
      this.model.value = null;
      if (!this.operators.includes(this.model.operator)) {
        this.model.operator = this.operators[0];
      }
    }
  },
  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    }
  }
};
</script>
<style lang="less" scoped>
.filter-item {
  display: flex;
  align-items: center;
  & > .control {
    outline: none;
    vertical-align: top;
    &:not(:first-child) {
      margin-left: -1px;
    }
  }
  .label {
    flex: none;
    width: 12rem;
  }
  .operator {
    flex: none;
    width: 10rem;
  }
  .value {
    flex: auto;
  }
}
</style>
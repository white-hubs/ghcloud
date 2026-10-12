<template lang="pug">
a-select(:value="parseValue" v-bind="$attrs" v-on="$listeners"
show-search
:filter-option="false"
:not-found-content="null"
@change="changeHandler"
@search="handleSearch"
)
  a-select-option(v-for='item in items' :value="item.name" :key="item.name") 
    div.flex.flex-center
      span.pr1(v-if="item.type === 'image'" style="font-size: 16px; line-height: normal;")
        app-icon-display.mb1(:name="item.name") 
      span.pr1(v-else style="font-size: 16px;")
        app-icon-display.mt1(:name="item.name") 
      span {{item.name}}
</template>
<script>
import icons from './icons';

// import * as enums from './enums';
// import _ from 'lodash';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Array, Number],
    filter: Function,
    multiple: Boolean,
    group: String,
  },
  data() {
    return {
      search: null,
      icons: icons,
    };
  },
  computed: {
    items() {
      const keys = Object.keys(this.icons);
      const items = keys
        .map((k) => {
          return {
            ...this.icons[k],
          };
        })
        .filter((item) => {
          return (
            (!this.group || item.group.includes(this.group)) &&
            (!this.search || item.name.includes(this.search))
          );
        });
      return items;
    },
    parseValue() {
      return this.value;
    },
  },
  watch: {
    value() {
      this.search = null;
    },
  },
  methods: {
    changeHandler(e) {
      // let value = e;
      // this.$emit('change', value);
      // this.search = null;
    },
    handleSearch(search) {
      this.search = search;
    },
  },
};
</script>

<style lang="less" scoped>
.flex {
  display: flex;
}
.flex-center {
  align-items: center;
}
</style>

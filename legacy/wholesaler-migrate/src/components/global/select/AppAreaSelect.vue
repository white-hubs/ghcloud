<template lang="pug">
.area-selector(ref='areaSelect', v-if='data')
  .input-box(:title='displayName')
    a-input(:value='displayName', @focus='handleFocus', v-bind='$attrs')
      a-icon(type='down', style='color: rgba(0, 0, 0, 0.25)', slot='suffix') 
  a-tree-select.hide-selector(
    ref='treeSelect',
    :treeData='data',
    :value='model.value',
    @change='handleChnage',
    treeDefaultExpandAll,
    :defaultValue='model.value'
  )
</template>
<script>
// import { TreeSelect } from 'ant-design-vue';
import { flattenTree, treezen } from '@/utils/common';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Array],
    name: [String, Array],
    api: String,
    params: Object,
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    parentProp: { default: 'pid', type: String },
    prop: { default: 'id', type: String },
    rootId: { default: null, type: String },
  },
  data() {
    return {
      // TreeSelect,
      data: [],
      flatData: [],
      model: {
        value: null,
      },
      valueArr: [],
      nameArr: [],
    };
  },
  computed: {
    displayName() {
      let displsyStr = '';
      const nameArr = [...this.nameArr];
      nameArr.reverse().forEach((item) => {
        displsyStr += item + '/';
      });

      return displsyStr.replace(/\/$/, '');
    },
  },
  watch: {
    params: 'loadData',
    value: 'parseValue',
    name: 'parseName',
  },
  created() {
    this.parseValue();
    this.parseName();
    if (!this.options?.length) {
      this.loadData();
    } else {
      this.options = this.options;
    }

    // this.$refs.treeSelect.focus();
  },
  methods: {
    parseValue() {
      if (this.value) {
        const value = [...this.value];
        this.valueArr = value?.reverse()?.filter((item) => !!item) || [];
        this.model = {
          value: this.valueArr[0] || null,
        };
        this.model = {
          value: this.value,
        };
      } else {
        this.valueArr = [];
        this.model = {
          value: null,
        };
      }
    },
    parseName() {
      if (this.name) {
        const name = [...this.name];
        this.nameArr = name?.reverse()?.filter((item) => !!item) || [];
      } else {
        this.nameArr = [];
      }
    },
    handleChnage(value, label, exttra) {
      const curNode = this.flatData.find((item) => {
        return item[this.field.name] === value;
      });
      const arr = [curNode];
      this.getParents(curNode, arr);
      const valueArr = arr.map((item) => item[this.field.name]);
      this.nameArr = arr.map((item) => item[this.field.label]);
      //.childNodes[0].childNodes[0]
      //   this.$refs.treeSelect,
      //   this.$refs.treeSelect.$el.childNodes[0].childNodes[0],
      // );
      this.$emit('change', [...valueArr].reverse(), curNode);
      this.$emit('name-change', [...this.nameArr].reverse(), curNode);
    },
    getParents(curNode, arr) {
      const { pid } = curNode;
      const parent = this.flatData.find((item) => {
        return item.id === pid;
      });
      if (parent) {
        arr.push(parent);
        this.getParents(parent, arr);
      }
    },
    handleFocus() {
      this.$refs.treeSelect.$el.click();
    },
    async loadData() {
      const data = await this.$restful(this.api, this.params);
      const flatData = flattenTree(data).map((item) => {
        return {
          ...item,
          title: item[this.field.label],
          value: item[this.field.name],
          pid: item.pid || null,
        };
      });
      this.flatData = flatData;
      this.data = treezen(flatData, this.parentProp, this.prop, this.rootId);
    },
    reload() {
      this.loadData();
    },
  },
};
</script>
<style lang="less">
.area-selector {
  position: relative;
  .input-box {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
  }
  .ant-select {
    position: absolute;
    top: 0;
    visibility: hidden;
  }
}
</style>

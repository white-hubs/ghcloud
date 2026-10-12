<template lang="pug">
  table.filter-group(:class='["group-"+level,professional?"professional":""]' v-if="data.length")
    tr.item(v-for='(item,index) in data' :key="index")
      td.item-header(v-if='!item.group')
        filter-item.mr1.filter-item(:name="name" :model="item")
        a-button.mr1(@click="addHandler(index)") 添加
        //- a-button.mr1(@click="addGroupHandler(index)" v-if='professional') 添加组
        a-button.mr1(@click="removeHandler(index)") 移除
      td.item-children(v-if="item.children&&item.children.length")
        filter-group(:name="name" :data="item.children" :level="level+1" :professional="professional")
</template>
<script>
import _ from 'lodash';
import FilterItem from './FilterItem';
import moment from 'moment';
import { findFilters } from '@/services/ModelService';
const filterDefaults = () => {
  return {
    field: undefined,
    operator: undefined,
    value: undefined
  };
};
export default {
  name: 'FilterGroup',
  components: { FilterItem },
  props: {
    name: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    professional: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      default: 0
    }
  },
  watch: {
    data(nv) {
      if (_.isEmpty(nv)) {
        this.addHandler(0);
      }
    }
  },
  created() {
    if (this.data.length === 0) {
      this.addHandler(0);
    }
  },
  methods: {
    addHandler(index) {
      this.data.splice(index + 1, 0, filterDefaults());
    },
    addGroupHandler(index) {
      this.data.splice(index + 1, 0, {
        group: true,
        logic: 'And',
        children: [filterDefaults()]
      });
    },
    /**
     * 获取过滤对象
     */
    async getFilter() {
      const data = _.cloneDeep(this.data);
      const filterDefs = findFilters(this.name);
      async function getFilterItem(item) {
        if (item.field) {
          let value = item.value;
          if (
            !_.isNil(value) ||
            ['IsNull', 'NotNull'].includes(item.operator)
          ) {
            if (_.isArray(value)) {
              value = value.join(',');
            }
            if (moment.isDate(value) || moment.isMoment(value)) {
              value = moment(value).format('YYYY-MM-DD HH:mm:ss');
            }

            // 查找自定义转换filter器
            const filterDef = filterDefs.find(a => a.field === item.field);
            if (filterDef.transform) {
              return filterDef.transform({
                field: item.field,
                operator: item.operator,
                value
              });
            }
            return {
              field: item.field,
              operator: item.operator,
              value
            };
          }
        } else if (!_.isEmpty(item.children)) {
          const children = _.compact(
            await Promise.all(item.children.map(item => getFilterItem(item)))
          );

          if (_.isEmpty(children)) {
            return null;
          }
          return {
            logic: item.logic,
            children: children
          };
        }
        return null;
      }
      if (!_.isEmpty(data)) {
        return {
          logic: 'And',
          children: _.compact(
            await Promise.all(data.map(item => getFilterItem(item)))
          )
        };
      }
      return null;
    },
    removeHandler(index) {
      if (this.data.length === 1 && this.level === 0) {
        this.$message.info('至少需要一个过滤条件');
        return;
      }
      this.data.splice(index, 1);
    }
  }
};
</script>

<style lang="less" scoped>
.filter-group {
  width: 100%;
  padding-left: 2rem;
  &.professional {
    &:not(.group-0) {
      border-right: 0;
    }
  }
  td {
    padding-right: 0;
  }
  .item {
    margin-bottom: 0.5rem;
    .item-header {
      display: flex;
      .filter-item {
        flex: auto;
      }
    }
  }
}
</style>
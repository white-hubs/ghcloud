<template lang="pug">
div.inline-block
  a-form(layout="inline" :form="form")
    a-form-item(label="搜索：")
      a-input-search.input(placeholder="快捷查询" v-model="form.search" allow-clear @change="changeHandler" @search="searchHandler" v-bind="$attrs")
    a-form-item(label="区域：")
      a-cascader(v-model="form.areaId" :options="selectOptions",:fieldNames='fieldNames',@change="onChange",placeholder="请选择区域",change-on-select)
    a-form-item(label="部门：")
      app-tree-dept-select(style="width: 150px;" v-model="form.deptId" api="/sys/depts/all-graph" :params="params" :dataFormatter="(data) => { data[0].selectable = false;  return data; }" @change="onChange" allow-clear)
    a-form-item(label="时间范围：")
      <a-range-picker :locale="locale" format="YYYY-MM-DD" valueFormat='YYYY-MM-DD' v-model="form.date"/>
    a-form-item
      a-button.ml1(type="primary" @click="searchHandler" v-if="showButton") 查询
</template>
<script>
import { mapGetters } from 'vuex';
import { GETTER_PROJECT } from '@store/account';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
export default {
  props: {
    showButton: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      locale,
      form: {},
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
    params() {
      return {
        projectId: this.project.id,
      };
    },
  },
  watch: {
    keyword(nv, ov) {
      if (ov !== nv && !nv) {
        this.$emit('search', null);
      }
    },
  },

  created() {
    this.getArea();
  },
  methods: {
    changeHandler(e) {
      // 表示点击清除按钮
      if (e.type !== 'input' && !e.currentTarget.value) {
        this.$emit('search', null);
      }
    },
    searchHandler() {
      this.$emit('search', this.form);
    },
    getArea() {
      this.$axios.restful(`/project-merchant/areas/all-graph`, this.params).then((Res) => {
        this.selectOptions = Res;
      });
    },
    onChange() {
      this.$emit('search', this.form);
    },
  },
};
</script>
<style lang="less" scoped>
.inline-block {
  position: relative;
  top: -10px;
}
</style>

<template lang="pug">
.cascader_container
  a-cascader(
    v-model="areaIds"
    :options='areaOptions',
    placeholder='请选择区域',
    @change='onChange',
    change-on-select,
    :show-search='{ filter }',
    :fieldNames='fieldNames',
    :size='size'
  )
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Array,
    size: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      areaIds: [],
      areaOptions: [],
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
    value() {
      this.areaIds = this.value || [];
    },
  },
  created() {
    this.areaIds = this.value || [];
  },
  mounted() {
    this.getAreaList();
  },
  methods: {
    //获取所有区域
    getAreaList() {
      this.$axios.restful(`/project-merchant/areas/all-graph`, this.params).then((res) => {
        this.areaOptions = res;
      });
    },
    filter(inputValue, path) {
      return path.some((option) => option.name.indexOf(inputValue) > -1);
    },
    onChange(val, option) {
      this.$emit('change', val, option);
    },
  },
};
</script>
<style lang="less" scoped></style>

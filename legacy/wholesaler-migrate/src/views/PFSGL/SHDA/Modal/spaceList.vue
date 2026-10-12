<template lang="pug">
app-modal(title='空间列表', v-model='visible', :width='1200', @cancel='close')
  app-table(
    ref='table',
    model-name='Space',
    :selectionMode='false',
    :url='fetchData',
    :visibles='["code", "name",  "deptName","acreage", "tradeModel", "createTime"]',
    :pagination='false',
    :fitHeight='-30',
    :columns-customsize='(cols) => cols'
  )
  template(#footer)
    a-button(@click='close') 关闭
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      loading: false,
      model: {},
    };
  },
  watch: {
    model() {
      this.$refs.table.reload();
    },
  },
  methods: {
    show(model) {
      this.model = { ...this.model, ...model };
      this.visible = true;
    },
    fetchData() {
      return this.model.spaces;
    },
    close() {
      this.visible = false;
      this.model = {};
    },
    areaChange() {},
  },
};
</script>

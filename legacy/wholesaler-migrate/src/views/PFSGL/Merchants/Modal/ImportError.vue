<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="800" :confirm-loading="loading")
    div(style="max-height: 400px; overflow: auto;")
      AppCardBaseInfo(v-for="err in errorList" :key="err.row + err.fieldName" 
      :baseInfo="err"
      :fields="fields"
      :labelWidth="90"
      :lineHeight="20"
      )
    template(slot="footer")
      a-button(@click="hide") 关闭
</template>

<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  components: {},
  data() {
    return {
      visible: false,
      loading: false,
      title: '导入商户数据失败',
      errorList: null,
      fields: [
        { name: 'row', label: '行', colspans: { sm: 6 }, labelWidth: 30 },
        { name: 'fieldName', label: '列', colspans: { sm: 6 }, labelWidth: 30 },
        {
          name: 'errorMsg',
          label: '错误信息',
          colspans: { sm: 12 },
          render(h, m, v) {
            return <span title={v}>{v}</span>;
          },
        },
      ],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
  },
  mounted() {},
  methods: {
    show(errorList) {
      this.errorList = errorList;
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-item {
  padding-left: 90px;
  margin: -10px 0 16px 0;
}
</style>

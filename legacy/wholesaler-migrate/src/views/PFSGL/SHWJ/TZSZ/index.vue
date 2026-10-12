<template lang="pug">
app-page-layout(fix-header)
  div.abs-fit.overflow-auto
    div(v-if="categorys.normal && categorys.normal.length")
      app-card(title="通知设置")
    div
      app-card(title="问卷调查")
        div.config-form-item(v-for="conf in categorys.questionnaireNotice" :key="conf.name")
          div.config-form-label {{ conf.label }}
          div.config-form-input-wapper
            a-checkbox(v-for="item in conf.items" :key="item.name" :disabled="item.disabled" v-model="model[conf.name][item.name]" @change="handleChange(model[conf.name || 'ticketinst'])")
              span {{ item.label }}
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
const defaultValues = {
  mail: false,
  site: false,
  sms: false,
  pop: false,
  wx: false,
};
const noticeDefaults = [
  { name: 'site', label: '站内信' },
  { name: 'wx', label: '企业微信' },
  { name: 'pop', label: '消息弹窗' },
  { name: 'sms', label: '短信' },
  // { name: 'mail', label: '邮件', disabled: true },
];
export default {
  data() {
    return {
      categorys: {
        normal: [],
        questionnaireNotice: [
          {
            name: 'questionnaireNotice',
            label: '通知方式: ',
            items: [...noticeDefaults],
          },
        ],
      },
      model: {
        questionnaireNotice: { type: 'questionnaireNotice', ...defaultValues },
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.loadModel();
  },
  methods: {
    async loadModel() {
      const res = await this.$restful('GET:/sys/notice-ways/list', {
        projectId: this.project.id,
      });
      const model = {};
      res?.forEach((item) => {
        model[item.type] = { ...item };
      });
      this.model = {
        ...this.model,
        ...model,
      };
    },
    handleChange(type) {
      this.$restful('save:/sys/notice-ways', {
        ...type,
        projectId: this.project.id,
      }).then((res) => {
        if (!type.id) {
          type.id = res;
        }
      });
    },
    back() {
      this.$router.push({ path: '' });
    },
  },
};
</script>

<style lang="less" scoped>
// 样式
.config-form-item {
  padding: 12px 24px;
  display: flex;
  align-items: center;
}
.config-form-label {
  min-width: 100px;
  padding-right: 12px;
}
</style>

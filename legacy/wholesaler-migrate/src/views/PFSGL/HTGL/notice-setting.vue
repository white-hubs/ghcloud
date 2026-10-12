<template lang="pug">
app-page-layout(fix-header)
  div.notice_sett.abs-fit.overflow-auto
    a-tabs(default-active-key='1')
      a-tab-pane(key='1', tab='通知市场管理方')
        app-form(
          :labelWidth="120" 
          ref='form')
          a-form-model-item(label="通知条件")
            span 商家完成合同签订
          a-form-model-item(label="通知对象")
            a-button(type="primary" @click="addConfig") 新增
          a-row.config_card(v-for="(config,i) in noticeModel.noticeDTOS")
            .close_icon(@click="deleteConfig(i)")
              a-icon(type='close', style='font-size: 1.5rem') 
            a-form-model-item(label='对象条件')
              a-row(:gutter="16") 
                a-col(:sm="10")
                  app-enum-select(code="DutyType1" v-model="config.noticeType" @change="value=>handleDutyType(value,i)")
                a-col(:sm="14")
                  a-row(type="flex" :gutter="10")
                    a-col(v-if="config.noticeType === 'USER'",:span="24")
                      app-user-select(v-model="config.userIdList" :parameter="params" allow-clear mode="multiple")
                    a-col(v-if="config.noticeType === 'POST' ||config.noticeType === 'DEPT_POST'",:span="12")  
                      app-remote-select(v-model="config.postIdList" api="/sys/posts" :params="params" allow-clear mode="multiple")
                    a-col(v-if="config.noticeType === 'DEPT'||config.noticeType === 'DEPT_POST'",:span="12")   
                      app-tree-select( v-model="config.deptIdList" api="/sys/depts/all-graph" :params="params"
                        :dataFormatter="(data) => {data[0].selectable = false; return data;}"
                        multiple allow-clear tree-default-expand-all)
            a-form-model-item(label='通知方式', prop='type')
              div.flex.align-center.p1
                div
                  a-checkbox(v-model="config.site")
                    span 站内信
                div.ml2
                  a-checkbox(v-if="config.site" v-model="config.pop")
                    span 消息弹窗
                div.ml2
                  a-checkbox(v-model="config.sms")
                    span 短信
                div.ml2
                  a-checkbox(v-model="config.wx")
                    span 企业微信 
        div.mt2
          a-button(type="primary" :loading="loading" @click="handleSubmit") 保存 
      a-tab-pane(key='2', tab='通知商家')
        div.config-form-item
          div.config-form-label 通知条件:
          div.config-form-input-wapper 合同签订任务
        div.config-form-item(v-for="conf in businessConfig.contractNotice" :key="conf.name")
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
      loading: false,
      businessConfig: {
        contractNotice: [
          {
            name: 'contractNotice',
            label: '通知方式: ',
            items: [...noticeDefaults],
          },
        ],
      },
      model: {
        contractNotice: { type: 'contractNotice', ...defaultValues },
      },
      noticeModel: {
        projectId: null,
        businessType: null,
        noticeDTOS: [],
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
  created() {
    this.loadNotices();
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
    async loadNotices() {
      const res = await this.$restful(`GET:/project-merchant/wholesaler-notices/list`, {
        projectId: this.project.id,
        businessType: 'contractNotice',
      });
      this.noticeModel = {
        ...this.noticeModel,
        ...res,
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
    addConfig() {
      this.noticeModel.noticeDTOS.push({
        deptFlag: false,
        deptIdList: null,
        postFlag: false,
        userIdList: null,
        userFlag: false,
        postIdList: null,
        wx: false,
        sms: false,
        site: false,
        pop: false,
      });
    },
    deleteConfig(i) {
      this.noticeModel.noticeDTOS.splice(i, 1);
    },
    handleDutyType(val, i) {
      switch (val) {
        case 'USER':
          this.noticeModel.noticeDTOS[i].userIdList = null;
          break;
        case 'POST':
          this.noticeModel.noticeDTOS[i].postIdList = null;
          break;
        case 'DEPT':
          this.noticeModel.noticeDTOS[i].deptIdList = null;
          break;
      }
    },
    async handleSubmit() {
      // const valid = await this.$refs.form.validate();
      // if (valid) {
      this.loading = true;
      this.$restful(`POST:/project-merchant/wholesaler-notices`, {
        ...this.noticeModel,
        businessType: 'contractNotice',
        projectId: this.project.id,
      })
        .then((res) => {
          this.$message.success('保存成功!');
          this.loadNotices();
        })
        .finally(() => {
          this.loading = false;
        });
      // }
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
.notice_sett {
  padding: 20px;
  .config_card {
    position: relative;
    border: 1px dashed #d9d9d9;
    margin: 10px;
    padding: 10px;
  }
  .close_icon {
    position: absolute;
    width: 30px;
    text-align: center;
    top: 1px;
    right: 0;
    color: #000;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.notice_sett {
  .ant-form-item {
    display: flex;
    margin: 0 0 10px;
  }
  .ant-form-item-control-wrapper {
    width: 50%;
  }
}
</style>

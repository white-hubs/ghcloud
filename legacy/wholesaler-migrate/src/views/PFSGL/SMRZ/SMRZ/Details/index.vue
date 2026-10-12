<template lang="pug">
app-page-layout.no-bg-body(title='实名认证详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90" :colspans="colspans")
    a-row.mt16(:gutter='16')
      a-col(:sm="12")
        app-card(title='个人实名')
          app-card-base-info(:baseInfo="model" :fields="personalFields" :labelWidth="120" :colspans="col")
      a-col(:sm="12")
        app-card(title='企业实名')
          app-card-base-info(:baseInfo="model" :fields="enterFields" :labelWidth="90" :colspans="col")
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'detail',
  components: {},
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      col: {
        sm: 12,
      },
      model: {},
      personalFields: [
        {
          name: 'realName',
          label: '真实姓名',
        },
        {
          name: 'identityCard',
          label: '身份证号',
        },
        {
          name: 'postCode',
          label: '邮政编码',
        },
        {
          name: 'address',
          label: '住所',
        },
        {
          name: 'personnelPicIdsDtos',
          label: '个人正面照',
          render(h, m, v) {
            return m.personnelPicIdsDtos ? <app-imgs-display files={[m.personnelPicIdsDtos]} /> : '无';
          },
        },
        {
          name: 'idCardPhotoDtos',
          label: '身份证人像面',
          render(h, m, v) {
            return m.idCardPhotoDtos ? <app-imgs-display files={[m.idCardPhotoDtos]} /> : '无';
          },
        },
        {
          name: 'idCardNationDtos',
          label: '身份证国徽面',
          render(h, m, v) {
            return m.idCardNationDtos ? <app-imgs-display files={[m.idCardNationDtos]} /> : '无';
          },
        },
      ],
      enterFields: [
        {
          name: 'enterpriseName',
          label: '企业名称',
        },
        {
          name: 'registrationNumber',
          label: '工商注册号',
        },
        {
          name: 'licenseDtos',
          label: '营业执照',
          render(h, m, v) {
            return v?.length ? <app-imgs-display files={v} /> : '无';
          },
        },
      ],
      fields: [
        {
          name: 'createBy',
          label: '认证人',
        },
        {
          name: 'stallName',
          label: '关联档位',
        },
        {
          name: 'loginAccount',
          label: '登录账号',
        },
        {
          name: 'createTime',
          label: '创建时间',
        },

        {
          name: 'status',
          label: '状态',
          render(h, m, v) {
            return v === 0
              ? '审核中'
              : v === 1
                ? '已通过'
                : v === 2
                  ? '未通过'
                  : '--';
          },
        },
        {
          name: 'rejectReason',
          label: '理由',
          isHide(m) {
            return m.status !== 2;
          },
        },
        {
          name: 'reviewer',
          label: '审核人',
          render(h, m, v) {
            return v || '---';
          },
          isHide(m) {
            return !m.reviewer;
          },
        },
        {
          name: 'reviewTime',
          label: '审核时间',
          render(h, m, v) {
            return v || '---';
          },
          isHide(m) {
            return !m.reviewTime;
          },
        },
      ],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    id() {
      const id = this.$route.params.id;
      return id;
    },
  },
  async created() {
    this.loadModel(this.id);
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(`GET:/project-merchant/wholesaler-auth/${id}`, {
        projectId: this.project.id,
      });
    },
    back() {
      this.$back();
    },
  },
};
</script>
<style lang="less" scoped>
.sqxx-container {
  height: 400px;
}

.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}

.table_content {
  padding: 20px;
}

.mt16 {
  margin-top: 16px;
}

.footer-btns {
  margin: 16px 0;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>

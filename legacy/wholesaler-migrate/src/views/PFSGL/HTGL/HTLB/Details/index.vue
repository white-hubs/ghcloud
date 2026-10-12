<template lang="pug">
app-page-layout.no-bg-body(title='合同详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        app-card(title='合同信息')
          app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="100" :colspans="colspans")
        app-card(title='甲方信息')
          app-card-base-info(:baseInfo="model" :fields="firstFields" :labelWidth="150" :colspans="colspans")
        app-card(title="乙方签约")
          app-card-base-info(:baseInfo="model" :fields="secondFields" :labelWidth="150" :colspans="colspans")
    a-row.mt16
     app-card(title='签订档位')
        .table_content
          a-table(:columns='columns',
            row-key="id"
            :data-source='model.stallDtos'
            :scroll='{ y: 200 }'
            rowKey="id")
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import flow from './flow';
export default {
  name: 'detail',
  components: { flow },
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      firstFields: [
        {
          name: 'firstName',
          label: '甲方',
          render(h, m, v) {
            return m?.firstPartDto.name || '--';
          },
        },
        {
          name: 'firstAddress',
          label: '住所',
          render(h, m, v) {
            return m?.firstPartDto.address || '--';
          },
        },
        {
          name: 'firstPostCode',
          label: '邮政编码',
          render(h, m, v) {
            return m?.firstPartDto.postCode || '--';
          },
        },
        {
          name: 'firstMobile',
          label: '联系电话',
          render(h, m, v) {
            return m?.firstPartDto.mobile || '--';
          },
        },
      ],
      secondFields: [
        {
          name: 'name',
          label: '乙方',
          render(h, m, v) {
            return m?.secondPart.name || '--';
          },
        },
        {
          name: 'address',
          label: '住所',
          render(h, m, v) {
            return m?.secondPart.address || '--';
          },
        },
        {
          name: 'postCode',
          label: '邮政编码',
          render(h, m, v) {
            return m?.secondPart.postCode || '--';
          },
        },
        {
          name: 'signatoryMobile',
          label: '联系电话',
          render(h, m, v) {
            return m?.secondPart.signatoryMobile || '--';
          },
        },
        {
          name: 'companyCode',
          label: '企业机构代码',
          render(h, m, v) {
            return m?.secondPart.companyCode || '--';
          },
        },
        {
          name: 'legalPerson',
          label: '法定代表人或负责人',
          render(h, m, v) {
            return m?.secondPart.legalPerson || '--';
          },
        },
        {
          name: 'identityCard',
          label: '身份证号',
          render(h, m, v) {
            return m?.secondPart.identityCard || '--';
          },
        },
        {
          name: 'signatory',
          label: '签约人',
          render(h, m, v) {
            return m?.secondPart.signatory || '--';
          },
        },
        {
          name: 'signatoryMobile',
          label: '签约人电话号码',
          render(h, m, v) {
            return m?.secondPart.signatoryMobile || '--';
          },
        },
        {
          name: 'createTime',
          label: '签约时间',
          render(h, m, v) {
            return m?.secondPart.createTime || '--';
          },
        },
      ],
      fields: [
        {
          name: 'code',
          label: '编号',
        },
        {
          name: 'signingWay',
          label: '签约方式',
          render(h, r, v) {
            return v === 0 ? '新签' : v === 1 ? '续签' : '---';
          },
        },
        {
          name: 'contractTypeDto',
          label: '合同类型',
          render(h, r, v) {
            return v?.name || '--';
          },
        },
        {
          name: 'oldCode',
          label: '原合同编号',
          render(h, r, v) {
            return v || '--';
          },
        },
        {
          name: 'beginTime',
          label: '租赁期限',
          render(h, r, v) {
            return (
              <div>
                {r.beginTime} ~ {r.endTime}
              </div>
            );
          },
        },
        {
          name: 'createBy',
          label: '创建人',
        },
        {
          name: 'createTime',
          label: '创建时间',
        },

        {
          name: 'paperCode',
          label: '纸质合同编号',
          render(h, r, v) {
            return v || '--';
          },
        },
        {
          name: 'remark',
          label: '补充说明',
        },
        {
          name: 'paperContractDtos',
          label: '合同附件',
          render(h, r, v) {
            return v?.length ? <app-files-display files={v} /> : '无';
          },
        },
      ],
      columns: [
        { title: '档位名称', dataIndex: 'name' },
        {
          title: '所属区域',
          dataIndex: 'area',
          customRender(text, record) {
            return text?.length ? text.join('/') : '--';
          },
        },
        { title: '所属商户', dataIndex: 'companyName' },
        // { title: '操作', dataIndex: '', scopedSlots: { customRender: '操作' } },
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
      this.model = await this.$restful(`GET:/project-merchant/wholesaler-contract/${id}`);
    },
    back() {
      this.$back();
    },
  },
};
</script>
<style lang="less" scoped>
.sqxx-container {
  height: 450px;
}
.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}
.train-plan {
  padding: 20px;
}
.table_content {
  padding: 15px;
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

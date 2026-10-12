<template lang="pug">
app-page-layout.no-bg-body(title='协议详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90" :colspans="colspans")
    a-row.mt16
      app-card(title='签订档位')
        .table_content
          a-table(:columns='columns',
            row-key="id"
            :data-source='companyData',
            rowKey="id")
            //- template(slot='操作', slot-scope='record,index')
            //-   app-link-btn(@click='handleCompanyDetail(record)') 档位详情
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment'
export default {
  name: 'detail',
  components: {},
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
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
        {
          title: '状态',
          dataIndex: 'status',
          customRender(text, record) {
            return text === 0 ? '未签' : text === 1 ? '已签' : '---';
          },
        },
        {
          title: '签订人',
          dataIndex: 'signedWho',
          customRender(text, record) {
            return text || '--';
          },
        },
        {
          title: '职位',
          dataIndex: 'owner',
          customRender(h, v) {
            return v === 1 ? '档主' : '从业人员' || '--';
          },
        },
        {
          title: '签订时间',
          dataIndex: 'signedTime',
          customRender(text, record) {
            return text ? moment(text).format('YYYY-MM-DD hh:mm:ss') : '--';
          },
        },
        // { title: '操作', dataIndex: '', scopedSlots: { customRender: '操作' } },
      ],
      companyData: [],
      fields: [
        {
          name: 'code',
          label: '编号',
        },
        {
          name: 'name',
          label: '名称',
        },
        {
          name: 'templateTypeName',
          label: '协议类型',
        },
        {
          name: 'templateName',
          label: '协议模板',
          render(h, r, v) {
            return (
              <div>
                <app-link-btn
                  class="ml2"
                  to={'/agreement-mould/' + r.templateId}
                >
                  {v}
                </app-link-btn>
              </div>
            );
          },
        },
        {
          name: 'beginTime',
          label: '有效时间',
          render(h, r, v) {
            return (
              <div>
                {moment(r.createTime).format('YYYY-MM-DD hh:mm:ss')} ~ {moment(r.beginTime).format('YYYY-MM-DD hh:mm:ss')}
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
          render(h, r, v) {
            return moment(r.createTime).format('YYYY-MM-DD hh:mm:ss')

          },
        },
        {
          name: 'count',
          label: '应签档位数',
        },
        {
          name: 'signedCount',
          label: '已签档位数',
        },
        {
          name: 'notSignedCount',
          label: '未签档位数',
        },
        {
          name: 'remark',
          label: '补充说明',
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
      this.model = await this.$restful(`GET:/project-merchant/wholesaler-prtocol/${id}`, {
        projectId: this.project.id,
        id: id,
      });
      this.companyData = this.model.stallDtos;
    },
    handleCompanyDetail() { },
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

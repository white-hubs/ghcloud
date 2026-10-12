<template lang="pug">
app-page-layout.no-bg-body(title='问卷调查详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90" :colspans="colspans")
    a-row.mt16
      app-card(title='调查档位')
        .table_content
          AppSearch(
            v-model="filters"
            :fields="filterFieleds"
            @search="handleQuickSearch"
) 
  app-table(
    ref="table"
    model-name="examineDetail"
    url=`/project-merchant/wholesaler-questionnaire/stall/page`
    :params="params"
    :visibles="showColumns"
    )
  //- a-table(:columns='columns',
  //-   row-key="id"
  //-   :data-source='model.stallDtos'
  //-   :scroll='{ y: 200 }'
  //-   rowKey="id")
  //-     template(slot='操作', slot-scope='record,index')
  //-       app-link-btn(@click='handleCompanyDetail(record)') 档位详情
  //-       app-link-btn(:to="'/investigation-detail/' + record.id") 填写详情
  //-       app-link-btn(@click="handleInvestigation(record)") 填写详情
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
      model: {},
      showColumns: [
        'name',
        'area',
        'companyName',
        'status',
        'signedWho',
        'owner',
        'signedTime',
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
        {
          title: '状态',
          dataIndex: 'status',
          customRender(text, record) {
            return text === 0 ? '未填' : text === 1 ? '已填' : '---';
          },
        },
        {
          title: '填写人',
          dataIndex: 'signedWho',
          customRender(text, record) {
            return text || '---';
          },
        },
        {
          title: '职位',
          dataIndex: 'owner',
          customRender(text, record) {
            return text === 1 ? '档主' : '从业人员' || '---';
          },
        },
        {
          title: '填写时间',
          dataIndex: 'signedTime',
          customRender(text, record) {
            return text || '---';
          },
        },
        { title: '操作', dataIndex: '', scopedSlots: { customRender: '操作' } },
      ],
      stallDtos: [],
      fields: [
        {
          name: 'code',
          label: '编号',
        },
        {
          name: 'name',
          label: '调查名称',
        },
        {
          name: 'tempTypeName',
          label: '调查类型',
        },
        {
          name: 'tempName',
          label: '问卷模板',
          render(h, r, v) {
            return (
              <div>
                <app-link-btn
                  class="ml2"
                  to={'/questionnaire-temp/detail/' + r.tempId}
                >
                  {v}
                </app-link-btn>
              </div>
            );
          },
        },
        {
          name: 'endTime',
          label: '有效时间',
          render(h, model, v) {
            return (
              <span>
                {model.beginTime}~{model.endTime}
              </span>
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
          name: 'count',
          label: '应填档位数',
        },
        {
          name: 'signedCount',
          label: '已填档位数',
        },
        {
          name: 'notSignedCount',
          label: '未填档位数',
        },
        {
          name: 'description',
          label: '调查描述',
        },
      ],
      loading: false,
      filters: {
        search: null,
        write: null,
      },
      filterFieleds: [],
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
    params() {
      return {
        ...this.filters,
        id: this.id,
        write:
          this.filters.write == 1 ? true : this.filters.write == 2 ? false : '',
      };
    },
  },
  async created() {
    this.loadModel(this.id);
    this.filterFieleds = [
      {
        name: 'write',
        placeholder: '状态',
        // width: '500px',
        component: 'app-remote-select',
        options: [
          { code: 1, name: '已填' },
          { code: 2, name: '未填' },
        ],
        field: { name: 'code', label: 'name' },
      },
    ];
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(
        `GET:/project-merchant/wholesaler-questionnaire/${id}`,
        // `GET:/project-merchant//wholesaler-questionnaire/${id}/stall/page`,
        {
          // ...this.params,
        },
      );
    },
    handleInvestigation(item) {
      this.$router.push({
        path: `/investigation-detail?id=${this.model.id}&stallId=${item.id}`,
      });
    },
    handleQuickSearch() { },
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

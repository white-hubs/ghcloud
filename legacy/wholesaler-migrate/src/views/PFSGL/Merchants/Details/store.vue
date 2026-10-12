<template lang="pug">
  div.worksheet
    //- .btn-tabs.px3.pb2
      a-button.category-btn(
        v-for='(cate, index) in categorys',
        :key='cate.code',
        :class='{ active: selectedCategoryIndex === index }',
        @click='handleCateClick(index)'
      ) {{ cate.name }}
    .worksheet-main
      CreateAppeal(ref='create', @modal-success='$refs.table.reload()')
      CreateTicket(title='诉求转工单', ref='ticket')
      Reply(ref='reply', @modal-success='$refs.table.reload()')
      app-table-page-layout
        template(#toolbar-left)
          app-search(
            v-model="filters"
            :fields="filterFieleds"
            @search="handleQuickSearch"
            keywordPlaceholder="请输入关键字"
            )             
          a-button.ml2(@click="$refs.table.reload()") 刷新
        template(#toolbar-right)
          //- a-button(@click='handleCreate', type='primary', icon='plus') 新建
          //- a-button(
          //-   type='primary',
          //-   style='margin-left: 10px',
          //-   @click='exportClick',
          //-   v-if='selectedCategoryIndex >= 2'
          //- ) 导出
          a-button.ml2(
            type='danger',
            @click='handleDeleteBatch',
            :disabled='!canDeleteBatch'
            :loading="deleteBatchLoading"
          ) 批量删除
        app-table(
          v-if='displayTable',
          ref='table',
          model-name='Appeal',
          url='/ops/appeals/store/page',
          :params='params',
          :visibles='selectedCategoryIndex < 2 ? columns : columns2',
          :columns-customsize='columnsCustomsize',
          :fitHeight='-30',
          @select='handleSelectChange',
          @selectChange='handleSelectChange',
          @change='handleSelectChange',
          @loaded='handleSelectChange'
        )
          template(#code='{text, record}')
            app-link-btn(:to='"/appeal/detail/" + record.id') {{ text }}
          template(#action='{record}')
            app-action-column(:max="4")
              app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import { appealStatus } from '@/components/global/AppDict/DictConst';
import CreateAppeal from '@/pages/AQYW/SQGL/Modal/CreateAppeal';
import CreateTicket from '@/pages/AQYW/SQGL/Modal/CreateTicket';
import Reply from '@/pages/AQYW/SQGL/Modal/Reply';
import moment from 'moment';
export default {
  name: 'KeepAliveXxxx',
  components: {
    CreateAppeal,
    CreateTicket,
    Reply,
  },
  props: {
    companyId: String,
  },
  data() {
    return {
      columns: [
        'code',
        'name',
        'startNickname',
        // 'startDeptName',
        'type',
        'source',
        // 'handler',
        'startTime',
        'endTime',
        'status',
        'isEvaluate',
      ],
      columns2: [
        'code',
        'name',
        'startNickname',
        // 'startDeptName',
        'type',
        'source',
        // 'handler',
        'startTime',
        'endTime',
        'status',
        'isEvaluate',
      ],
      appealStatus: { ...appealStatus },
      categorys: [],
      search: null,
      type: null,
      startTime: null,
      endTime: null,
      deptId: null,
      // status: appealStatus['pending'],
      date: null,
      sourceType: null,
      displayTable: true,
      // 筛选
      filters: {
        companyId: this.companyId,
        startUserType: 'userType_store',
      },
      filterFieleds: [],
      // 批量删除
      canDeleteBatch: false,
      deleteBatchLoading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    selectedCategoryIndex() {
      return this.$store.state.account.selectedCategoryIndex;
    },
    params() {
      return {
        // status: this.status,
        projectId: this.project.id,
        ...this.filters,
      };
    },
  },
  async created() {
    this.filterFieleds = [
      {
        name: 'type',
        placeholder: '诉求类型',
        component: 'app-dict-select',
        width: '150px',
        code: 'appealType',
      },
      {
        name: 'timeRange',
        placeholder: '请选择时间范围',
        width: '500px',
        component: 'AppTimeRangeSelect',
        options: [{ code: 'custom', name: '自定义时间范围' }],
        field: { name: 'code', label: 'name' },
        extraProp: {
          onlyCustom: true,
          onlyDate: true,
        },
        onChange: (e) => {
          if (Array.isArray(e)) {
            this.filters.timeRange = 'custom';
            this.filters.beginTime = e[0] || null;
            this.filters.endTime = e[1] || null;
          } else {
            this.filters.beginTime = null;
            this.filters.endTime = null;
          }
        },
      },
    ];
    await this.loadCategorys();

    if (this.selectedCategoryIndex) {
      this.status = this.categorys[this.selectedCategoryIndex].code;
      this.$nextTick(() => {
        this.$refs.table.refresh();
      });
    }
  },
  methods: {
    moment,
    async loadCategorys() {
      const cates = await this.$restful('/sys/dict-datas/graph', {
        typeCode: 'appealStatus',
      });
      this.categorys = cates;
      this.status = this.categorys[0].code;
    },
    handleCateClick(index) {
      this.displayTable = false;
      this.$store.commit('SET_SELECTEDCATEGORY', index);
      this.status = this.categorys[this.selectedCategoryIndex].code;
      this.$nextTick(() => {
        this.displayTable = true;
        this.$nextTick(() => {
          this.$refs.table.refresh();
        });
      });
    },
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    handleCreate() {
      this.$refs.create.show();
    },
    handleCreateTicket(record) {
      this.$refs.ticket.show(record);
      // this.$refs.ticket.show({
      //   sourceType: 'ticketinstSource_appeal',
      //   sourceId: record.id,
      //   ticketId: record.ticketId,
      //   dutyId: record?.dutyId?.split(','),
      //   deviceDTOS: record?.deviceDTOS, // 设备自动填
      //   deviceIds: record?.deviceDTOS?.map((item) => item.id),
      // });
    },
    handleReply(record) {
      this.$refs.reply.show(record, 'reply');
    },
    handleClose(record) {
      this.$refs.reply.show(record, 'close');
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/appeals/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.reload();
    },
    // 批量删除
    handleDeleteBatch() {
      this.deleteBatchLoading = true;
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`delete:/project-merchant/appeals`, {
        ids: ids,
      })
        .then(() => {
          this.$refs.table.reload();
        })
        .finally(() => {
          this.deleteBatchLoading = false;
        });
    },
    // 是否可以批量删除
    handleSelectChange(select) {
      if (select?.selectedRowKeys?.length) {
        this.canDeleteBatch = true;
      } else {
        this.canDeleteBatch = false;
      }
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '8rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    //导出
    async exportClick() {
      await this.$restful(`GET:/ops/appeals/data-export`, this.params, {
        responseType: 'blob',
      }).then((res) => {
        const link = document.createElement('a');
        let blob = new Blob([res], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.setAttribute(
          'download',
          '诉求导出' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
  },
};
</script>

<style lang="less" scoped>
.worksheet {
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
  .btn-tabs {
    flex: none;
    // padding: var(--space-3);
    // padding-bottom: 0;
    .category-btn {
      margin-right: 1rem;
    }
  }
  .worksheet-main {
    flex: auto;
    overflow: hidden;
    position: relative;
  }
}
</style>

<template lang="pug">
  .worksheet
    .worksheet-main
      app-table-page-layout
        template(#toolbar-left)
          app-search(
            v-model='filters',
            :fields='filterFieleds',
            @search='handleQuickSearch',
            keywordPlaceholder='请输入关键字'
          ) 
          a-button.ml2(@click='$refs.table.reload()') 刷新
        template(#toolbar-right)
          a-button(
            type='primary',
            style='margin-left: 10px',
            @click='exportClick'
          ) 导出
        app-table(
          ref='table',
          model-name='production',
          url='/project-merchant/stall-score-stat/score/page',
          :visibles='columns',
          :params='params',
          :fitHeight='-50'
        )
  </template>
  <script>
  import { GETTER_PROJECT } from '@store/account';
  import { mapGetters } from 'vuex';
  import moment from 'moment';
  export default {
    // name: 'KeepAliveXxxx',
    components: {},
    data() {
      return {
        columns: [
          'name',
          'companyName',
          'owner',
          'defaultScore',
          'deductScore',
          'score',
        ],
        // categorys: [],
        search: null,
        type: null,
        startTime: null,
        endTime: null,
        deptId: null,
        date: null,
        sourceType: null,
  
        filters: {
          startUserType: 'userType_staff',
          rate: [0, 100],
          timeYear: this.moment().format('YYYY'),
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
      params() {
        return {
          // status: this.status,
          projectId: this.project?.id,
          search: this.filters?.search,
          minScore: this.filters?.minScore,
          maxScore: this.filters?.maxScore,
          year: this.moment(this.filters.timeYear).format('YYYY'),
        };
      },
    },
    async created() {
      this.filterFieleds = [
        // {
        //   name: 'deptId',
        //   component: 'app-tree-select',
        //   width: '150px',
        //   uid: 'dept',
        //   placeholder: '选择档位',
        //   api: '/project-merchant/appeals/dept/auth/list',
        //   params: { projectId: this.project.id },
        //   // field:{},
        //   dataFormatter: (data) => {
        //     data[0].selectable = false;
        //     return data;
        //   },
        // },
        // {
        //   name: 'type',
        //   placeholder: '选择年份',
        //   component: 'app-dict-select',
        //   width: '150px',
        //   code: 'appealType',
        // },
        {
          name: 'rate',
          component: 'app-rate-range-select',
          width: '250px',
          uid: 'rate',
          placeholder: '请选择分值范围',
          unit: '',
          onChange: (val) => {
            this.filters.minScore = val[0];
            this.filters.maxScore = val[1];
          },
        },
        {
          name: 'timeYear', //回显的字段名称
          placeholder: '请选择年月',
          width: '200px',
          component: 'AppYearPicker',
          uid: 'timeYear',
          extraProp: {
            onlyCustom: true, //控制第一次是否执行
            onlyDate: true,
          },
        },
        // {
        //     name: 'timeRange',
        //     placeholder: '请选择时间范围',
        //     width: '500px',
        //     component: 'AppTimeRangeSelect',
        //     options: [{ code: 'custom', name: '自定义时间范围' }],
        //     field: { name: 'code', label: 'name'},
        //     extraProp: {
        //       onlyCustom: true,//控制第一次是否执行
        //       onlyDate: true,
        //     },
        // }
      ];
      await this.loadCategorys();
    },
    methods: {
      moment,
      async loadCategorys() {
        // const cates = await this.$restful('/sys/dict-datas/graph', {
        //   typeCode: 'appealStatus',
        // });
        // this.categorys = cates;
        // this.status = this.categorys[0].code;
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
      //导出
      async exportClick() {
        await this.$restful(
          `GET:/project-merchant/stall-score-stat/score/export`,
          this.params,
          {
            responseType: 'blob',
          },
        ).then((res) => {
          const link = document.createElement('a');
          let blob = new Blob([res], {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          link.style.display = 'none';
          link.href = URL.createObjectURL(blob);
          link.setAttribute(
            'download',
            '安全生产值导出' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
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
    }
    .worksheet-main {
      flex: auto;
      overflow: hidden;
      position: relative;
    }
  }
  </style>
  
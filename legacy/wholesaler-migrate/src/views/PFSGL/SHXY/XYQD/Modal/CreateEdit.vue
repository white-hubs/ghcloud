<template lang="pug">
app-page-layout(
  fix-header
)
  .my3.px3.abs-fit.overflow-auto
    app-form(
      :model='model',
      :rules='rules',
      ref='form',
      oneline,
      :labelWidth='110'
    )
      a-row(:gutter='16')
        a-row
          a-col(v-bind='colspans')
            a-form-model-item(label='名称', prop='name')
              a-input(placeholder="请输入名称",v-model="model.name" :maxLength='50')
          a-col(v-bind='colspans')
            a-row(:gutter='15')
              a-col(:span='18')
                a-form-model-item(label='协议模板', prop='templateId')
                  app-tree-select(
                    placeholder="请选择协议模板"
                    v-model='model.templateId',
                    api='/project-merchant/wholesaler-protocol-template/list',
                    :params='{ projectId: project.id }'
                  )
              a-col(:span='6')
                app-link-btn(to='/agreement-mould/add')
                  a-button(type="primary") 新增
          a-col(:sm="20")
            a-form-model-item(label="有效时间" prop="endTime")
              a-row(:gutter="10")
                a-col(:span="6")
                  a-form-model-item
                    a-row(:gutter="10")
                      a-col.flex(:span="6")
                        a-switch(v-model="model.beginTimeIsNow",checked-children="开")
                      a-col(:span="18")
                        a-input(v-if="model.beginTimeIsNow",v-model="show")
                        a-date-picker(v-if="!model.beginTimeIsNow",v-model="model.beginTime",format="YYYY-MM-DD HH:mm:ss",valueFormat="YYYY-MM-DD HH:mm:ss",:show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }",placeholder="开始时间") 
                a-col(:span="8")
                  a-form-model-item(prop="endTime")
                    a-date-picker(v-model="model.endTime", format="YYYY-MM-DD HH:mm:ss",valueFormat="YYYY-MM-DD HH:mm:ss",:show-time="{ defaultValue: moment('23:59:59', 'HH:mm:ss') }",placeholder="结束时间")
          a-col(:sm="10")
            a-form-model-item(label='描述', prop='remark')
              a-textarea(v-model='model.remark' placeholder="请输入描述" :maxLength="100")  
        div.flex
          AppCard.mt1(title="管理签订档位")
          .btn_group
            a-button(type="primary" icon="plus" @click="addCompany") 新增
            a-button.ml2(
              type="danger"
              @click="handleDeleteBatch"
              :disabled="!canDeleteBatch"
              :loading="deleteBatchLoading"
            ) 批量删除
          CreateStall(ref="createStall",@select-stall="handleStall")
        .table_content
          a-table(
            :columns='columns',
            rowKey="id",
            :data-source='tableData',
            :pagination='false',
            :scroll='{ y: 200 }'
          )
            template(slot='操作', slot-scope='record,index')
              app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
    .mt2
      a-button(
        type='primary',
        @click='handleSubmit',
        :disabled='!!loading',
      ) 保存
      app-link-btn.ml1(to='/agreement-sign') 
        a-button 取消
</template>
<script>
import moment from 'moment';
import CreateStall from './CreateStall';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    CreateStall,
  },
  data() {
    return {
      show: '现在',
      columns: [
        { title: '档位名称', dataIndex: 'name' },
        {
          title: '所属区域',
          dataIndex: 'areaNames',
          customRender(text, record) {
            return text?.length ? text.join('/') : '--';
          },
        },
        {
          title: '所属商户',
          dataIndex: 'companyName',
        },
        // {
        //   title: '出租状态',
        //   dataIndex: 'rentStatus',
        //   customRender(text, record) {
        //     return text === 0 ? '未租' : text === 1 ? '已租' : '---';
        //   },
        // },
        { title: '操作', dataIndex: '', scopedSlots: { customRender: '操作' } },
      ],
      tableData: [],
      id: null,
      // 批量删除
      canDeleteBatch: false,
      deleteBatchLoading: false,
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {
        projectId: null,
        name: null,
        templateId: null,
        remark: null,
        beginTime: null,
        endTime: null,
        stallIds: [],
        beginTimeIsNow: false,
      },
      rules: {
        templateId: [{ required: true, message: '必填项' }],
        type: [{ required: true, message: '必填项' }],
        name: [{ required: true, message: '必填项' }],
        endTime: [{ required: true, message: '必填项' }],
      },
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return { projectId: this.project.id };
    },
  },
  async created() {
    let _this = this;
    _this.id = _this.$route.params.id;
    this.model.templateId = _this.$route.query.id;
    if (_this.id) {
      _this.loadModel(_this.id);
    }
  },
  methods: {
    moment,
    async loadModel(id) {
      if (id) {
        const model = await this.$restful(`GET:/project-merchant/wholesaler-prtocol/${id}`, {
          projectId: this.project.id,
        });
        this.tableData = model.stallDtos;
        this.model = {
          ...model,
          beginTime: moment(model.beginTime).format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment(model.endTime).format('YYYY-MM-DD HH:mm:ss')
        };
      }
    },

    handleAddPaper() {
      this.$router.push({
        path: '/test-paper/add',
      });
    },
    async handleSubmit(type) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = type;
          await this.$restful('POST:/project-merchant/wholesaler-protocol', {
            ...this.model,
            projectId: this.project.id,
            stallIds: this.tableData.map((item) => item.id),
          });
          this.$message.success('保存成功。');
          try {
            this.$back();
          } catch {
            this.$router.push({ path: '/agreement-sign' });
          }
        } finally {
          this.loading = false;
        }
      }
    },
    // 新增
    addCompany() {
      this.$refs.createStall.show();
    },
    handleDelete(record, cb) {
      for (let i in this.tableData) {
        if (this.tableData[i].id == record.id) {
          this.tableData.splice(i, 1);
          cb();
          this.$message.success('删除成功。');
        }
      }
    },
    // 批量删除
    handleDeleteBatch() {
      if (this.typeActvie === 'userType_staff') {
        for (let i in this.staffData) {
          for (let j in this.selectedRowStaffKeys) {
            if (this.staffData[i].id === this.selectedRowStaffKeys[j]) {
              this.staffData.splice(i, 1);
            }
          }
        }
      } else if (this.typeActvie === 'userType_store') {
        for (let i in this.storeData) {
          for (let j in this.selectedRowStoreKeys) {
            if (this.storeData[i].id === this.selectedRowStoreKeys[j]) {
              this.storeData.splice(i, 1);
            }
          }
        }
      }
    },
    handleStall(val) {
      this.$nextTick(() => {
        if (this.tableData && this.tableData.length > 0) {
          let newDatas = [...this.tableData, ...val];
          let obj = {};
          this.tableData = newDatas.reduce((cur, next) => {
            obj[next.id] ? '' : (obj[next.id] = true && cur.push(next));
            return cur;
          }, []);
        } else {
          this.tableData = val;
        }
      });
    },
    handleCancel() {
      this.$back();
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'businessKey',
        dataIndex: 'businessKey',
        title: '操作',
        width: '8rem',
        render: (h, v, r) => {
          return (
            <app-link-btn onClick={() => this.unBind(r)}>删除</app-link-btn>
          );
        },
      });
      return columns;
    },
    async unBind(element) {
      const device = await this.$restful(
        `GET:/project-merchant/devices/${element.businessKey}`,
        {
          projectId: this.project.id,
        },
      );
      device.bimInfo = {};
      await this.$restful('save:/project-merchant/devices', {
        ...device,
        projectId: this.project.id,
      });
      this.$refs.ele.$refs.listDialog.$refs.table.reload();
    },
  },
};
</script>
<style lang="less" scoped>
.btn_group {
  display: flex;
  align-items: center;
}
</style>

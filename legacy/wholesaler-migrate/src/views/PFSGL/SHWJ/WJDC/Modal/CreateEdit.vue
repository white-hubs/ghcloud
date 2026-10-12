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
           a-form-model-item(label='调查名称', prop='name')
            a-input(placeholder="请输入名称",v-model="model.name")
          a-col(v-bind='colspans')
            a-row(:gutter='15')
              a-col(:span='18')
                a-form-model-item(label='问卷模板', prop='tempId')
                  app-tree-select(
                    placeholder="请选择模板"
                    v-model='model.tempId',
                    api='/project-merchant/wholesaler-ques-temp/list',
                    :params='params'
                    @change="handleTempChange"
                  )
              a-col(:span='6')
                app-link-btn(to='/store-train-task/add')
                  a-button(type="primary") 新增
          a-col(v-bind='colspans')
            a-form-model-item(label='调查类型', prop='tempType')
              app-remote-select(
                placeholeder="请选择类型"
                v-model='model.tempType',
                api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-questionnaireType" 
                :field="{name:'code', label: 'name'}"
              )
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
                      a-date-picker(v-if="!model.beginTimeIsNow",v-model="model.beginTime",format="YYYY-MM-DD HH:mm:ss",valueFormat="YYYY-MM-DD HH:mm:ss",:showTime="{defaultValue: moment('00:00:00', 'HH:mm:ss')}",placeholder="开始时间") 
                a-col(:span="8")
                  a-form-model-item(prop="endTime")
                    a-date-picker(v-model="model.endTime",format="YYYY-MM-DD HH:mm:ss",valueFormat="YYYY-MM-DD HH:mm:ss",:showTime="{defaultValue: moment('23:59:59', 'HH:mm:ss')}",placeholder="结束时间")
          a-col(:sm="10")
            a-form-model-item(label='调查描述', prop='description')
              a-textarea(v-model='model.description' placeholder="请输入描述" :maxLength="100")  
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
          CreateCompany(ref="create",@select-company="handleCompany")
        .table_content
          a-table(
            :columns='columns',
            row-key="id",
            :data-source='tableData',
            :scroll='{ y: 200 }',
            :row-selection='{ selectedRowKeys: selectedRowKeys, onChange: onSelectChangeStore }')
            template(slot='操作', slot-scope='record,index')
              //- app-link-btn.m1 档位详情
              app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
    .mt2
      a-button(
        type='primary',
        @click='handleSubmit',
        :disabled='!!loading',
        :loading='loading === "save"'
      ) 保存
      app-link-btn.ml1(to='/questionnaire-examine') 
        a-button 取消
</template>
<script>
import moment from 'moment';
import CreateCompany from './CreateCompany';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    CreateCompany,
  },
  data() {
    return {
      show: '现在',
      expandedRowKeys: [],
      selectedRowKeys: [],
      columns: [
        { title: '档位名称', dataIndex: 'name' },
        {
          title: '面积',
          dataIndex: 'acreage',
        },
        {
          title: '所属区域',
          dataIndex: 'areaNames',
          customRender(text, record) {
            return text?.length ? text.join('/') : '--';
          },
        },
        {
          title: '管理部门',
          dataIndex: 'deptName',
        },
        {
          title: '所属商户',
          dataIndex: 'companyName',
        },
        // {
        //   title: '经营类型',
        //   dataIndex: 'tradeModel',
        //   customRender(text, record) {
        //     return <app-dict-display value={text} />;
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
      coursewareId: null,
      model: {
        projectId: null,
        tempId: null,
        beginTimeIsNow: false,
        tempName: null,
        tempType: null,
        description: null,
        beginTime: '',
        endTime: '',
        stallIds: [],
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        tempId: [{ required: true, message: '必填项' }],
        tempType: [{ required: true, message: '必填项' }],
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
    this.id = this.$route.params.id;

    if (this.id) {
      this.loadModel(this.id);
    }
  },
  methods: {
    moment,
    async loadModel(id) {
      if (id) {
        const model = await this.$restful(
          `GET:/project-merchant/wholesaler-questionnaire/${id}`,
        );
        this.tableData = model.stallDtos;
        this.model = {
          ...model,
        };
        this.model.endTime = moment(this.model.endTime).format('YYYY-MM-DD')
        this.model.beginTime = moment(this.model.beginTime).format('YYYY-MM-DD')
      }
    },
    handleTempChange(v, select) {
      this.model.tempName = select[0];
    },
    async handleSubmit(type) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = type;
          await this.$restful(`post:/project-merchant/wholesaler-questionnaire`, {
            ...this.model,
            projectId: this.project.id,
            stallIds: this.tableData.map((item) => item.id),
          });
          this.$message.success('保存成功。');
          try {
            this.$back();
          } catch {
            //
          }
        } finally {
          this.loading = false;
        }
      }
    },
    // 新增
    addCompany() {
      this.$refs.create.show();
    },

    onSelectChangeStore(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
        this.canDeleteBatch = true;
      } else {
        this.canDeleteBatch = false;
      }
    },
    // 删除
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
      for (let i in this.tableData) {
        for (let j in this.selectedRowKeys) {
          if (this.tableData[i].id === this.selectedRowKeys[j]) {
            this.tableData.splice(i, 1);
          }
        }
      }
    },
    handleCompany(val) {
      if (this.tableData && this.tableData.length > 0) {
        let newDatas = [...this.tableData, ...val];
        let obj = {};
        this.tableData = newDatas.reduce((cur, next) => {
          obj[next.id] ? '' : (obj[next.id] = true && cur.push(next));
          return cur;
        }, []); //设置cur默认类型为数组，并且初始值为空的数组
      } else {
        this.tableData = val;
      }
    },
    handleCancel() {
      this.$back();
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

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
      :labelWidth='120'
    )
      a-row(:gutter='16')
        a-row
          a-col(v-bind='colspans')
            a-form-model-item(label='签约方式', prop='signingWay')
              a-select(v-model="model.signingWay" @change='signingWaySelect')
                a-select-option(v-for="item in list" :key="item.name" :value="item.name") {{ item.label }}
          a-col(v-bind='colspans')
            a-form-model-item(label='原合同编号')
              app-remote-select(
                placeholeder="请选择"
                @change="handleOldCode"
                v-model='model.oldCode',
                api='/project-merchant/wholesaler-contract/list',
                :field="{name: 'id', label: 'code'}" 
                :params="params" allow-clear
                  :disabled='whetherDisabled'
                )
          a-col(v-bind='colspans')
            a-form-model-item(label='合同类型', prop='contractTypeId')
              app-remote-select(
                v-model='model.contractTypeId',
                api="/project-merchant/wholesaler-contract-type/list" 
                :params="{projectId: project.id,enabled:1}" allow-clear
                placeholeder="请选择"
              )
        a-row
          a-col(:sm="20")
            a-form-model-item(label='选择档位')
              a-button(type="primary" icon="plus" @click="handleCreate") 新增
              CreateStall(ref="stall",@select-stall="handleStall")
              .stall_container
                a-table(
                  row-key="id"
                  :columns='columns',
                  :pagination="false"
                  :data-source='tableData',
                  :scroll='{ y: 200 }'
                )
                 template(slot='操作', slot-scope='record,index')
                  app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
        a-row
          a-col(v-bind='colspans')
            a-form-model-item(label='租赁期限' prop="beginTime")
              a-row(:gutter="20")
                a-col(:sm="10")
                  a-form-model-item(prop="beginTime")
                    a-date-picker(v-model="model.beginTime" placeholder="开始时间" format="YYYY-MM-DD")
                a-col(:sm="10")
                  a-form-model-item(prop="endTime")
                    a-date-picker(v-model="model.endTime" placeholder="结束时间" format="YYYY-MM-DD")
          a-col(v-bind='colspans')
            a-form-model-item(label='纸质合同编号')
              a-input(v-model="model.paperCode" placeholder="请输入纸质合同编号")
        a-row
          a-col(v-bind='colspans')
            a-form-model-item(label='合同附件' prop="paperContractIds")
              appUploadFiles(v-model="model.paperContractIds" :files="model.paperContractDtos" :useCenterApi="true" :fileNumberLimit="4" :fileSizeLimit="100" :btn-label="'上传视频'")
        a-row
          a-col(v-bind='colspans')
            a-form-model-item(label='补充说明', prop='remark')
              a-textarea(v-model='model.remark' placeholder="请输入说明" :maxLength="100") 
    .mt2
      a-button(
        @click='handleSubmit(false)',
        :disabled='!!loading',
        :loading='loading === "save"'
      ) 保存
      a-button.ml2(
        @click='handleSubmit(true)',
        :disabled='!!loading',
        :loading='loading === "draft"'
      ) 保存草稿
      app-link-btn.ml1(to='/contract-list') 
        a-button 取消
</template>
<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';
import CreateStall from './CreateStall';
export default {
  components: {
    CreateStall,
  },
  data() {
    return {
      id: null,
      time: [],
      tableData: [],
      list: [
        { name: 1, label: '续签' },
        {
          name: 0,
          label: '新签',
        },
      ],
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
        { title: '操作', dataIndex: '', scopedSlots: { customRender: '操作' } },
      ],
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {
        projectId: null,
        signingWay: null,
        code: null,
        contractTypeId: null,
        stallIds: [],
        beginTime: null,
        endTime: null,
        paperCode: null,
        paperContractIds: [],
        remark: null,
        status: null,
      },
      rules: {
        signingWay: [{ required: true, message: '必填项' }],
        time: [{ required: true, message: '必填项' }],
        paperContractIds: [{ required: true, message: '必填项' }],
        contractTypeId: [{ required: true, message: '必填项' }],
        beginTime: [{ required: true, message: '必填项' }],
        endTime: [{ required: true, message: '必填项' }],
      },
      loading: false,
      whetherDisabled: true, //控制原来合同编号下拉框，是否可选
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return { projectId: this.project.id };
    },
  },
  async created() {
    let _this = this;
    _this.id = _this.$route.params.id;
    _this.model.planId = _this.$route.query.planId;
    if (_this.id) {
      _this.loadModel(_this.id);
    }
  },
  methods: {
    async loadModel(id) {
      if (id) {
        const model = await this.$restful(
          `GET:/project-merchant/wholesaler-contract/${id}`,
          {
            // projectId: this.project.id,
          },
        );
        this.tableData = model.stallDtos;
        this.model = {
          ...model,
        };
      }
    },
    handleOldCode(v) {
      //这里原合同编号
    },
    handleCreate() {
      this.$refs.stall.show();
    },
    handleStall(val) {
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
    async handleSubmit(draft) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = draft ? 'draft' : 'save';
          await this.$restful('post:/project-merchant/wholesaler-contract', {
            ...this.model,
            projectId: this.project.id,
            stallIds: this.tableData.map((item) => item.id),
            status: (this.loading = draft ? 0 : 1),
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
    //签约方式：发生改变时，触发对应的事件
    signingWaySelect(value) {
      if (value == 1) {
        this.whetherDisabled = false;
      } else {
        this.whetherDisabled = true;
        // this.model.oldCode='';
      }
    },
  },
};
</script>
<style lang="less" scoped>
.plan_header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.stall_container {
  margin-top: 15px;
}
</style>

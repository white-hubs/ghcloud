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
      AppCard.mt1(title='甲方信息')
        a-col(v-bind='colspans')
          a-form-model-item(label='甲方名称', prop='name')
            a-input(v-model="model.name" placeholder="请输入")
        a-col(v-bind='colspans')
          a-form-model-item(label='住所', prop='address')
            a-input(v-model="model.address" placeholder="请输入" :maxLength="150")
        a-col(v-bind='colspans')
          a-form-model-item(label='邮政编码', prop='postCode')
            a-input(v-model="model.postCode" placeholder="请输入")
        a-col(v-bind='colspans')
          a-form-model-item(label='联系电话', prop='mobile')
            a-input(v-model="model.mobile" placeholder="请输入")
      div.flex
        AppCard.mt1(title='甲方签约人信息')
        a-button(type="primary" icon="plus" @click="addSignatory") 新增
        CreateSign(ref="sign",@select-sign="handleSign")
      .table_content
        a-table(
          rowKey="userId",
          :columns='columns',
          :scroll='{ y: 200 }'
          :data-source='tableData')
          template(v-for="(col,i) in ['remark']" :slot="col" slot-scope="text,record")
            a-input(:key="col" :value="text" placeholder="请输入备注" @change="e=>handleChange(e.target.value,record)")
          template(slot='操作', slot-scope='record,index')
            app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
      AppCard.mt1(title='甲方签章信息')
        a-col(v-bind='colspans')
          a-form-model-item(label='电子章', prop='fileIds')
            app-upload-imgs(
              v-model='model.fileIds',
              :files.sync='model.fileDtos',
              :fileNumberLimit="1"
              useCenterApi
            )
    .mt2
      a-button(
        type='primary',
        @click='handleSubmit',
        :disabled='!!loading',
        :loading='loading === "save"'
      ) 保存
      //- app-link-btn.ml1(to='/contract-list') 
      //-   a-button 取消
</template>
<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';
import CreateSign from './Modal/CreateSign';
export default {
  components: { CreateSign },
  data() {
    return {
      id: null,
      tableData: [],
      columns: [
        { title: '姓名', dataIndex: 'name' },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
          scopedSlots: { customRender: 'remark' },
        },
        { title: '操作', dataIndex: '', scopedSlots: { customRender: '操作' } },
      ],
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {
        projectId: null,
        planId: null,
        time: null,
        theme: null,
        address: null,
        remark: null,
        duration: null,
        name: null,
        planUserDTOS: [],
      },
      rules: {
        planId: [{ required: true, message: '必填项' }],
        name: [{ required: true, message: '必填项' }],
        time: [{ required: true, message: '必填项' }],
        duration: [{ required: true, message: '必填项' }],
        address: [{ required: true, message: '必填项' }],
        theme: [{ required: true, message: '必填项' }],
      },
      loading: false,
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
    this.loadModel();
  },
  methods: {
    async loadModel() {
      const model = await this.$restful(
        `/project-merchant/wholesaler-first-part/${this.project.id}`,
      );
      this.model = {
        ...model,
      };
      this.tableData = this.model.signatoryList;
    },
    addSignatory() {
      this.$refs.sign.show();
    },
    handleChange(value, record) {
      record.remark = value;
    },
    handleSign(val) {
      if (this.tableData && this.tableData.length > 0) {
        let newDatas = [...this.tableData, ...val];
        let obj = {};
        this.tableData = newDatas.reduce((cur, next) => {
          obj[next.userId] ? '' : (obj[next.userId] = true && cur.push(next));
          return cur;
        }, []); //设置cur默认类型为数组，并且初始值为空的数组
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
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          await this.$restful('post:/project-merchant/wholesaler-first-part', {
            ...this.model,
            signatoryList: this.tableData,
            fileIds: this.model.fileIds,
            projectId: this.project.id,
          });
          this.$message.success('保存成功。');
          this.loadModel();
        } finally {
          this.loading = false;
        }
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

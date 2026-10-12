<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="1200" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    div.container
      div.wait-select-box
        div.box-title
          span.pb2 备选项
        div.search-box.pb1
          app-search(
          keywordPlaceholder="请输入名称搜索"
          v-model="filters"
          :fields="filterFieleds"
          )
          a-button.ml1(@click="$refs.page.reload()") 刷新
        div.box-body
          div.table-box
            div.table-header
              div.table-row 
                TableHeaderCell(v-for="col in columns" :key="col.uid" v-bind="col")
            a-spin(:spinning="tableLoading")
              div.table-body
                div.table-row(v-for="(r, index) in tableData" :key="r.id" @click="handleRowClick(r, index)")
                  TableCell(v-for="col in columns" :key="col.uid + '_' + r.id"  v-bind="col" :model="r")
            div.pager.p2.right
              CustomPagination(
                ref="page"
                :data.sync="tableData"
                :loading.sync="tableLoading"
                api="project-merchant/companies/page"
                :params="params"
                :tablePagination="{ pageSize: 20 }"
              )
      div.select-box.ml2
        div.box-title
          span.pb2 已选项
        div.box-body
          div.slect-items
            div.select-item.ellipsis(v-for="item in selections" :key="item.id" :title="item.name" @dblclick="handleRowClick(item)")
              span {{item.name}}
      div.form-box.ml2
        div.box-title
          span.pb2 批量修改
        div.box-body.pt2(style="overflow-y: auto; overflow-x: hidden;")
          app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="126")
            a-form-model-item(label='安全协议', prop='securityFileIds')
              app-upload-files(
                v-model='model.securityFileIds',
                :files='model.securityFileDTOS',
                :fileNumberLimit='1'
              )
            a-form-model-item(label='安全培训照片', prop='trainingPhotoFileIds')
              app-upload-imgs(
                v-model='model.trainingPhotoFileIds',
                :files='model.trainingPhotoFileDTOS',
                :fileNumberLimit='8'
              )
            a-form-model-item(label='商户灭火器/消防栓', prop='companyPhotoFileIds')
              app-upload-imgs(
                v-model='model.companyPhotoFileIds',
                :files='model.companyPhotoFileDTOS',
                :fileNumberLimit='1'
              )
        
        
</template>

<script>
import CustomPagination from './CustomPagination';

import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  components: {
    CustomPagination,
    TableHeaderCell: {
      props: {
        uid: String,
        dataIndex: String,
        title: [String, Function],
        width: String,
        render: Function,
      },
      render() {
        if (typeof this.title === 'function') {
          return (
            <div class="p2 " style={{ width: this.width }}>
              {this.title()}
            </div>
          );
        } else {
          return (
            <div class="p2 " style={{ width: this.width }}>
              {this.title}
            </div>
          );
        }
      },
    },
    TableCell: {
      props: {
        uid: String,
        dataIndex: String,
        title: [String, Function],
        width: String,
        render: Function,
        model: [Object, Array],
      },
      render() {
        return (
          <div
            class="p2 pl2 ellipsis"
            style={{ width: this.width }}
            title={this.model[this.dataIndex]}
          >
            {this.render
              ? this.render(
                  this.$createElement,
                  this.model[this.dataIndex],
                  this.model,
                )
              : this.model[this.dataIndex]}
          </div>
        );
      },
    },
  },
  data() {
    return {
      visible: false,
      loading: false,
      title: '批量修改文件/图片',
      model: {
        securityFileIds: [],
        securityFileDTOS: [],
        trainingPhotoFileIds: [],
        trainingPhotoFileDTOS: [],
        companyPhotoFileIds: [],
        companyPhotoFileDTOS: [],
      },
      rules: {
        files: [{ required: true, message: '必填项' }],
      },
      columns: [
        {
          uid: 'checked',
          dataIndex: 'checked',
          title: () => {
            const checkAll = this.isCheckedAll();
            const indeterminate = this.isIndeterminate();
            return (
              <a-checkbox
                indeterminate={indeterminate && !checkAll}
                checked={checkAll}
                onClick={this.toggleCheckedAll}
              />
            );
          },
          width: '40px',
          render: (h, v, r) => {
            const checked = this.isChecked(r);
            return <a-checkbox checked={checked} />;
          },
        },
        {
          uid: 'name',
          dataIndex: 'name',
          title: '名称',
          width: '40%',
        },
        {
          uid: 'owner',
          dataIndex: 'owner',
          title: '所属人姓名',
          width: '40%',
        },
        {
          uid: 'securityFileDTOS',
          dataIndex: 'securityFileDTOS',
          title: '安全协议',
          width: '20%',
          render(h, v) {
            return v?.length ? '已签订' : '未签订';
          },
        },
      ],
      // 搜索
      filters: {},
      filterFieleds: [],
      // 表格分页数据
      tableData: [],
      tableLoading: false,
      // 已选中
      selections: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return {
        ...this.filters,
        projectId: this.project.id,
      };
    },
  },
  mounted() {},
  methods: {
    handleQuickSearch() {
      this.$refs.page.refresh();
    },
    show(selections) {
      this.selections = selections;
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        securityFileIds: [],
        securityFileDTOS: [],
        trainingPhotoFileIds: [],
        trainingPhotoFileDTOS: [],
        companyPhotoFileIds: [],
        companyPhotoFileDTOS: [],
      };
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.$restful(`POST:/project-merchant/companies/batchUpdateFile`, {
          ...this.model,
          companyIds: this.selections.map((item) => item.id),
        })
          .then((res) => {
            this.hide();
            this.$emit('on-save', res);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    isChecked(r) {
      return !!this.selections.find((item) => item.id === r.id);
    },
    isCheckedAll() {
      for (let i = 0; i < this.tableData.length; i++) {
        if (!this.isChecked(this.tableData[i])) {
          return false;
        }
      }
      return true;
    },
    isIndeterminate() {
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.isChecked(this.tableData[i])) {
          return true;
        }
      }
      return false;
    },
    findIndex(r) {
      let index = -1;
      this.selections.forEach((item, idx) => {
        if (item.id === r.id) {
          index = idx;
        }
      });
      return index;
    },
    handleRowClick(r) {
      const index = this.findIndex(r);
      if (index > -1) {
        this.selections.splice(index, 1);
      } else {
        this.selections.push(r);
      }
    },
    toggleCheckedAll() {
      if (this.isCheckedAll()) {
        this.tableData.forEach((item) => {
          const index = this.findIndex(item);
          if (index > -1) {
            this.selections.splice(index, 1);
          }
        });
      } else {
        this.tableData.forEach((item) => {
          if (!this.isChecked(item)) {
            this.selections.push(item);
          }
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  display: flex;
  .wait-select-box {
    width: 40%;
    height: 600px;
  }
  .select-box {
    width: 18%;
    height: 600px;
  }
  .form-box {
    width: 42%;
    height: 600px;
  }
  .box-title {
    font-weight: 600;
  }
  .box-body {
    height: 600px;
  }
  .slect-items {
    height: 590px;
    border: 1px solid rgba(16, 17, 26, 0.1);
    padding: 10px;
    overflow-y: auto;
    .select-item {
      height: 30px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      background-color: rgba(16, 17, 26, 0.03);
      user-select: none;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        background-color: rgba(137, 145, 223, 0.1);
      }
      & + .select-item {
        margin-top: 5px;
      }
    }
  }
  .table-header {
    background-color: rgba(16, 17, 26, 0.1);
    .table-row {
      height: 46px;
      display: flex;
      align-items: center;
    }
  }
  .table-body {
    min-height: 46px;
    max-height: 463px;
    overflow: overlay;
    font-size: 14px;
    .table-row {
      height: 46px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(16, 17, 26, 0.1);
      &:hover {
        background-color: rgba(16, 17, 26, 0.02);
      }
      .table-cell {
        //
        .link-like {
          color: #00ffff;
          cursor: pointer;
          &:hover {
            // text-shadow: 0 3px 3px #00ffff;
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>

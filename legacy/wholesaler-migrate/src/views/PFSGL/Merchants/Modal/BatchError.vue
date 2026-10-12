<template lang="pug">
  app-modal(v-model="visible" :title="title" :width="800" :confirm-loading="loading" @ok="handleSubmit" @cancel="hide")
    app-custom-table(
      :tableData="errors"
      :tableColumns="tableColumns"
      noPagination
      :selectionMode="false"
      :maxHeight="368"
    )
    template(slot="footer")
      a-button(type="default" @click="hide") 关闭
</template>

<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      visible: false,
      loading: false,
      title: '批量修改文件/图片错误信息',
      errors: [],
      tableColumns: [
        {
          uid: 'id',
          dataIndex: 'id',
          title: '商户ID',
          width: '200px',
          customClass: ['pl3'],
          render(h, v) {
            return v || '--';
          },
        },
        {
          uid: 'info',
          dataIndex: 'info',
          title: '错误信息',
          // width: '200px',
          flex: 1,
          render(h, v) {
            return v || '--';
          },
        },
      ],
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
    show(errors) {
      this.errors = Object.keys(errors).map((k) => {
        return {
          id: k,
          info: errors[k],
        };
      });
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    async handleSubmit() {},
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

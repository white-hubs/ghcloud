<template>
  <w-dialog-for-org-picker :border="false" closeFree @ok="selectOk" @cancel="close" :title="title" v-model="visible">
    <div class='serach-area'>
      <el-form :inline="true" :model="formInline" class="demo-form-inline" size="medium">
        <el-form-item label="">
          <el-input v-model="formInline.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-area" v-loading="loading" v-if="visible">
      <el-table ref='nodeTableRef' :data="dataSource" :row-key=" getRowKey " @select="handleSelectionChangePage"
        style="width: 100%" size="small" tooltip-effect="light" height="100%" @select-all="handleSelectionChangeAll"
        :header-cell-style=" { background: '#F5F6FA', color: '#000000BF', 'font-size': '14px', height: '50px' } "
        :row-style=" { height: '50px' } " :cell-style=" { 'font-size': '14px' } ">
        <el-table-column type="selection" :selectable=" selectable " :reserve-selection=" true " width="150"
          v-if=" multiple "></el-table-column>
        <el-table-column align="center" width="150" label="选择" v-else>
          <template slot-scope="scope">
            <el-radio class="radio" v-model=" templateSelection " :label=" scope.row "
              @change=" handleSelectionChange([scope.row]) ">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="节点id" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.id||'--' }}</template>
        </el-table-column>
        <el-table-column prop="name" label="节点名称" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.name||'--' }}</template>
        </el-table-column>
        <el-table-column prop="type" label="节点类型" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.typeName ||'--' }}</template>
        </el-table-column>
      </el-table>
    </div>
  </w-dialog-for-org-picker>
</template>

<script>
import WDialogForOrgPicker from './WDialogForOrgPicker.vue'
import _ from "lodash";
import TreeSelect from './TreeSelect.vue';
import { deptList } from '../../api/ouaa'
export default {
  name: "OrgPicker",
  components: { WDialogForOrgPicker, TreeSelect },
  props: {
    title: {
      default: "请选择",
      type: String,
    },
    type: {
      default: "getStaffList", //org选择部门/人员  user-选人  dept-选部门 role-选角色 post-选职位
      type: String,
    },
    multiple: {
      //是否多选
      default: true,
      type: Boolean,
    },
    selected: {
      default: () => {
        return [];
      },
      type: Array,
    },
    dataSource: {
      default: () => {
        return [];
      },
      type: Array,
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      nowDeptId: null,
      isIndeterminate: false,
      searchUsers: [],
      nodes: [],
      select: [],
      search: "",
      deptStack: [],
      //2023年2月10日 16点45分 选择人员弹窗改造
      formInline: {
        status: null,
        name: null,
        organizationId: undefined
      },
      statusList: [],
      tableData: [],//表格数据存放
      page: 1,
      pageSize: 10,
      pageCount: 0,
      total: 0,
      max: 20, //最多勾选20,
      templateSelection: null,
      deptSelectOptions: [],//部门treeSelect数据
    };
  },
  methods: {
    show() {
      this.visible = true;
      this.init();
    },
    selectToLeft() {
      let nodes = this.search.trim() === "" ? this.nodes : this.searchUsers;
      nodes.forEach(node => {
        for (let i = 0; i < this.select.length; i++) {
          if (this.select[i].id === node.id) {
            node.selected = true;
            break;
          } else {
            node.selected = false;
          }
        }
      });
    },

    recover() {
      this.select = [];
      this.nodes.forEach(nd => (nd.selected = false));
    },
    selectOk() {
      this.$emit(
        "ok",
        Object.assign(
          [],
          this.select
        ),
      );
      this.visible = false;
      this.recover();
    },
    close() {
      this.$emit("close");
      this.recover();
    },
    init() {
      this.nowDeptId = null;
      this.deptStack = [];
      this.nodes = [];
      this.select = _.cloneDeep(this.selected);
      this.tableData = [];
      this.page = 1;
      this.pageSize = 10;
      this.dataSource.forEach(row => {
        const findIndex = this.select.findIndex(e => e.id === row.id)
        if (findIndex !== -1) this.templateSelection = row
      });
      this.formInline = {
        status: null,
        name: null,
        organizationId: undefined
      };
      this.selectToLeft();
    },

    //2023年2月13日 09点16分 基于样式功能形式大调整改造
    getRowKey(row) {
      return row.id;
    },
    handleSelectionChangeAll(selectRows) {
      if (selectRows.length) {
        const res = selectRows.filter(e => !this.select.find(ele => ele.id === e.id))
        this.select = [...this.select, ...res]
      } else {
        this.select = this.select.filter(e => !this.dataSource.find(ele => ele.id === e.id))
      }
    },
    //真实分页用
    handleSelectionChangePage(selectRows, row) {
      const findIndex = this.select.findIndex(e => e.id === row.id)
      if (findIndex === -1) {
        this.select.push(row)
      } else {
        this.select.splice(findIndex, 1)
      }
    },
    //假分页用
    handleSelectionChange(list) {
      const arr = []
      list.forEach(e => {
        if (arr.findIndex(ele => ele.id === e.id) === -1) {
          arr.push(e)
        }
      })
      if (arr.length > this.max) {
        this.$refs.nodeTableRef.clearSelection();
        for (let i = 0; i < this.max; i++) {
          this.$refs.nodeTableRef.toggleRowSelection(arr[i]);
        }
        return;
      }
      this.select = [...arr];
    },
    // 判断复选框是否可以选择
    selectable(row) {
      if (this.tableData.length === 0) {
        return true;
      }
      let index = this.select.findIndex((v) => v.id === row.id);
      return this.select.length >= this.max ? (index !== -1 ? true : false) : true;
    },
  },
};
</script>

<style lang="less" scoped>
@containWidth: 278px;

.candidate,
.selected {
  position: absolute;
  display: inline-block;
  width: @containWidth;
  height: 400px;
  border: 1px solid #e8e8e8;
}

.picker {
  display: none;
  height: 402px;
  position: relative;
  text-align: left;

  .candidate {
    left: 0;
    top: 0;

    .role-header {
      padding: 10px !important;
      margin-bottom: 5px;
      border-bottom: 1px solid #e8e8e8;
    }

    .top-dept {
      margin-left: 20px;
      cursor: pointer;
      color: #38adff;
    }

    .next-dept {
      float: right;
      color: @primary-color;
      cursor: pointer;
    }

    .next-dept-disable {
      float: right;
      color: #8c8c8c;
      cursor: not-allowed;
    }

    &>div:first-child {
      padding: 5px 10px;
    }
  }

  .selected {
    right: 0;
    top: 0;
  }

  .org-items {
    overflow-y: auto;
    height: 310px;

    .el-icon-close {
      position: absolute;
      right: 5px;
      cursor: pointer;
      font-size: larger;
      top: 0;
    }

    .org-dept-item {
      padding: 10px 5px;

      &>div {
        display: inline-block;

        &>span:last-child {
          position: absolute;
          right: 5px;
        }
      }
    }

    .org-role-item {
      display: flex;
      align-items: center;
      padding: 10px 5px;
    }

    /deep/ .org-user-item {
      display: flex;
      align-items: center;
      padding: 5px;

      &>div {
        display: inline-block;
      }

      .avatar {
        width: 35px;
        text-align: center;
        line-height: 35px;
        background: @primary-color;
        color: white;
        border-radius: 50%;
      }
    }

    /deep/ .org-item {
      margin: 0 5px;
      border-radius: 5px;
      position: relative;

      .el-checkbox {
        margin-right: 10px;
      }

      .name {
        margin-left: 5px;
      }

      &:hover {
        background: #f1f1f1;
      }
    }
  }
}

.selected {
  border-left: none;

  .count {
    width: calc(@containWidth - 20px);
    padding: 10px;
    display: inline-block;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 5px;

    &>span:nth-child(2) {
      float: right;
      color: #c75450;
      cursor: pointer;
    }
  }
}


.disabled {
  cursor: not-allowed !important;
  color: #8c8c8c !important;
}

::-webkit-scrollbar {
  float: right;
  width: 4px;
  height: 4px;
  background-color: white;
}

::-webkit-scrollbar-thumb {
  border-radius: 16px;
  background-color: #efefef;
}

//搜索区域
.serach-area {
  .el-form-item {
    margin-bottom: 16px;
    display: inline-flex;
    align-items: center;
  }
}

.table-area {
  height: calc(100% - 96.5px);

  .el-table.el-table::before {
    display: none;
  }

  .el-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  /deep/ .el-pagination__sizes {
    margin-right: 0;
  }

  /deep/ .el-pagination.is-background .btn-next,
  .el-pagination.is-background .btn-prev,
  /deep/ .el-pagination.is-background .el-pager li {
    background: white;
    color: #000000d9;
    border: 1px solid #d9d9d9;
    font-weight: normal;

  }

  /deep/ .el-pagination.is-background .btn-next,
  /deep/.el-pagination.is-background .btn-prev,
  /deep/.el-pagination.is-background .el-pager li {
    background: white;
    border: 1px solid #d9d9d9;
  }

  /deep/.el-table__body-wrapper::-webkit-scrollbar {
    width: 6px;
    height: 8px;
    background-color: #00000000;
  }

  /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
    border-radius: 2px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #a8a8a8;
  }

  //宽度问题解决，关键部分
  /deep/ .el-table colgroup col[name='gutter'] {
    width: 6px;
  }

  /deep/ .el-table__header-wrapper .el-checkbox__input {
    margin-left: 4px;

    &:after {
      content: '全选';
      position: absolute;
      margin-left: 5px;
    }
  }
}
</style>
<style lang="less">
.is-light {
  border: none !important;
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;

  .popper__arrow {
    border-bottom-color: #ffffff !important;
    border-top-color: #ffffff !important;

    &::after {
      border-bottom-color: #ffffff;
      border-top-color: #ffffff;
    }
  }
}
</style>

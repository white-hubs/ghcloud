<template>
  <div class="flow-form">
    <g-layout title="表单管理">
      <template #header-btn>
        <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
      </template>
      <template #content-search>
        <el-form :inline="true" :model="formInline" size="small">
          <el-form-item label="应用">
            <el-select v-model="formInline.application" clearable filterable placeholder="请选择">
              <el-option v-for="item in applications" :key="item.code" :label="item.name" :value="item.code"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="formInline.status" clearable placeholder="请选择">
              <el-option v-for="item in statusList" :key="item.value" :label="item.name" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="formInline.keyword" clearable placeholder="请输入表单名称" @keyup.enter.native="onSearch"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #content-table>
        <el-table :data="tableData" style="width: 100%" size="small" :height="tableHeight" v-if="tableHeight" v-loading="loading">
          <el-table-column prop="name" label="名称"> </el-table-column>
          <el-table-column prop="typeName" label="类型"> </el-table-column>
          <el-table-column prop="applicationName" label="应用">
            <template slot-scope="scope">
              <template v-if="scope.row.applicationName">{{ scope.row.applicationName }}</template>
              <template v-else>{{ getApplicationName(scope.row.application) }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="说明" width="300px"> </el-table-column>
          <el-table-column prop="updateTime" label="最后更新"> </el-table-column>
          <el-table-column prop="statusName" label="状态"> </el-table-column>
          <el-table-column prop="address" label="开关">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.enable" active-color="#13ce66" inactive-color="#ff4949" @change="changeStatus(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="130">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
              <el-button
                v-show="scope.row.publicForm && scope.row.status === 'IN_USE'"
                @click="handleShare(scope.row)"
                type="text"
                size="small"
                >分享</el-button
              >
              <el-popconfirm title="是否删除当前数据？" @confirm="handleDelete(scope.row)">
                <el-button slot="reference" type="text" size="small" class="text-danger">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer-page>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page.pageNumber"
          :page-sizes="[10, 20, 50]"
          :page-size="page.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="page.total"
        >
        </el-pagination>
      </template>
    </g-layout>
    <el-dialog title="新增表单" :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-form-inline" label-width="90px">
        <el-form-item label="表单类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="分享" :visible.sync="shareVisible" width="800px">
      <p>保存二维码或复制链接分享给外部人员填写</p>
      <div style="display: flex; align-items: flex-start; flex-direction: column">
        <el-button class="copy-btn" type="primary" @click="handleCopy('QrCode')">保存二维码</el-button>
        <img style="border: 1px solid #606266; margin: 10px 0px" :src="shareData.code" alt="" />
      </div>
      <el-divider />
      <div style="display: flex; align-items: flex-start; flex-direction: column">
        <el-button type="primary" class="copy-btn" @click="handleCopy('URL')">复制链接</el-button>
        <span id="copy-text" style="margin-top: 10px">{{ shareData.url }}</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";

import { getNowEnterprise } from "@/utils/auth.js";
import { copyImage } from "@/utils/copy.js";
export default {
  components: {},
  data() {
    return {
      btnCopy: "",
      typeList: [],
      applications: [],
      statusList: [],
      tableData: [],
      formInline: {
        keyword: "",
        type: "",
        status: "",
        application: "",
      },
      ruleForm: {
        type: "FLOW_FORM",
      },
      shareData: {
        url: "",
        code: "",
      },
      rules: {
        type: [{ required: true, message: "请选择表单类型", trigger: "change" }],
      },
      page: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      dialogFormVisible: false,
      shareVisible: false,
      tableHeight: 0,
      loading: true,
    };
  },
  mounted() {
    this.getSelect();
    this.getData();
    this.tableHeight = document.querySelector(".content-table")?.offsetHeight ?? 400;
  },
  computed: {
    getApplicationName() {
      return function (code) {
        const findIndex = this.applications.findIndex((e) => e.code === code);
        if (findIndex === -1) {
          return "";
        }
        return this.applications[findIndex].name;
      };
    },
  },
  methods: {
    getData() {
      this.loading = true;
      this.$api
        .getFormflowPage({
          ...this.formInline,
          ...this.page,
        })
        .then((res) => {
          this.loading = false;
          this.tableData = res.records.map((item) => {
            return {
              ...item,
              updateTime: item.updateTime ? moment(item.updateTime).format("yyyy-MM-DD HH:mm:ss") : "--",
            };
          });
          this.page.total = res.total;
        });
    },
    getSelect() {
      this.$api.getFormflowTypeList().then((res) => {
        this.typeList = res;
      });
      this.$api.getFormflowStatusList().then((res) => {
        this.statusList = res;
      });
      this.$api.getFormflowApplicationList().then((res) => {
        this.applications = res;
      });
    },
    onSearch() {
      this.page.pageNumber = 1;
      this.getData();
    },
    onReset() {
      this.formInline = {
        keyword: "",
        type: "",
        status: "",
        application: "",
      };
      this.page.pageNumber = 1;
      this.getData();
    },
    handleClick(row) {
      this.$router.push("/admin/design?type=" + row.type + "&id=" + row.id);
    },
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getData();
    },
    handleCurrentChange(val) {
      this.page.pageNumber = val;
      this.getData();
    },
    //点击新增
    handleAdd() {
      this.dialogFormVisible = true;
    },
    //保存新增
    handleSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$router.push("/admin/design?type=" + this.ruleForm.type);
        } else {
          return false;
        }
      });
    },
    //改变状态
    changeStatus(item) {
      let text = item.enable ? "启用" : "停用";
      this.$confirm(`是否${text}该表单？`, "请再次确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let enable = item.enable;
          this.$api
            .putEnable({
              id: item.id,
              enable: enable,
            })
            .then((res) => {
              this.getData();
              this.$message.success(text + "成功");
            })
            .catch(() => {
              item.enable = !item.enable;
            });
        })
        .catch(() => {
          item.enable = !item.enable;
        });
    },
    //删除数据
    handleDelete(row) {
      this.$api.deleteFormflow(row).then((res) => {
        this.getData();
        this.$message.success("操作成功");
      });
    },
    //点击分享
    async handleShare(row) {
      const { qrCodeUrl, businessType, id } = row;
      this.shareData.url = `${qrCodeUrl}&businessType=${businessType}&tenant=${getNowEnterprise().code}` ?? "";
      const { path } = await this.$api.getQrCode({
        tenant: getNowEnterprise().code,
        id,
        qrCodeUrl: this.shareData.url,
        businessType,
      });
      this.shareData.code = path ?? "";
      this.shareVisible = true;
    },
    //复制
    handleCopy(type) {
      // TODO-migrate: 第二次遇到时抽为工具函数
      if (type === "URL") {
        //复制链接
        const copyText = document.querySelector("#copy-text");
        const text = copyText.textContent;
        if (location.protocol === "https:" && navigator.clipboard) {
          navigator.clipboard.writeText(text);
        } else {
          const tempCopyEl = document.createElement("textarea");
          tempCopyEl.value = text;
          tempCopyEl.style.position = "fixed";
          tempCopyEl.style.height = 0;
          tempCopyEl.style.width = 0;
          tempCopyEl.style.opacity = 0;
          tempCopyEl.style.top = 0;
          document.body.appendChild(tempCopyEl);
          tempCopyEl.select();
          document.execCommand("copy");
          document.body.removeChild(tempCopyEl);
        }
      } else {
        //复制和下载图片
        const a = document.createElement("a");
        a.href = this.shareData.code;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        copyImage(this.shareData.code);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.copy-btn {
  width: 110px;
}

.text-danger {
  color: #ff4d4f !important;
  margin-left: 10px;
}

.flow-form {
  height: 100%;
  width: 100%;
}

/deep/ ::-webkit-scrollbar {
  width: 1px;
  /*滚动条宽度*/
  height: 1px;
  /*滚动条高度*/
}

/deep/ ::-webkit-scrollbar-thumb {
  border-radius: 4px;
  /*滚动条的圆角*/
  background-color: rgba(60, 60, 60, 0.5);
  /*滚动条的背景颜色*/
}
</style>

<template>
  <div class="base-setup" @click="showIconSelect = false">
    <el-form ref="baseSetting" :model="setup" label-position="top" label-width="80px">
      <g-vertical-line title="基本信息"></g-vertical-line>
      <el-form-item label="表单名称" :rules="getFormNameRule()" prop="formName">
        <el-input
          v-model="setup.formName"
          size="medium"
          maxlength="20"
          show-word-limit
          @blur="setup.formName = $event.target.value.trim()"
        ></el-input>
      </el-form-item>
      <el-form-item label="表单分组" :rules="getRule('表单分组', 'change')" class="group" prop="formGroupId">
        <el-select v-model="setup.formGroupId" placeholder="表单分组" size="medium">
          <el-option v-for="(op, index) in fromGroup" :key="op.id" :label="op.name" :value="op.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="表单简称" :rules="getFormNameRule()" prop="shortName">
        <el-input
          v-model="setup.shortName"
          size="medium"
          maxlength="20"
          show-word-limit
          @blur="setup.shortName = $event.target.value.trim()"
        ></el-input>
      </el-form-item>
      <el-form-item label="谁可以使用" :rules="getRule('请选择谁可以使用')" prop="permissionType">
        <el-radio-group v-model="setup.permissionType">
          <el-radio v-for="t in permissionTypeList" :label="t.type" :key="t.type" @change="onChangePermissionType" :disabled="t.disabled">
            {{ t.name }}
            <el-tooltip popper-class="tooltips-style" effect="light" :content="t.tips" placement="top-start" v-if="t.tips">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <div v-if="setup.permissionType === 'USER'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser" round>选择人员</el-button>
          <org-items v-model="orgPickerSelected" />
        </div>
        <div v-else-if="setup.permissionType === 'ROLE'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectRole" round>选择角色</el-button>
          <org-items v-model="orgPickerSelected" />
        </div>
        <div v-else-if="setup.permissionType === 'DEPARTMENT'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectDept" round>选择部门</el-button>
          <org-items v-model="orgPickerSelected" />
        </div>
      </el-form-item>
      <el-form-item label="表单说明">
        <el-input
          placeholder="请输入表单说明"
          v-model="setup.remark"
          type="textarea"
          show-word-limit
          :autosize="{ minRows: 2, maxRows: 5 }"
          maxlength="200"
          class="textarea-box"
        ></el-input>
      </el-form-item>
      <g-vertical-line title="配置信息" style="margin: 20px 0"></g-vertical-line>
      <div class="config-info">
        <div class="card">
          <div class="top">
            <span>自动去重</span>
            <el-switch v-model="setup.autoRemoveDuplication"></el-switch>
          </div>
          <span>审批流程中审批人重复出现时，只需审批审批一次其余自动通过</span>
        </div>
        <div class="card">
          <div class="top">
            <span>自动通过打印展示</span>
            <el-switch v-model="setup.autoApprovalPrinting"></el-switch>
          </div>
          <span>用于配置流程节点展示，开启后打印时会带出自动通过的相关信息</span>
        </div>
        <div class="card">
          <div class="top">
            <span>公开表单</span>
            <el-switch v-model="setup.publicForm" :disabled="this.$store.state.isPublicForm"></el-switch>
          </div>
          <span>开启后表单可分享给外部人员，用于外部人员发起工单。</span>
        </div>
      </div>
      <el-collapse style="margin: 20px 0">
        <el-collapse-item name="1">
          <template slot="title">
            <g-vertical-line title="高级功能" style="margin: 20px 0"></g-vertical-line>
          </template>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>WebHooks</span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="openWebHooksModal(-1)">新增一项</el-button>
            </div>
            <el-row
              :gutter="20"
              class="webhooks-item-form-item"
              v-for="(item, index) in setup.webhookConfigVOList"
              :key="'webhooks-' + index"
            >
              <el-col :span="20">
                <span class="webhook-title">{{ item.url }}</span>
              </el-col>
              <el-col :span="4" style="display: flex; justify-content: flex-end; padding: 0">
                <el-button-group>
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="openWebHooksModal(index)"></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="setup.webhookConfigVOList.splice(index, 1)"
                  ></el-button>
                </el-button-group>
              </el-col>
            </el-row>
            <el-empty
              description="暂无webHooks配置，请点击新增按钮新增一项"
              v-if="!setup.webhookConfigVOList || setup.webhookConfigVOList.length === 0"
            ></el-empty>
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <el-dialog :title="webHooksIndex !== -1 ? '修改' : '新增'" :visible.sync="webHooksDialogVisible" width="50%">
      <el-form
        label-position="top"
        :model="webHooksForm"
        ref="webHooksForm"
        :rules="{
          url: [{ required: true, message: '请输入URL' }],
          triggerNode: [{ required: true, message: '请选择触发来源' }],
        }"
      >
        <el-form-item label="URL" prop="url">
          <el-input size="medium" placeholder="请输入URL" v-model="webHooksForm.url"></el-input>
        </el-form-item>
        <el-form-item label="TOKEN">
          <el-input size="medium" placeholder="请输入TOKEN(非必填)" v-model="webHooksForm.token"></el-input>
        </el-form-item>
        <el-form-item label="触发来源" prop="triggerNode">
          <el-checkbox-group v-model="webHooksForm.triggerNode">
            <el-checkbox label="FLOW_END">流程结束</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="webHooksDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="webHooksConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <org-picker
      title="请选择人员"
      :multiple="multiple"
      :type="orgPickerType"
      ref="orgPicker"
      :selected="orgPickerSelected"
      @ok="selected"
      @close="closed"
    />
  </div>
</template>

<script>
import OrgItems from "../../common/process/OrgItems.vue";
import { updateGroup } from "@/api/design";
import OrgPicker from "@/components/common/OrgPicker";

export default {
  name: "FormBaseSetting",
  components: { OrgPicker, OrgItems },
  data() {
    return {
      nowUserSelect: null,
      showIconSelect: false,
      select: [],
      newGroup: "",
      fromGroup: [],
      orgPickerType: "getStaffList",
      orgPickerSelected: [],
      rules: {
        formName: [{}],
        formGroupId: [],
        shortName: [{}],
      },
      webHooksDialogVisible: false,
      webHooksIndex: -1,
      webHooksForm: {
        url: "",
        token: "",
        triggerNode: [],
      },
      validateFormName: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入表单名称"));
        } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
          callback(new Error("仅支持中文英文和数字"));
        } else {
          callback();
        }
      },
    };
  },
  computed: {
    setup() {
      return this.$store.state.design;
    },
    permissionTypeList() {
      const list = [
        { type: "ALL", name: "所有用户", disabled: false },
        { type: "USER", name: "指定用户", disabled: false },
        { type: "ROLE", name: "指定角色", disabled: false },
        { type: "DEPARTMENT", name: "指定部门", disabled: false },
      ];
      return list;
    },
    multiple() {
      switch (this.orgPickerType) {
        case "getStaffList":
          return true;
        case "getRoles":
          return true;
        case "deptList":
          return true;
        default:
          return true;
      }
    },
  },
  watch: {
    orgPickerSelected: {
      handler(newVal) {
        this.setup.permissionIds = newVal.map((x) => x.id);
      },
      deep: true,
    },
    // 监听 setup 数据变化，当数据加载完成后初始化
    "setup.permissionList"(val) {
      if (this.setup.permissionList && this.setup.permissionList?.length > 0) {
        this.$nextTick(() => {
          this.initOrgPickerSelected();
        });
      }
    },
  },
  mounted() {
    this.getGroups();
  },
  methods: {
    getRule(msg, trigger = "blur") {
      return [{ required: true, message: msg, trigger: trigger }];
    },
    getFormNameRule() {
      return [{ required: true, trigger: "change", validator: this.validateFormName }];
    },
    initOrgPickerSelected() {
      if (this.setup.permissionList && this.setup.permissionList.length > 0) {
        this.orgPickerSelected.length = 0;
        this.setup.permissionList.forEach((val) => this.orgPickerSelected.push(val));
      }
    },
    getGroups() {
      this.$api
        .getFormFlowGroupList({
          application: this.getApplicationCode(),
        })
        .then((res) => {
          this.fromGroup = res;
        });
    },
    getApplicationCode() {
      try {
        const application = JSON.parse(sessionStorage.getItem("GH-currentApplication"));
        return application?.code;
      } catch (e) {
        return undefined;
      }
    },
    addGroup() {
      if (this.newGroup.trim() !== "") {
        updateGroup({ name: this.newGroup.trim() }, "post")
          .then((rsp) => {
            this.$message.success(rsp.data);
            this.getGroups();
          })
          .catch((err) => this.$message.error(err.response.data));
      }
    },
    openWebHooksModal(webHooksIndex = -1) {
      this.webHooksIndex = webHooksIndex;
      setTimeout(() => {
        this.$refs["webHooksForm"].clearValidate();
      }, 0);
      if (webHooksIndex === -1) {
        this.webHooksForm = {
          url: "",
          token: "",
          triggerNode: ["FLOW_END"],
        };
      } else {
        this.webHooksForm = {
          ...this.setup.webhookConfigVOList[webHooksIndex],
          triggerNode: this.setup.webhookConfigVOList[webHooksIndex].triggerNode.split(","),
        };
      }
      this.webHooksDialogVisible = true;
    },
    async webHooksConfirm() {
      this.$refs["webHooksForm"].validate(async (valid) => {
        if (!valid) {
          return;
        }
        const res = { ...this.webHooksForm, triggerNode: this.webHooksForm.triggerNode.join(",") };
        if (this.webHooksIndex === -1) {
          this.setup.webhookConfigVOList.push(res);
        } else {
          this.$set(this.setup.webhookConfigVOList, this.webHooksIndex, res);
        }
        this.webHooksDialogVisible = false;
        this.webHooksIndex = -1;
      });
    },
    validate() {
      this.$refs.baseSetting.validate();
      let err = [];
      if (this.setup.publicForm && this.setup.formItems.findIndex((x) => x.name === "OutsiderConcat") === -1) {
        err.push("公开表单必须设置外部联系人组件");
      }
      if (!this.$isNotEmpty(this.setup.formName)) {
        err.push("表单名称未设置");
      }
      if (!this.$isNotEmpty(this.setup.formGroupId)) {
        err.push("表单分组未设置");
      }
      if (!this.$isNotEmpty(this.setup.shortName)) {
        err.push("表单简称未设置");
      }
      if (!this.$isNotEmpty(this.setup.permissionType)) {
        err.push("请选择谁可以使用");
      }
      if (this.setup.permissionType === "USER" && this.setup.permissionIds.length === 0) {
        err.push("请选择可以使用的用户");
      }
      if (this.setup.permissionType === "ROLE" && this.setup.permissionIds.length === 0) {
        err.push("请选择可以使用的角色");
      }
      if (this.setup.permissionType === "DEPARTMENT" && this.setup.permissionIds.length === 0) {
        err.push("请选择可以使用的部门");
      }
      return err;
    },
    onChangePermissionType(type) {
      this.orgPickerSelected = [];
      this.setup.permissionIds = [];
    },
    selectUser() {
      this.orgPickerType = "getStaffList";
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selectRole() {
      this.orgPickerType = "getRoles";
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selectDept() {
      this.orgPickerType = "deptList";
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selected(select) {
      this.orgPickerSelected.length = 0;
      this.orgPickerSelected.reverse();
      select.forEach((val) => this.orgPickerSelected.push(val));
    },
    closed() {},
  },
};
</script>

<style lang="less" scoped>
/deep/ .el-select-dropdown {
  display: none;
}

.icon-select {
  display: flex;
  flex-wrap: wrap;

  i {
    cursor: pointer;
    font-size: large;
    padding: 10px;
    max-width: 38px !important;

    &:hover {
      box-shadow: 0 0 10px 2px #c2c2c2;
    }
  }
}

/deep/ .select-u {
  width: 100%;
}

.base-setup {
  overflow: auto;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-sizing: border-box;
  padding: 15px 300px;

  i:first-child {
    position: relative;
    cursor: pointer;
    font-size: xx-large;
    color: #ffffff;
    border-radius: 10px;
    padding: 10px;
  }

  .change-icon {
    margin-left: 20px;

    span {
      font-size: small;
      color: #7a7a7a;
      margin-right: 15px;
    }

    i {
      cursor: pointer;
      color: #7a7a7a;
      font-size: x-large;
    }
  }

  /deep/ .el-form-item__label {
    padding: 0;
    font-weight: bold;
  }

  /deep/ .el-form-item {
    margin-bottom: 5px;
  }
}

/deep/ .group {
  .el-select {
    width: 100%;
  }

  .el-button {
    margin-left: 10px;
    width: 120px;
  }
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background-color: #f8f8f8;
}

::-webkit-scrollbar-thumb {
  border-radius: 16px;
  background-color: #e8e8e8;
}

/deep/ .textarea-box {
  .el-input__count {
    background-color: transparent;
    bottom: -27px;
  }
}

.config-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.card {
  box-sizing: border-box;
  padding: 8px 10px;
  width: 200px;
  height: 112px;
  font-size: 13px;
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  color: #999999;
  margin-right: 20px;

  .top {
    display: flex;
    font-size: 14px;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
    color: black;
  }
}

.el-collapse {
  border: 0;
}
/deep/ .el-collapse-item__wrap {
  border: 0 !important;
}

.webhooks-item-form-item {
  position: relative;
  margin: 0 !important;
  margin-bottom: 10px !important;

  .webhook-title {
    font-weight: bold;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    display: block;
    text-overflow: ellipsis;
  }
}
</style>

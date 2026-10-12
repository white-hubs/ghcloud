<template>
  <el-container style="height: 100%">
    <el-header style="background: white">
      <layout-header v-model="activeSelect" @publish="publishProcess" @preview="preview"></layout-header>
    </el-header>
    <div class="layout-body">
      <work-order-form-base-setting ref="baseSetting" v-show="activeSelect === 'baseSetting'" />
      <form-design ref="formSetting" v-show="activeSelect === 'formSetting'" :allowedGroupIds="allowedGroupIds" />
      <process-design ref="processDesign" v-show="activeSelect === 'processDesign'" />
    </div>
    <w-dialog :showFooter="false" v-model="validVisible" title="设置项检查">
      <el-steps align-center :active="validStep" finish-status="success">
        <el-step
          v-for="(step, i) in validOptions"
          :title="step.title"
          :key="i"
          :icon="step.icon"
          :status="step.status"
          :description="step.description"
        />
      </el-steps>
      <el-result :icon="validIcon" :title="errTitle" :subTitle="validResult.desc">
        <i slot="icon" style="font-size: 30px" v-if="!validResult.finished" class="el-icon-loading"></i>
        <div slot="subTitle" class="err-info" v-if="validResult.errs.length > 0">
          <!-- <el-tooltip class="item" effect="dark" :content="err" placement="top">
          </el-tooltip> -->
          <el-tooltip effect="dark" placement="top" v-for="(err, i) in validResult.errs" :key="i + '_err'" :content="err">
            <ellipsis hover-tip :content="err">
              <i slot="pre" class="el-icon-warning-outline"></i>
            </ellipsis>
          </el-tooltip>
        </div>
        <template slot="extra">
          <el-button type="primary" :loading="publishing" v-if="validResult.finished" size="medium" @click="doAfter">
            {{ validResult.action }}
          </el-button>
        </template>
      </el-result>
    </w-dialog>
  </el-container>
</template>

<script>
import _ from "lodash";

import DefaultProps from "./layout/process/DefaultNodeProps";
import LayoutHeader from "./LayoutHeader";
import FormDesign from "@/views/admin/layout/FormDesign";
import FormProSetting from "@/views/admin/layout/FormProSetting";
import ProcessDesign from "@/views/admin/layout/ProcessDesign";
import WorkOrderFormBaseSetting from "@/views/admin/layout/WorkOrderFormBaseSetting";
export default {
  name: "WorkOrderFormProcessDesign",
  components: {
    LayoutHeader,
    WorkOrderFormBaseSetting,
    FormDesign,
    ProcessDesign,
    FormProSetting,
  },
  data() {
    return {
      isNew: true,
      validStep: 0,
      timer: null,
      activeSelect: "baseSetting",
      validVisible: false,
      validResult: {},
      validOptions: [
        { title: "基础信息", description: "", icon: "", status: "" },
        { title: "审批表单", description: "", icon: "", status: "" },
        { title: "审批流程", description: "", icon: "", status: "" },
      ],
      validComponents: ["baseSetting", "formSetting", "processDesign"],
      publishing: false,
    };
  },
  computed: {
    setup() {
      return this.$store.state.design;
    },
    errTitle() {
      if (this.validResult.finished && !this.validResult.success) {
        return this.validResult.title + ` (${this.validResult.errs.length}项错误) 😥`;
      }
      return this.validResult.title;
    },
    validIcon() {
      if (!this.validResult.finished) {
        return "el-icon-loading";
      } else if (this.validResult.success) {
        return "success";
      } else {
        return "warning";
      }
    },
    currentApplication() {
      try {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication")) || {};
      } catch (e) {
        return {};
      }
    },
    allowedGroupIds() {
      const ids = ["base"];
      if (this.currentApplication.code === "WORK_PERMIT_MANAGE" || this.currentApplication.name === "作业管理") {
        ids.push("WORK_PERMIT");
      }
      return ids;
    },
  },
  created() {
    this.showValiding();
    let formId = this.$route.query.id;
    //判断传参，决定是新建还是加载原始数据
    this.loadInitFrom();
    if (this.$isNotEmpty(formId)) {
      this.isNew = false;
      this.loadFormInfo(formId);
    }
    let group = this.$route.query.group;
    this.setup.formGroupId = this.$isNotEmpty(group) ? parseInt(group) : null;
    /*发布时的验证信息*/
    switch (this.$route.query.type) {
      case "FORM":
        this.validOptions = [
          { title: "基础信息", description: "", icon: "", status: "" },
          { title: "审批表单", description: "", icon: "", status: "" },
        ];
        this.validComponents = ["baseSetting", "formSetting"];
        break;
      case "FLOW":
        this.validOptions = [
          { title: "基础信息", description: "", icon: "", status: "" },
          { title: "审批流程", description: "", icon: "", status: "" },
        ];
        this.validComponents = ["baseSetting", "processDesign"];
        break;
      case "FLOW_FORM":
      case "CUSTOM_FORM":
        this.validOptions = [
          { title: "基础信息", description: "", icon: "", status: "" },
          { title: "审批表单", description: "", icon: "", status: "" },
          { title: "审批流程", description: "", icon: "", status: "" },
        ];
        this.validComponents = ["baseSetting", "formSetting", "processDesign"];
        break;
      default:
        break;
    }
  },
  beforeDestroy() {
    this.stopTimer();
  },
  methods: {
    loadFormInfo(formId) {
      this.$api.getCustomFormFlow({ id: formId }).then((res) => {
        let processObj = res.flowJson ? JSON.parse(res.flowJson) : null;
        function repairNodeProps(process) {
          // 根据默认的DefaultProps 修复老数据没有个别字段的问题
          if (process.type === "APPROVAL") {
            checkData(process.props, DefaultProps.APPROVAL_PROPS);
            if (!process.props.nobody.handler) {
              //存在必填项，默认改为指定人员审批
              const formRequired =
                process?.props?.formPerms && process.props.formPerms.some((x) => x?.perm === "E" && x?.required === true);
              const outerFormRequired =
                process?.props?.outerFormPerms && process.props.outerFormPerms.some((x) => x?.perm === "E" && x?.required === true);
              if (formRequired || outerFormRequired) {
                process.props.nobody.handler = "TO_USER";
              }
            }
          }
          if (process.children && Object.keys(process.children).length > 0) {
            repairNodeProps(process.children);
          }
          if (process.branchs && process.branchs.length > 0) {
            for (let index = 0; index < process.branchs.length; index++) {
              repairNodeProps(process.branchs[index]);
            }
          }
          // //为旧数据添加外部人员权限表单
          if (process.type === "APPROVAL" || process.type === "ROOT") {
            const forms = res.formJson ? JSON.parse(res.formJson) : [];
            //如果没有外部权限，把内部的复制给外部
            if (!process.props?.outerFormPerms || process.props?.outerFormPerms.length === 0) {
              process.props.outerFormPerms = [];
              forms.forEach((x) => {
                process.props.outerFormPerms.push({
                  id: x.id,
                  perm: "E",
                  required: x.props.required,
                  title: x.title,
                });
              });
            }
            //内部权限列表赋值
            process.props.formPerms = setPermissionList(process.props.formPerms);
            //外部权限列表赋值
            process.props.outerFormPerms = setPermissionList(process.props.outerFormPerms);
          }
          if (process.type === "APPROVAL" || process.type === "ROOT" || process.type === "CC") {
            //为旧数据添加按钮别名表单
            if (!process.props?.operateAlias) {
              process.type === "ROOT" && (process.props.operateAlias = DefaultProps.ROOT_PROPS.operateAlias);
              process.type === "CC" && (process.props.operateAlias = DefaultProps.CC_PROPS.operateAlias);
              process.type === "APPROVAL" && (process.props.operateAlias = DefaultProps.APPROVAL_PROPS.operateAlias);
            }
          }
        }
        function checkData(orginData, defaultData) {
          for (const key in defaultData) {
            const element = defaultData[key];
            if (typeof orginData[key] === "undefined") {
              orginData[key] = _.cloneDeep(element);
            }
            //对象深度检查
            if (orginData[key] && typeof element === "object" && !Array.isArray(element)) {
              checkData(orginData[key], element);
            }
          }
        }
        //设置权限列表的数据（兼容旧数据）
        function setPermissionList(perms) {
          const forms = res.formJson ? JSON.parse(res.formJson) : [];
          let length = 0;

          forms.forEach((x) => {
            if (x.name === "GroupList" && x.props.items && x.props.items?.length > 0) {
              length += x.props.items?.length;
            } else {
              length += 1;
            }
          });
          if (perms.length !== length) {
            perms = [];
            forms.forEach((x) => {
              if (x.name === "GroupList" && x.props.items && x.props.items?.length > 0) {
                x.props.items.forEach((i) => {
                  perms.push({
                    id: i.id,
                    perm: "E",
                    required: i.props.required,
                    title: i.title,
                  });
                });
              } else {
                perms.push({
                  id: x.id,
                  perm: "E",
                  required: x.props.required,
                  title: x.title,
                });
              }
            });
          }
          return perms;
        }
        repairNodeProps(processObj);
        //给旧数据增加closeAddChild属性
        const forms = res.formJson ? JSON.parse(res.formJson) : [];
        forms.forEach((x) => {
          if (x.name === "GroupList" && x.props.closeAddChild === undefined) {
            x.props.closeAddChild = true;
          }
        });
        let form = {
          formItems: forms ?? [],
          process: processObj,
          enable: res.enable,
          businessType: res.businessType,
          formGroupId: res.formGroupId,
          remark: res.remark,
          formName: res.name,
          shortName: res.shortName,
          permissionType: res.permissionType,
          permissionIds: res.permissionIds,
          permissionList: res.permissionList,
          autoRemoveDuplication: res.autoRemoveDuplication,
          autoApprovalPrinting: res.autoApprovalPrinting,
          publicForm: res.publicForm ? true : false,
          webhookConfigVOList: res.webhookConfigVOList ?? [],
        };
        this.$store.commit("loadForm", form);
      });
    },
    loadInitFrom() {
      this.$store.commit("loadForm", {
        formId: null,
        formName: "未命名表单",
        shortName: "未命名",
        enable: true,
        formGroupId: undefined,
        permissionType: "ALL",
        permissionIds: [],
        logo: {
          icon: "el-icon-eleme",
          background: "#1e90ff",
        },
        settings: {
          commiter: [],
          admin: [],
          sign: false,
          notify: {
            types: ["APP"],
            title: "消息通知标题",
          },
        },
        formItems: [],
        process: {
          id: "root",
          parentId: null,
          type: "ROOT",
          name: "发起人",
          desc: "任何人",
          props: {
            assignedUser: [],
            formPerms: [],
            outerFormPerms: [],
            operateAlias: DefaultProps.ROOT_PROPS.operateAlias,
          },
          children: {},
        },
        remark: "备注说明",
      });
    },
    validateDesign() {
      this.validVisible = true;
      this.validStep = 0;
      this.showValiding();
      this.stopTimer();
      this.timer = setInterval(() => {
        this.validResult.errs = this.$refs[this.validComponents[this.validStep]].validate();
        if (Array.isArray(this.validResult.errs) && this.validResult.errs.length === 0) {
          this.validStep++;
          if (this.validStep >= this.validOptions.length) {
            this.stopTimer();
            this.showValidFinish(true);
          }
        } else {
          this.stopTimer();
          this.validOptions[this.validStep].status = "error";
          this.showValidFinish(false, this.getDefaultValidErr());
        }
      }, 300);
    },
    getDefaultValidErr() {
      switch (this.validStep) {
        case 0:
          return "请检查基础设置项";
        case 1:
          return "请检查审批表单相关设置";
        case 2:
          return "请检查审批流程，查看对应标注节点错误信息";
        default:
          return "未知错误";
      }
    },
    showValidFinish(success, err) {
      this.validResult.success = success;
      this.validResult.finished = true;
      this.validResult.title = success ? "校验完成 😀 是否提交？" : "校验失败 ";
      this.validResult.desc = success ? "" : err;
      this.validResult.action = success ? "提 交" : "去修改";
    },
    showValiding() {
      this.validResult = {
        errs: [],
        finished: false,
        success: false,
        title: "检查中...",
        action: "处理",
        desc: "正在检查设置项",
      };
      this.validStep = 0;
      this.validOptions.forEach((op) => {
        op.status = "";
        op.icon = "";
        op.description = "";
      });
    },
    doAfter() {
      if (this.validResult.success) {
        this.doPublish();
      } else {
        this.activeSelect = this.validComponents[this.validStep];
        this.validVisible = false;
      }
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    preview() {
      this.validateDesign();
    },
    publishProcess() {
      this.validateDesign();
    },
    formPermsLoad(formPerms, oldPermMap, forms) {
      if (!forms) return;
      forms.forEach((form) => {
        if (form.name === "GroupList") {
          this.formPermsLoad(formPerms, oldPermMap, form.props.items);
        } else {
          //刷新名称
          let old = oldPermMap.get(form.id);
          if (old) {
            old.title = form.title;
            old.required = form.props.required;
            formPerms.push(old);
          } else {
            formPerms.push({
              id: form.id,
              title: form.title,
              required: form.props.required,
              perm: "E",
            });
          }
        }
      });
    },
    async doPublish() {
      let process = _.cloneDeep(this.setup.process);
      const deepProcess = (obj) => {
        for (const key in obj) {
          if (key === "props" && obj[key] && obj[key].assignedType === "ROLE") {
            obj[key].assignedUser = obj[key].role;
          }
          if (key === "props" && obj[key] && obj[key].assignedType === "POST") {
            obj[key].assignedUser = obj[key].post;
          }
          if (key === "props" && obj[key] && obj[key].assignedType === "SINGLE_POST") {
            obj[key].assignedUser = obj[key].single_post;
          }
          if (key === "props" && obj[key] && obj[key].formPerms) {
            const oldPermMap = obj[key].formPerms.toMap("id");
            const newPermMap = [];
            this.formPermsLoad(newPermMap, oldPermMap, this.setup.formItems);
          }
          if (key === "props" && obj[key] && obj[key].outerFormPerms) {
            const oldPermMap = obj[key].outerFormPerms.toMap("id");
            const newPermMap = [];
            this.formPermsLoad(newPermMap, oldPermMap, this.setup.formItems);
          }
          if (key === "props" && obj[key] && obj[key].assignedType === "APPOINTMENT") {
            obj[key].assignedUser = obj[key].appointment;
          }
          if (key === "props" && obj[key] && obj[key].assignedType === "SINGLE_APPOINTMENT") {
            obj[key].assignedUser = obj[key].single_appointment;
          }
          if (key === "children" && obj[key] && Object.keys(obj[key]).length) {
            deepProcess(obj[key]);
          }
          if (key === "branchs" && Array.isArray(obj[key]) && obj[key].length) {
            for (let index = 0; index < obj[key].length; index++) {
              deepProcess(obj[key][index]);
            }
          }
          if (key === "rejectStrategyNode" && Array.isArray(obj[key]) && obj[key].length) {
            for (let index = 0; index < obj[key].length; index++) {
              deepProcess(obj[key][index]);
            }
          }
        }
      };
      deepProcess(process);

      const isCopy = this.$route.query?.isCopy === "true";
      const applicationCode = this.$route.query.type === "CUSTOM_FORM" ? this.getApplicationCode() : undefined;

      this.publishing = true;
      this.$api
        .postCustomFormFlows({
          id: isCopy ? null : (this.$route.query?.id ?? null),
          name: this.setup.formName,
          shortName: this.setup.shortName,
          type: this.$route.query.type,
          businessType: this.setup.businessType,
          formGroupId: this.setup.formGroupId,
          enable: this.setup.enable,
          remark: this.setup.remark,
          permissionType: this.setup.permissionType,
          permissionIds: this.setup.permissionIds,
          autoRemoveDuplication: this.setup.autoRemoveDuplication,
          autoApprovalPrinting: this.setup.autoApprovalPrinting ? this.setup.autoApprovalPrinting : false,
          publicForm: this.setup.publicForm ? 1 : 0,
          webhookConfigVOList: this.setup.webhookConfigVOList ?? [],
          flowJson: this.$route.query.type !== "FORM" ? JSON.stringify(process) : null,
          formJson: this.$route.query.type !== "FLOW" ? JSON.stringify(this.setup.formItems) : null,
          qrCodeUrl: `${window.location.origin}/streamengineH5/public-form/?processType=ADD`,
          application: applicationCode,
        })
        .then((res) => {
          this.$message.success({ message: "操作成功", duration: 1500 });
          const returnUrl = this.$route.query.returnUrl;
          if (returnUrl) {
            window.location.href = decodeURIComponent(returnUrl);
          } else {
            this.$router.push("/");
          }
        })
        .finally(() => {
          this.publishing = false;
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
  },
};
</script>

<style lang="less" scoped>
.layout-body {
  min-width: 980px;
  height: calc(100% - 60px);
}

/deep/ .el-step {
  .is-success {
    color: @primary-color;
    border-color: @primary-color;
  }
}

.err-info {
  max-height: 180px;
  overflow-y: auto;

  & > div {
    padding: 5px;
    margin: 2px 0;
    width: 220px;
    text-align: left;
    border-radius: 3px;
    background: rgb(242 242 242);
  }

  i {
    margin: 0 5px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: white;
}

::-webkit-scrollbar-thumb {
  border-radius: 16px;
  background-color: #cacaca;
}
</style>

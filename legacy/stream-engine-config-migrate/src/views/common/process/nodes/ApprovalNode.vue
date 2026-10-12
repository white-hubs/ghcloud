<template>
  <node
    :title="config.name"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    @selected="$emit('selected')"
    @delNode="$emit('delNode')"
    @insertNode="(type) => $emit('insertNode', type)"
    placeholder="请设置审批人"
    header-bgc="#ff943e"
    header-icon="el-icon-s-check"
  />
</template>

<script>
import Node from "./Node";

export default {
  name: "ApprovalNode",
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  components: { Node },
  data() {
    return {
      showError: false,
      errorInfo: "",
    };
  },
  computed: {
    content() {
      const config = this.config.props;
      switch (config.assignedType) {
        case "ASSIGN_USER":
          if (config.assignedUser.length > 0) {
            let texts = [];
            config.assignedUser.forEach((org) => texts.push(org.name));
            return String(texts).replaceAll(",", "、");
          } else {
            return "请指定审批人";
          }
        case "SELF":
          return "发起人自己";
        case "PREV_ASSIGNEE":
          return "上一节点审批人";
        case "SELF_SELECT":
          if (config.selfSelect.type === "ASSIGN_USER") {
            return `发起人自选指定人员 (${config.selfSelect.typeForSelectRange.ASSIGN_USER.map((item) => item.name).join("、")})`;
          }
          if (config.selfSelect.type === "ROLE") {
            return `发起人自选指定角色 (${config.selfSelect.typeForSelectRange.ROLE.map((item) => item.name).join("、")})`;
          }
          return "发起人自选全公司";
        case "LEADER_TOP":
          return "多级主管依次审批";
        case "LEADER":
          return config.leader.level > 1 ? "发起人的第 " + config.leader.level + " 级主管" : "发起人的直接主管";
        case "FORM_USER":
          if (!config.formUser || config.formUser === "") {
            return "表单内联系人（未选择）";
          } else {
            let text = this.getFormItemById(config.formUser);
            if (text && text.title) {
              return `表单（${text.title}）内的人员`;
            } else {
              return "该表单已被移除😥";
            }
          }
        case "ROLE":
          if (config.role.length > 0) {
            return config.role.map((d) => d.name).join("、");
          } else {
            return "指定角色（未设置）";
          }
        case "POST":
          if (config.post.length > 0) {
            return config.post.map((d) => d.name).join("、");
          } else {
            return "指定职位（未设置）";
          }
        case "SINGLE_POST":
          if (config.single_post.length > 0) {
            return config.single_post.map((d) => d.name).join("、");
          } else {
            return "指定职位（未设置）";
          }
        case "APPOINTMENT":
          if (config.appointment.length > 0) {
            return config.appointment.map((d) => d.name).join("、");
          } else {
            return "指定岗位（未设置）";
          }
        case "SINGLE_APPOINTMENT":
          if (config.single_appointment.length > 0) {
            return config.single_appointment.map((d) => d.name).join("、");
          } else {
            return "指定岗位（未设置）";
          }
        case "DEP_POST":
          if (config.deptPost.dept) {
            if (config.deptPost.post.length > 0) {
              return `部门+岗位 (${config.deptPost.dept.name}+${config.deptPost.post.map((d) => d.name).join("、")})`;
            }
            return `部门+岗位 (${config.deptPost.dept.name})`;
          }
          return "部门+岗位 (未设置)";
        case "DEP_POSITION":
          if (config.deptPosition.dept) {
            if (config.deptPosition.position.length > 0) {
              return `部门+职位 (${config.deptPosition.dept.name}+${config.deptPosition.position.map((d) => d.name).join("、")})`;
            }
            return `部门+职位 (${config.deptPosition.dept.name})`;
          }
          return "部门+职位";
        case "EMPTY":
          return "空";
        default:
          return "未知设置项😥";
      }
    },
  },
  methods: {
    getFormItemById(id) {
      return this.$store.state.design.formItems.find((item) => item.id === id);
    },
    //校验数据配置的合法性
    validate(err) {
      try {
        return (this.showError =
          !this.validate_LIMIT_APPROVAL(err) ||
          !this[`validate_${this.config.props.assignedType}`](err) ||
          !this.validate_Reject(err) ||
          !this.validate_UserEmpty(err));
      } catch (e) {
        return true;
      }
    },
    validate_ASSIGN_USER(err) {
      if (this.config.props.assignedUser.length > 0) {
        return true;
      } else {
        this.errorInfo = "请指定审批人员";
        err.push(`${this.config.name} 未指定审批人员`);
        return false;
      }
    },
    validate_LIMIT_APPROVAL(err) {
      if (!this.config.props.limitTimeApproval) {
        return true;
      }
      const filterRequireAndEditable = this.config.props.formPerms.filter((item) => {
        return item.required && item.perm === "E";
      });

      // if(this.config.props.)
      // 限时通知
      if (this.config.props.limitTimeApprovalConfig.limitTimeNotify.checked) {
        const hasNotifyEmpty = this.config.props.limitTimeApprovalConfig.limitTimeNotify.approvalReminder.filter((item) => !item.value);
        if (hasNotifyEmpty.length) {
          this.errorInfo = "请输入限时提醒值";
          err.push(`限时审批 未输入限时提醒值`);
          return false;
        }
        const hasNotifyMinuteLessThanFive = this.config.props.limitTimeApprovalConfig.limitTimeNotify.approvalReminder.filter(
          (item) => item.unit === "MINUTE" && Number(item.value) < 5,
        );
        if (hasNotifyMinuteLessThanFive.length) {
          this.errorInfo = "限时提醒分钟至少5分钟起";
          err.push(`限时审批 限时提醒分钟至少5分钟起`);
          return false;
        }
      }
      const limitTimeApproval =
        this.config.props.limitTimeApprovalConfig.limitTimeApproval || this.config.props.limitTimeApprovalConfig.autoPass;
      if (limitTimeApproval && limitTimeApproval.checked) {
        if (!limitTimeApproval.value) {
          this.errorInfo = "请输入限时审批时间";
          err.push(`限时审批 未输入限时审批时间`);
          return false;
        }
        if (limitTimeApproval.unit === "MINUTE" && Number(limitTimeApproval.value) < 5) {
          this.errorInfo = "限时审批分钟至少5分钟起";
          err.push(`限时审批 限时审批分钟至少5分钟起`);
          return false;
        }
      }
      if (filterRequireAndEditable.length && limitTimeApproval && limitTimeApproval.checked && limitTimeApproval.type !== "TRANSFER") {
        this.errorInfo = "请先移除必填且可编辑字段";
        err.push(`${this.config.name} 请先移除必填且可编辑字段`);
        return false;
      }
      if (
        limitTimeApproval &&
        limitTimeApproval.checked &&
        limitTimeApproval.type === "TRANSFER" &&
        !this.getTransferTargetAccount(limitTimeApproval)
      ) {
        this.errorInfo = "请选择超时自动转交人员";
        err.push(`限时审批 未选择超时自动转交人员`);
        return false;
      }
      if (this.config.props.limitTimeApprovalConfig.limitTimeNotify.checked && limitTimeApproval && limitTimeApproval.checked) {
        const maxValue = Math.max(
          ...this.config.props.limitTimeApprovalConfig.limitTimeNotify.approvalReminder.map((item) =>
            this.getMinutes(item.unit, item.value),
          ),
        );
        if (maxValue > this.getMinutes(limitTimeApproval.unit, limitTimeApproval.value)) {
          this.errorInfo = "限时提醒时间不能大于限时审批时间";
          err.push(`限时审批 限时提醒时间不能大于限时审批时间`);
          return false;
        }
      }
      return true;
    },
    getMinutes(unit, value) {
      if (unit === "MINUTE") {
        return Number(value);
      }
      if (unit === "HOUR") {
        return Number(value) * 60;
      }
      if (unit === "DAY") {
        return Number(value) * 24 * 60;
      }
      return 0;
    },
    getTransferTargetAccount(limitTimeApproval) {
      if (limitTimeApproval.targetAccount) {
        return limitTimeApproval.targetAccount;
      }
      if (limitTimeApproval.targetUsers && limitTimeApproval.targetUsers.length) {
        return limitTimeApproval.targetUsers
          .map((item) => item.id || item.value)
          .filter(Boolean)
          .join(",");
      }
      return "";
    },
    validate_DEP_POST(err) {
      if (this.config.props.deptPost.dept && this.config.props.deptPost.post.length) {
        return true;
      } else {
        this.errorInfo = "请选择部门+岗位";
        err.push(`${this.config.name} 请选择部门+岗位`);
        return false;
      }
    },
    validate_DEP_POSITION(err) {
      if (this.config.props.deptPosition.dept && this.config.props.deptPosition.position.length) {
        return true;
      } else {
        this.errorInfo = "请选择部门+职位";
        err.push(`${this.config.name} 请选择部门+职位`);
        return false;
      }
    },
    validate_APPOINTMENT(err) {
      if (this.config.props.appointment.length > 0) {
        return true;
      } else {
        this.errorInfo = "请指定岗位";
        err.push(`${this.config.name} 未指定岗位`);
        return false;
      }
    },
    validate_SELF_SELECT(err) {
      if (this.config.props.selfSelect.type === "ASSIGN_USER" && this.config.props.selfSelect.typeForSelectRange.ASSIGN_USER.length === 0) {
        this.errorInfo = "请指定人员";
        err.push(`${this.config.name} 未指定人员`);
        return false;
      }
      if (this.config.props.selfSelect.type === "ROLE" && this.config.props.selfSelect.typeForSelectRange.ROLE.length === 0) {
        this.errorInfo = "请指定角色";
        err.push(`${this.config.name} 未指定角色`);
        return false;
      }
      return true;
    },
    validate_LEADER_TOP(err) {
      return true;
    },
    validate_EMPTY(err) {
      return true;
    },
    validate_LEADER(err) {
      return true;
    },
    validate_ROLE(err) {
      if (this.config.props.role.length <= 0) {
        this.errorInfo = "请指定负责审批的系统角色";
        err.push(`${this.config.name} 未指定审批角色`);
        return false;
      }
      return true;
    },
    validate_SELF(err) {
      return true;
    },
    validate_PREV_ASSIGNEE(err) {
      return true;
    },
    validate_FORM_USER(err) {
      if (this.config.props.formUser === "") {
        this.errorInfo = "请指定表单中的人员组件";
        err.push(`${this.config.name} 审批人为表单中人员，但未指定`);
        return false;
      }
      return true;
    },
    validate_REFUSE(err) {
      return true;
    },
    validate_Reject(err) {
      if (this.config.props.rejectStrategy === "TO_SELECT_NODE" && this.config.props.rejectStrategyNode.length === 0) {
        err.push(`${this.config.name} 请选择驳回到指定节点`);
        return false;
      }
      return true;
    },
    validate_UserEmpty(err) {
      if (this.config.props.nobody.handler === "TO_USER" && this.config.props.nobody.assignedUser.length === 0) {
        err.push(`${this.config.name} 审批节点为空指定人员审批未设置`);
        return false;
      }
      return true;
    },
  },
};
</script>

<style scoped></style>

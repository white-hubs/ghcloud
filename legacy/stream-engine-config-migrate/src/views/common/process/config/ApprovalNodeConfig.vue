<template>
  <div>
    <el-form label-position="top" label-width="90px">
      <el-form-item label="" prop="text" class="user-type">
        <el-radio-group v-model="nodeProps.assignedType">
          <el-radio v-for="t in approvalTypes" :label="t.type" :key="t.type" @change="approvalTypesChange" :disabled="t.disabled">
            {{ t.name }}
            <el-tooltip popper-class="tooltips-style" effect="light" :content="t.tips" placement="top-start" v-if="t.tips">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <div v-if="nodeProps.assignedType === 'ASSIGN_USER'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectUser" round>选择人员</el-button>
          <org-items v-model="nodeProps.assignedUser" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'SELF_SELECT'">
          <el-form-item label="选择范围" prop="range" class="approve-end">
            <div style="display: flex; gap: 20px; align-items: center">
              <el-select style="width: 60%" v-model="nodeProps.selfSelect.type" size="small" placeholder="选择指定人员范围">
                <el-option v-for="op in selfSelectOption" :label="op.label" :value="op.value" :key="op.value"></el-option>
              </el-select>
              <el-button
                size="mini"
                icon="el-icon-plus"
                @click="handleCheckSelfSelect"
                v-show="['ROLE', 'ASSIGN_USER'].includes(nodeProps.selfSelect.type)"
                type="primary"
                round
                >选择{{ nodeProps.selfSelect.type === "ROLE" ? "角色" : "人员" }}</el-button
              >
            </div>
            <org-items v-model="nodeProps.selfSelect.typeForSelectRange[nodeProps.selfSelect.type]" />
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'LEADER_TOP'">
          <el-divider />
          <el-form-item label="审批终点" prop="text" class="approve-end">
            <el-radio-group v-model="nodeProps.leaderTop.endCondition">
              <el-radio label="TOP">直到最上层主管</el-radio>
              <el-radio label="LEAVE">不超过发起人的</el-radio>
            </el-radio-group>
            <div class="approve-end-leave" v-if="nodeProps.leaderTop.endCondition === 'LEAVE'">
              <span>第 </span>
              <el-input-number :min="1" :max="20" :step="1" size="mini" v-model="nodeProps.leaderTop.level" />
              <span> 级主管</span>
            </div>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'LEADER'">
          <el-divider />
          <el-form-item label="指定主管" prop="text">
            <span>发起人的第 </span>
            <el-input-number :min="1" :max="20" :step="1" size="mini" v-model="nodeProps.leader.level"></el-input-number>
            <span> 级主管</span>
            <div style="color: #409eff; font-size: small">👉 直接主管为 第 1 级主管</div>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'ROLE'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectRole" round>选择系统角色</el-button>
          <org-items v-model="nodeProps.role" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'POST'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectPost" round>选择职位</el-button>
          <org-items v-model="nodeProps.post" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'SINGLE_POST'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectPost" round>选择职位</el-button>
          <org-items v-model="nodeProps.single_post" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'APPOINTMENT'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectAppointment" round>选择岗位</el-button>
          <org-items v-model="nodeProps.appointment" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'SINGLE_APPOINTMENT'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectAppointment" round>选择岗位</el-button>
          <org-items v-model="nodeProps.single_appointment" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'FORM_USER'">
          <el-form-item label="选择表单人员项" prop="text" class="approve-end">
            <el-select style="width: 80%" size="small" v-model="nodeProps.formUser" placeholder="请选择包含人员的表单项">
              <el-option v-for="op in forms" :label="op.title" :value="op.id" :key="op.id"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'DEP_POST'">
          <el-form-item label="部门+岗位">
            <div style="display: flex; align-items: center; gap: 10px">
              <el-select
                size="small"
                filterable
                clearable
                value-key="id"
                v-model="nodeProps.deptPost.dept"
                placeholder="请选择部门"
                @change="handleDeptChange"
              >
                <el-option v-for="op in orgList" :label="op.name" :value="op" :key="op.id"></el-option>
              </el-select>
              <el-select size="small" value-key="id" v-model="nodeProps.deptPost.post" placeholder="请选择岗位" multiple>
                <el-option v-for="op in postOption" :label="op.name" :value="op" multiple :key="op.id"></el-option>
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'DEP_POSITION'">
          <el-form-item label="部门+职位" prop="text">
            <div style="display: flex; align-items: center; gap: 10px">
              <el-select
                size="small"
                filterable
                clearable
                value-key="id"
                v-model="nodeProps.deptPosition.dept"
                placeholder="请选择部门"
                @change="handleDeptChange"
              >
                <el-option v-for="op in orgList" :label="op.name" :value="op" :key="op.id"></el-option>
              </el-select>
              <el-select size="small" filterable value-key="id" v-model="nodeProps.deptPosition.position" placeholder="请选择职位" multiple>
                <el-option v-for="op in postionOption" :label="op.name" :value="op" :key="op.id"></el-option>
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'EMPTY'"></div>
        <div v-else-if="nodeProps.assignedType === 'PREV_ASSIGNEE'">
          <span class="item-desc">自动获取上一审批节点的审批人</span>
        </div>
        <div v-else>
          <span class="item-desc">发起人自己作为审批人进行审批</span>
        </div>
      </el-form-item>

      <el-divider></el-divider>
      <el-form-item label="👤 审批人为空时" prop="text" class="line-mode">
        <el-radio-group v-model="nodeProps.nobody.handler">
          <el-radio label="TO_USER">指定人员审批</el-radio>
          <el-radio label="TO_PASS" :disabled="formRequired">自动通过</el-radio>
          <el-radio label="TO_ADMIN">跳转外链</el-radio>
        </el-radio-group>
        <div style="margin-top: 10px" v-if="nodeProps.nobody.handler === 'TO_USER'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectNoSetUser" round>选择人员</el-button>
          <org-items v-model="nodeProps.nobody.assignedUser" />
        </div>
      </el-form-item>
      <el-form-item label="驳回策略" class="line-mode">
        <el-radio-group v-model="nodeProps.rejectStrategy">
          <!--<el-radio label="TO_INITIATOR">驳回发起人</el-radio>-->
          <el-radio label="TO_PREV_NODE">驳回到上一节点</el-radio>
          <el-radio label="TO_SELECT_NODE">驳回到指定节点</el-radio>
          <el-radio label="TO_REJECT">终止流程</el-radio>
          <!-- <el-radio label="REJECT_FORM_SELECT">表单驳回时选择</el-radio> -->
        </el-radio-group>
        <div style="margin-top: 10px" v-if="nodeProps.rejectStrategy === 'TO_SELECT_NODE'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectNode" round>选择节点</el-button>
          <!-- <org-items v-model="nodeProps.rejectStrategyNode" /> -->
          <span v-if="nodeProps.rejectStrategyNode.length">
            节点id：<el-tag>{{ nodeProps.rejectStrategyNode[0].id }}</el-tag> 节点名称：<el-tag>{{
              nodeProps.rejectStrategyNode[0].name
            }}</el-tag>
          </span>
        </div>
      </el-form-item>
      <div v-if="showMode">
        <el-divider />
        <el-form-item label="👩‍👦‍👦 多人审批时审批方式" prop="text" class="approve-mode">
          <el-radio-group v-model="nodeProps.mode">
            <el-radio label="NEXT">会签 （按选择顺序审批，每个人必须同意）</el-radio>
            <el-radio label="AND">会签（可同时审批，每个人必须同意）</el-radio>
            <el-radio label="OR">或签（有一人同意或拒绝即可）</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </el-form>
    <org-picker
      :title="pickerTitle"
      :multiple="multiple"
      :type="orgPickerType"
      ref="orgPicker"
      :selected="orgPickerSelected"
      @ok="selected"
      @close="closed"
    />
    <node-picker
      title="节点选择"
      :selected="rejectSelectNode"
      :dataSource="nodeList"
      ref="nodePicker"
      :multiple="false"
      @ok="selectedNode"
    />
  </div>
</template>

<script>
import OrgItems from "../OrgItems";
import NodePicker from "@/components/common/NodePicker.vue";
import OrgPicker from "@/components/common/OrgPicker";

export default {
  name: "ApprovalNodeConfig",
  components: { OrgPicker, OrgItems, NodePicker },
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      showOrgSelect: false,
      isNobodyNode: false,
      nodeSelectVisible: false,
      formRequired: false,
      orgPickerSelected: [],
      nodeList: [],
      checkList: [],
      orgPickerType: "getStaffList",
      selfSelectOption: [
        {
          label: "全公司",
          value: "ALL",
        },
        {
          label: "指定人员",
          value: "ASSIGN_USER",
        },
        {
          label: "指定角色",
          value: "ROLE",
        },
      ],
      orgList: [],
      postOption: [],
      rejectSelectNode: [],
      postionOption: [],
    };
  },
  computed: {
    nodeProps() {
      const innerRequired =
        this.$store.state.selectedNode.props.formPerms &&
        this.$store.state.selectedNode.props.formPerms.some((x) => x?.perm === "E" && x?.required === true);
      const outerRequired =
        this.$store.state.selectedNode.props.outerFormPerms &&
        this.$store.state.selectedNode.props.outerFormPerms.some((x) => x?.perm === "E" && x?.required === true);
      this.formRequired = innerRequired || outerRequired;
      if (this.formRequired && this.$store.state.selectedNode.props.nobody.handler === "TO_PASS") {
        this.$store.state.selectedNode.props.nobody.handler = "TO_USER";
      }
      return this.$store.state.selectedNode.props;
    },
    approvalTypes() {
      const list = [
        { name: "指定人员", type: "ASSIGN_USER", disabled: false },
        { name: "发起人自选", type: "SELF_SELECT", disabled: false },
        { name: "角色", type: "ROLE", disabled: false },
        {
          name: "管理部门职位",
          type: "POST",
          disabled: false,
          tips: "可以给职位里的每个人指定管理部门，这些部门员工提交的审批就只能由这个人审批（例：某职位张三管理部门是行政部，则该部门的员工审批单都会自动流转到张三进行审批）",
        },
        {
          name: "所在部门岗位",
          type: "APPOINTMENT",
          disabled: false,
          tips: "根据发起人所在部门过滤审批条件（例：发起人属于行政部，则该审批节点会自动流转到行政部门下对应岗位的人员）",
        },
        { name: "发起人自己", type: "SELF", disabled: false },
        { name: "上一节点审批人", type: "PREV_ASSIGNEE", disabled: false, tips: "自动获取上一审批节点最近一次完成任务的审批人" },
        { name: "表单内联系人", type: "FORM_USER", disabled: false },
        {
          name: "部门+岗位",
          type: "DEP_POST",
          disabled: false,
          tips: "根据部门和岗位选择审批人（例：物业部+维修岗位，则该审批节点会流转到既属于物业部又是维修岗位的人员手中）",
        },
        {
          name: "部门+职位",
          type: "DEP_POSITION",
          disabled: false,
          tips: "根据部门和职位选择审批人（例：物业部+主管职位，则该审批节点会流转到既属于物业部又是主管职位的人员手中）",
        },
        { name: "空节点", disabled: false, type: "EMPTY" },
        { name: "职位", type: "SINGLE_POST", disabled: false },
        { name: "岗位", type: "SINGLE_APPOINTMENT", disabled: false },
      ];
      return list;
    },

    select() {
      switch (this.orgPickerType) {
        case "getStaffList":
          return this.config.assignedUser;
        case "getRoles":
          return this.config.role;
        case "getPositionList":
          return this.nodeProps.assignedType === "SINGLE_POST" ? this.config.single_post : this.config.post;
        case "getAppointmentList":
          return this.nodeProps.assignedType === "SINGLE_APPOINTMENT" ? this.config.single_appointment : this.config.appointment;
        default:
          return [];
      }
    },
    selectRejectStrategyNode() {
      return this.config.rejectStrategyNode;
    },
    multiple() {
      switch (this.orgPickerType) {
        case "getStaffList":
          return !this.isNobodyNode;
        case "getRoles":
          return true;
        case "getPositionList":
          return true;
        case "getAppointmentList":
          return true;
        default:
          return true;
      }
    },
    forms() {
      return this.$store.state.design.formItems.filter((f) => {
        return f.name === "UserPicker" || f.name === "TelPhone";
      });
    },
    pickerTitle() {
      switch (this.orgPickerType) {
        case "getStaffList":
          return "请选择人员";
        case "getRoles":
          return "请选择系统角色";
        default:
          return "请选择";
      }
    },
    nodeOptions() {
      let values = [];
      const excType = ["ROOT", "EMPTY", "CONDITION", "CONDITIONS", "CONCURRENT", "CONCURRENTS"];
      this.$store.state.nodeMap.forEach((v) => {
        if (excType.indexOf(v.type) === -1) {
          values.push({ id: v.id, name: v.name });
        }
      });
      return values;
    },
    showMode() {
      switch (this.nodeProps.assignedType) {
        case "ASSIGN_USER":
          return this.nodeProps.assignedUser.length > 0;
        case "SELF_SELECT":
          return true;
        case "LEADER_TOP":
          return this.nodeProps.formUser !== "";
        case "FORM_USER":
          return true;
        case "ROLE":
          return true;
        case "POST":
          return true;
        case "APPOINTMENT":
          return true;
        case "DEP_POST":
          return true;
        case "DEP_POSITION":
          return true;
        case "SINGLE_POST":
          return true;
        case "SINGLE_APPOINTMENT":
          return true;
        default:
          return false;
      }
    },
  },
  mounted() {
    this.getOrgans();
    //存在必填项，默认改为指定人员审批
    // if (this.formRequired && this.$store.state.selectedNode?.props?.nobody?.handler) {
    //   this.$store.state.selectedNode.props.nobody.handler = 'TO_USER'
    // }
  },
  methods: {
    approvalTypesChange(val) {
      if (["ASSIGN_USER", "EMPTY"].includes(val)) {
        this.$store.commit("isPublicForm", false);
      } else {
        this.$store.commit("isPublicForm", true);
      }
    },
    selectNode() {
      const typeMap = {
        ROOT: "根节点",
        APPROVAL: "审批节点",
        CC: "抄送节点",
        CONDITION: "条件节点",
        CONDITIONS: "条件节点",
        CONCURRENT: "并行节点",
        CONCURRENTS: "并行节点",
        END: "结束节点",
        EMPTY: "空节点",
      };
      const list = Array.from(this.$store.state.nodeMap.values());
      const currentNodeIndex = list.findIndex((v) => v.id === this.$store.state.selectedNode.id);
      this.nodeList = list
        .filter((v, index) => {
          return v.type !== "EMPTY" && index < currentNodeIndex;
        })
        .map((item) => {
          return {
            ...item,
            typeName: typeMap[item.type],
          };
        });
      this.rejectSelectNode = this.selectRejectStrategyNode;
      this.$nextTick(() => {
        this.$refs.nodePicker.show();
      });
      this.nodeSelectVisible = true;
    },
    selectedNode(select) {
      this.rejectSelectNode.length = 0;
      this.rejectSelectNode.reverse();
      select = select.map((item) => {
        return {
          name: item.name,
          id: item.id,
        };
      });
      select.forEach((val) => this.rejectSelectNode.push(val));
    },
    selectUser() {
      this.orgPickerType = "getStaffList";
      this.orgPickerSelected = this.select;
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    handleDeptChange(val) {
      this.postOption = [];
      this.nodeProps.deptPost.post = [];
      this.nodeProps.deptPosition.position = [];
      this.positionOption = [];
      if (!val) return;
      this.getPostAndPositionOptions(val.id);
    },
    async getOrgans() {
      const result = await this.$api.getOrganizationList();
      this.orgList = result;
      if (this.nodeProps.assignedType === "DEP_POST") {
        if (this.nodeProps.deptPost.dept.id) {
          this.getPostAndPositionOptions(this.nodeProps.deptPost.dept.id);
        }
        return;
      }
      if (this.nodeProps.assignedType === "DEP_POSITION") {
        if (this.nodeProps.deptPosition.dept.id) {
          this.getPostAndPositionOptions(this.nodeProps.deptPosition.dept.id);
        }
        return;
      }
      if (result.length) {
        this.getPostAndPositionOptions(result[0].id);
      }
    },
    async getPostAndPositionOptions(id) {
      const result = await this.$api.getPostAndPositionList({ id });
      if (this.nodeProps.assignedType === "DEP_POST") {
        this.postOption = result.postList;
        this.positionOption = [];
      } else {
        this.postionOption = result.positionList;
        this.postOption = [];
      }
    },
    handleCheckSelfSelect() {
      this.orgPickerType = this.config.selfSelect.type === "ASSIGN_USER" ? "getStaffList" : "getRoles";
      this.orgPickerSelected = this.config.selfSelect.typeForSelectRange[this.config.selfSelect.type];
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selectNoSetUser() {
      this.orgPickerType = "getStaffList";
      this.orgPickerSelected = this.config.nobody.assignedUser;
      this.isNobodyNode = true;
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selectRole() {
      this.orgPickerType = "getRoles";
      this.orgPickerSelected = this.select;
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selectPost() {
      this.orgPickerType = "getPositionList";
      this.orgPickerSelected = this.select;
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selectAppointment() {
      this.orgPickerType = "getAppointmentList";
      this.orgPickerSelected = this.select;
      this.$nextTick(() => {
        this.$refs.orgPicker.show(this.orgPickerSelected);
      });
    },
    selected(select) {
      this.orgPickerSelected.length = 0;
      this.orgPickerSelected.reverse();
      select.forEach((val) => this.orgPickerSelected.push(val));
      this.isNobodyNode = false;
    },
    closed() {
      this.isNobodyNode = false;
    },
    removeOrgItem(index) {
      this.select.splice(index, 1);
    },
  },
};
</script>
<style lang="less">
.tooltips-style {
  width: 400px;
}
</style>
<style lang="less" scoped>
.user-type {
  /deep/ .el-radio {
    width: 110px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
}

/deep/ .line-mode {
  .el-radio {
    width: 150px;
    margin: 5px;
  }
}

/deep/ .el-form-item__label {
  line-height: 25px;
}

/deep/ .approve-mode {
  .el-radio {
    float: left;
    width: 100%;
    display: block;
    margin-top: 15px;
  }
}

/deep/ .approve-end {
  position: relative;

  .el-radio-group {
    width: 160px;
  }

  .el-radio {
    margin-bottom: 5px;
    width: 100%;
  }

  .approve-end-leave {
    position: absolute;
    bottom: -5px;
    left: 150px;
  }
}

/deep/ .el-divider--horizontal {
  margin: 10px 0;
}
</style>

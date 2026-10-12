<template>
  <div>
    <div class="assignedType">
      <el-radio-group v-model="config.assignedType">
        <el-radio v-for="t in approvalTypes" :label="t.type" :key="t.type">
          {{ t.name }}
          <el-tooltip popper-class="tooltips-style" effect="light" :content="t.tips" placement="top-start"
            v-if="t.tips">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </el-radio>
      </el-radio-group>
    </div>
    <template v-if="config.assignedType === 'ASSIGN_USER'">
      <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectOrg" round>选择抄送人</el-button>
      <org-items v-model="select" />
      <org-picker multiple ref="orgPicker" type="getStaffList" :selected="select" @ok="selected" />
    </template>
    <template v-if="config.assignedType === 'APPOINTMENT'">
      <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectOrg" round>选择岗位</el-button>
      <org-items v-model="config.appointment" />
      <org-picker multiple ref="orgPicker" type="getAppointmentList" :selected="selectedAppointment" @ok="selected" />
    </template>
    <template v-if="config.assignedType === 'ROLE'">
      <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectOrg" round>选择系统角色</el-button>
      <org-items v-model="config.role" />
      <org-picker multiple ref="orgPicker" type="getRoles" :selected="selectedRole" @ok="selected" />
    </template>
    <template v-if="config.assignedType === 'FORM_USER'">
      <el-select style="width: 80%;" size="small" v-model="config.formUser" placeholder="请选择包含人员的表单项">
        <el-option v-for="op in forms" :label="op.title" :value="op.id" :key="op.id"></el-option>
      </el-select>
    </template>

    <!-- <el-checkbox v-model="config.assignedType">允许发起人手动添加抄送人</el-checkbox> -->
  </div>
</template>

<script>
import OrgPicker from "@/components/common/OrgPicker";
import OrgItems from "../OrgItems";

export default {
  name: "CcNodeConfig.vue",
  components: { OrgPicker, OrgItems },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    select: {
      get() {
        return this.config.assignedUser
      },
      set(val) {
        this.config.assignedUser = val
      }
    },
    forms() {
      return this.$store.state.design.formItems.filter(f => {
        return f.name === 'UserPicker'
      })
    },
    selectedRole: {
      get() {
        return this.config.role
      },
      set(val) {
        this.config.role = val
      }
    },
    selectedAppointment: {
      get() {
        return this.config.appointment
      },
      set(val) {
        this.config.appointment = val
      }
    }
  },
  data() {
    return {
      approvalTypes: [
        { name: '指定人员', type: 'ASSIGN_USER' },
        { name: '角色', type: 'ROLE' },
        { name: '岗位', type: 'APPOINTMENT', tips: '根据发起人所在部门过滤审批条件（例：发起人属于行政部，则该审批节点会自动流转到行政部门下对应岗位的人员）' },
        { name: '表单内联系人', type: 'FORM_USER' },
      ]
    }
  },
  created() {
    if (!this.config.role) {
      this.$set(this.config, 'role', [])
    }
    if (!this.config.assignedUser) {
      this.$set(this.config, 'assignedUser', [])
    }
    if (!this.config.appointment) {
      this.$set(this.config, 'appointment', [])
    }
  },
  methods: {
    selectOrg() {
      this.$refs.orgPicker.show()
    },
    selected(val) {
      this.select = []
      this.selectedRole = []
      this.selectedAppointment = []

      this.config.assignedType === 'ASSIGN_USER' && (this.select = Object.assign([], val))
      this.config.assignedType === 'ROLE' && (this.selectedRole = Object.assign([], val))
      this.config.assignedType === 'APPOINTMENT' && (this.selectedAppointment = Object.assign([], val))
    },
    removeOrgItem(index) {
      this.select.splice(index, 1)
    },
  }
}
</script>

<style lang="less" scoped>
.option {
  color: #606266;
  margin-top: 20px;
  font-size: small;
}

.desc {
  font-size: small;
  color: #8c8c8c;
}

.org-item {
  margin: 5px;
}


.assignedType {
  padding: 10px;
}
</style>

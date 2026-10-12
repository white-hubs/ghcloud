<template>
  <div>
    <el-tabs v-model="active" v-if="name && (formConfig.length > 0||selectNode.type==='ROOT')">
      <el-tab-pane :label="name" name="properties" v-if='selectNode.type!=="ROOT"'>
        <component :is="(selectNode.type||'').toLowerCase()" :config="selectNode.props" />
      </el-tab-pane>
      <el-tab-pane label="表单权限设置(外部人员)" name="outer"/>
      <el-tab-pane label="表单权限设置(系统内人员)" name="inner"/>
      <form-authority-config v-if="active==='outer'||active==='inner'" :formType="active"/>
      <el-tab-pane label="高级设置" name="advancedSetting" v-if='selectNode.type==="APPROVAL"'>
        <ApprovalAdvancedSetting />
      </el-tab-pane>
      <el-tab-pane label="操作设置" name="operateAlisa">
        <OperateAliasConfig :formType="active"/>
      </el-tab-pane>
    </el-tabs>
    <component :is="(selectNode.type||'').toLowerCase()" v-else :config="selectNode.props" />
  </div>
</template>

<script>
import Approval from './ApprovalNodeConfig.vue'
import Condition from './ConditionNodeConfig.vue'
import Delay from './DelayNodeConfig.vue'
import Cc from './CcNodeConfig.vue'
import Trigger from './TriggerNodeConfig.vue'
import FormAuthorityConfig from './FormAuthorityConfig.vue'
import Root from './RootNodeConfig.vue'
import ApprovalAdvancedSetting from "./ApprovalAdvancedSetting.vue"
import OperateAliasConfig from './operate-alias-config.vue'
export default {
  name: "NodeConfig",
  components: {
    Approval,
    Condition,
    Trigger,
    Delay,
    Root,
    Cc,
    FormAuthorityConfig,
    ApprovalAdvancedSetting,
    OperateAliasConfig
  },
  data() {
    return {
      active:'properties',
    }
  },
  computed: {
    selectNode() {
      this.active=this.$store.state.selectedNode.type==='ROOT'?'inner': 'properties'
      return this.$store.state.selectedNode
    },
    formConfig() {
      return this.$store.state.design.formItems
    },
    name() {
      switch (this.selectNode.type) {
        case 'ROOT':
          return '设置发起人';
        case 'APPROVAL':
          return '设置审批人';
        case 'CC':
          return '设置抄送人';
        default:
          return null;
      }
    }
  },
  mounted() {
    if (this.selectNode.type === 'ROOT') {
      this.rootPermission='outer'
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped></style>

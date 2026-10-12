<template>
  <node :title="config.name" :show-error="showError" :content="content" :error-info="errorInfo"
    @selected="$emit('selected')" @delNode="$emit('delNode')" @insertNode="type => $emit('insertNode', type)"
    placeholder="请设置抄送人" header-bgc="#3296fa" header-icon="el-icon-s-promotion" />
</template>

<script>
import Node from './Node'

export default {
  name: "CcNode",
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: { Node },
  data() {
    return {
      showError: false,
      errorInfo: '',
    }
  },
  computed: {
    content() {
      if (this.config.props.shouldAdd) {
        return '由发起人指定'
      } else {
        let texts = []
        switch (this.config.props.assignedType) {
          case 'ASSIGN_USER':
            if (this.config.props.assignedUser?.length === 0) {
              return '指定人员(未选择)'
            }
            this.config.props.assignedUser?.forEach(org => texts.push(org.name))
            return `指定人员 ${String(texts).replaceAll(',', '、')}`
          case 'APPOINTMENT':
            if (this.config.props.appointment?.length === 0) {
              return '指定岗位(未选择)'
            }
            this.config.props.appointment?.forEach(org => texts.push(org.name))
            return `岗位 ${String(texts).replaceAll(',', '、')}`
          case 'ROLE':
            if (this.config.props.role?.length === 0) {
              return '指定角色(未选择)'
            }
            this.config.props.role?.forEach(org => texts.push(org.name))
            return `角色 ${String(texts).replaceAll(',', '、')}`
          case "FORM_USER":
            if (!this.config.props.formUser || this.config.props.formUser === '') {
              return '表单内联系人（未选择）'
            } else {
              let text = this.getFormItemById(this.config.props.formUser)
              if (text && text.title) {
                return `表单（${text.title}）内的人员`
              } else {
                return '该表单已被移除😥'
              }
            }
          default:
            this.config.props.role?.forEach(org => texts.push(org.name))
            return String(texts).replaceAll(',', '、')
        }
      }
    }
  },
  methods: {
    getFormItemById(id) {
      return this.$store.state.design.formItems.find(item => item.id === id)
    },
    //校验数据配置的合法性
    validate(err) {
      this.showError = false
      if (this.config.props.shouldAdd) {
        this.showError = false
      } else if (this.config.props.assignedType === 'ROLE') {
        if (this.config.props.role.length === 0) {
          this.showError = true
          this.errorInfo = '请选择需要抄送的角色'
        }
      } else if (this.config.props.assignedType === 'ASSIGN_USER') {
        if (this.config.props.assignedUser.length === 0) {
          this.showError = true
          this.errorInfo = '请选择需要抄送的人员'
        }
      } else if (this.config.props.assignedType === 'APPOINTMENT') {
        if (!this.config.props.appointment.length) {
          this.showError = true
          this.errorInfo = '请选择岗位'
        }
      } else if (this.config.props.assignedType === 'FORM_USER') {
        if (!this.config.props.formUser) {
          this.showError = true
          this.errorInfo = '请选择表单内联系人'
        }
      }

      if (this.showError) {
        err.push(`抄送节点 ${this.config.name} ${this.errorInfo}`)
      }
      return !this.showError
    }
  }
}
</script>

<style scoped></style>

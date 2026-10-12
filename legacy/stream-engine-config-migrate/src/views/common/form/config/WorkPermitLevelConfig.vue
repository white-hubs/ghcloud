<template>
  <div>
    <el-form-item label="关联作业类型">
      <el-select v-model="value.params" placeholder="请选择作业类型组件" size="small" clearable>
        <el-option v-for="item in typeOptions" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "WorkPermitLevelConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    typeOptions() {
      return this.getAllComponents(this.$store.state.design.formItems || []).filter((item) => item.name === "WorkPermitTypeSelect");
    },
  },
  methods: {
    getAllComponents(components, parentGroupList = null) {
      let allComponents = [];
      if (!components || !components.length) {
        return allComponents;
      }
      components.forEach((component) => {
        const componentCopy = { ...component };
        if (parentGroupList) {
          componentCopy.id = `${parentGroupList.id}>${componentCopy.id}`;
          componentCopy.title = `${parentGroupList.title}>${componentCopy.title}`;
        }
        allComponents.push(componentCopy);
        if (component.name === "GroupList" && component.props?.items?.length) {
          allComponents = allComponents.concat(this.getAllComponents(component.props.items, component));
        }
      });
      return allComponents;
    },
  },
};
</script>

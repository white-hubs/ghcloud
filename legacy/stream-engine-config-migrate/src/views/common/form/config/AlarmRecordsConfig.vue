<template>
  <div>
    <el-form-item label="关联设备">
      <el-select v-model="value.params" placeholder="请选择关联设备组件" size="small" clearable>
        <el-option v-for="item in deviceOptions" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="关联时间区间">
      <el-select v-model="value.params2" placeholder="请选择日期/时间区间组件" size="small" clearable>
        <el-option v-for="item in timeRangeOptions" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "AlarmRecordsConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    allComponents() {
      return this.getAllComponents(this.$store.state.design.formItems || []);
    },
    deviceOptions() {
      return this.allComponents.filter((item) => item.name === "RelatedDeviceSelect");
    },
    timeRangeOptions() {
      return this.allComponents.filter((item) => ["DateTimeRange", "TimePickerRange"].includes(item.name));
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

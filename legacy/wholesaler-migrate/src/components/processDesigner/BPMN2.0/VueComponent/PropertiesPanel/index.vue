<template lang="pug">
  div.properties-container
    div.properties-header 属性面板
    div.properties-body
      a-tabs.properties-tabs(@change="handleTabChange")
        a-tab-pane(v-for="tab in tabs" :key="tab.id" :tab="tab.label") 
          div.properties-pane
            div.properties-group(v-for="group in tab.groups" :key="group.id")
              //- div.properties-group-title {{group.label}}
              app-form(:model="formModelMap[group.id]" 
              :rules="formRulesMap[formModelMap[group.id]]" :ref="tab.id + '_' + group.id" :labelWidth="90")
                a-form-model-item(v-for="field in formFieldsMap[group.id]" 
                :key="field.name" :label="field.label" :prop="field.name" v-show="!field.isHide || !field.isHide()")
                  a-input(v-if="!entries[field.name].inputComponent || entries[field.name].inputComponent === 'a-input'" 
                  placeholder="请输入" v-model="formModelMap[group.id][field.name]" 
                  @input="handleChange(field, formModelMap[group.id][field.name])")
                  app-remote-select(v-else-if="entries[field.name].inputComponent === 'app-remote-select'" 
                  v-model="formModelMap[group.id][field.name]" 
                  :options="entries[field.name].inputOptions"
                  :field="{name: 'value', label: 'label'}"
                  @change="handleChange(field, formModelMap[group.id][field.name])")
                  //- a-form-model-item(label="是否会签")
                  a-switch(v-else-if="entries[field.name].inputComponent === 'a-switch'" 
                  :default-checked="!!currentNode.businessObject.loopCharacteristics"
                  @change="field.action(currentNode, bpmnModeler, entries)")
                  app-collection-select(v-else-if="entries[field.name].inputComponent === 'app-collection-select'" 
                  v-model="formModelMap[group.id][field.name]"
                  @change="handleChange(field, formModelMap[group.id][field.name])")
</template>

<script>
export default {
  props: {
    current: Object,
    bpmnModeler: Object,
  },
  data() {
    return {};
  },
  computed: {
    tabs() {
      const tabs = this.current?.tabs;
      return tabs || [];
    },
    groups() {
      const groups = this.current?.groups;
      return groups || {};
    },
    entries() {
      const entries = this.current?.entries;
      return entries || {};
    },
    currentNode() {
      const currentNode = this.current?.element;
      return currentNode || null;
    },
    formModelMap() {
      const modelMap = {};
      const keys = Object.keys(this.groups);
      keys.forEach((key) => {
        const group = this.groups[key];
        const model = (modelMap[key] = {});
        group.entries.forEach((entry) => {
          model[entry.id] =
            typeof entry?.get === 'function'
              ? entry?.get(this.currentNode)[entry.id]
              : entry?.get;
        });
      });
      return modelMap;
    },
    formFieldsMap() {
      const fieldsMap = {};
      const keys = Object.keys(this.groups);
      keys.forEach((key) => {
        const group = this.groups[key];
        const fields = (fieldsMap[key] = []);
        group.entries.forEach((entry, index) => {
          fields[index] = {
            ...entry,
            name: entry.id,
            label: entry.label || entry.id,
          };
        });
      });
      return fieldsMap;
    },
    formRulesMap() {
      const rulesMap = {};
      const keys = Object.keys(this.groups);
      keys.forEach((key) => {
        const group = this.groups[key];
        const rules = (rulesMap[key] = []);
        group.entries.forEach((entry, index) => {
          rules[index] = [
            { required: true, message: '不能为空哦~', trigger: 'change' },
          ];
        });
      });
      return rulesMap;
    },
  },
  mounted() {},
  methods: {
    handleTabChange(key) {
    },
    handleChange(field, newValue) {
      const cmd = field.set(this.currentNode, {
        [field.id]: newValue,
      });
      this.bpmnModeler.get('commandStack').execute(cmd.cmd, cmd.context);
    },
  },
};
</script>

<style lang="less" scoped>
.properties-container {
  width: 100%;
  height: 100%;
  .properties-header {
    font-size: 16px;
    font-weight: 600;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  .properties-body {
    height: calc(100% - 45px);
    .properties-tabs {
      height: 100%;
      .properties-pane {
        height: 100%;
        padding: 1rem;
        overflow: auto;
        .properties-group-title {
          font-weight: 600;
        }
      }
    }
  }
}
</style>
<style lang="less">
.properties-container {
  .properties-body {
    .ant-tabs-bar {
      padding: 0 1rem;
      // border-bottom: none;
      margin-bottom: 0.5rem;
    }
    .ant-tabs-content {
      height: calc(100% - 45px - 0.5rem);
      .ant-form-item {
        margin-bottom: 0;
      }
    }
  }
}
</style>

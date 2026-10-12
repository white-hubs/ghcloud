<template lang="pug">
  div.diagram-container
    div.diagram-main
      div.diagram-dom(ref="diagram")
      div.diagram-tools
        a-button(@click="saveToXml") saveToXml
    //- div.diagram-properties(ref="properties")
    //- div.diagram-properties()
      PropertiesPanel(:current="current" :bpmnModeler="bpmnModeler")
    
    div.diagram-properties()
      CustomPropertiesPanel(:current="current" :bpmnModeler="bpmnModeler")
</template>

<script>
import CustomModeler from '../index.js';
// // 右侧属性栏
import propertiesPanel from 'bpmn-js-properties-panel';
// import propertiesProvider from 'bpmn-js-properties-panel/lib/provider/camunda';
import propertiesProvider from '../PropertiesProvider';
// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import activityModdleDescriptor from '../Descriptors/camunda.activity';

// 翻译
// import customTranslateModule from '../Translate';

import { customDescriptors } from '../config.default.js';
import BpmnXml from '../bpmn.test.xml.js';
import PropertiesPanel from './PropertiesPanel/index';
import CustomPropertiesPanel from './PropertiesPanel/custom';
export default {
  components: {
    PropertiesPanel,
    CustomPropertiesPanel,
  },
  data() {
    return {
      data: {},
      bpmnModeler: null,
      current: null,
    };
  },
  async mounted() {
    this.bpmnModeler = new CustomModeler({
      container: this.$refs.diagram,
      //添加控制板
      // propertiesPanel: {
      //   parent: this.$refs.properties,
      // },
      additionalModules: [
        // 右边的属性栏
        propertiesProvider,
        propertiesPanel,
        // customPropertiesProviderModule,
        // customTranslateModule, // 翻译
      ],
      moddleExtensions: {
        // camunda: camundaModdleDescriptor,
        activiti: activityModdleDescriptor,
        ghy: customDescriptors.ghy,
        custom: customDescriptors.customProperties,
      },
    });
    // let bpmnModeler = this.bpmnModeler;
    // let modeling = bpmnModeler.get('modeling');
    // 暴露到全局
    window.bpmnModeler = this.bpmnModeler;
    this.bpmnModeler.importXML(BpmnXml).then((res) => {
      if (res?.warnings?.length) {
      } else {
        // 监听全部事件
        // const events = Object.keys(
        //   this.bpmnModeler.get('modeling')._eventBus._listeners,
        // ).filter(
        //   (event) =>
        //     !event.includes('ove') &&
        //     !event.includes('out') &&
        //     !event.includes('cli'),
        // );
        // events.forEach((event) => {
        //   this.bpmnModeler.on(event, (e) => {
        //     if (/^drag/.test(event)) {
        //       // return false;
        //     }
        //   });
        // });
        // 获取当前选中的节点
        this.current = this.bpmnModeler.get('propertiesPanel')._current; // 默认选中流程
        this.bpmnModeler.on('selection.changed', () => {
          this.current = this.bpmnModeler.get('propertiesPanel')._current;
        });
        this.bpmnModeler.on('propertiesPanel.changed', () => {
          this.current = this.bpmnModeler.get('propertiesPanel')._current;
        });
      }
    });
  },
  methods: {
    saveToXml() {
      this.bpmnModeler
        .saveXML({
          format: true,
        })
        .then((res) => {
        })
        .catch((err) => {
        });
    },
  },
};
</script>

<style lang="less">
.diagram-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  // flex-direction: column;
  .diagram-main {
    flex: auto;
    position: relative;
    .diagram-dom {
      width: 100%;
      height: 100%;
    }
    .diagram-tools {
      position: absolute;
      left: 1rem;
      bottom: 1rem;
    }
  }
  .diagram-properties {
    width: 320px;
    height: 100%;
    border-left: 1px solid #efefef;
    overflow: auto;
  }
}
</style>

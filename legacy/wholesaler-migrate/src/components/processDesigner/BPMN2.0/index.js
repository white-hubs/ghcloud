// import BpmnModeler from 'bpmn-js/lib/Modeler';
// 右侧属性栏
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
// 以下为bpmn工作流绘图工具的样式
import 'bpmn-js/dist/assets/diagram-js.css'; // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'; // 右边工具栏样式

import Modeler from 'bpmn-js/lib/Modeler';
import Palette from './Palette/customPalette.js';
import customPaletteProvider from './Palette/customPaletteProvider.js'; // 自定义 左侧 palette
import CustomRenderer from './Renderer/customRenderer'; // 自定义renderer
import CustomRenderer2 from './Renderer/customRenderer2'; // 自定义renderer
import ContextPad from './ContextPad/customContextPad'; // 自定义contextPad 菜单
import CustomContextpadProvider from './ContextPad/customContextPadProvider'; // 自定义contextPad 菜单
import CustomContextpadProvider2 from './ContextPad/customContextPadProvider2'; // 自定义contextPad 菜单

import './style.default.less';

// 翻译
import CustomTranslate from './Translate/customTranslate';

const CustomTranslateModule = {
  __init__: ['translate'],
  translate: ['value', CustomTranslate],
};

const CustomPalette = {
  __init__: [
    'palette',
    'paletteProvider',
    // 'defaultRenderer'
  ],
  palette: ['type', Palette],
  paletteProvider: ['type', customPaletteProvider],
  // defaultRenderer: ['type', CustomRenderer],
};
const CustomRendererModule = {
  __init__: ['customRenderer', 'customRenderer2'],
  customRenderer: ['type', CustomRenderer],
  customRenderer2: ['type', CustomRenderer2],
};
const CustomContextpad = {
  __init__: [
    'contextPad',
    'contextPadProvider', // 放开 屏蔽默认的contextPad
    // 'CustomContextpadProvider',
  ],
  contextPad: ['type', ContextPad],
  // contextPadProvider: ['type', CustomContextpadProvider], // 放开 屏蔽默认的contextPad
  contextPadProvider: ['type', CustomContextpadProvider2], // 放开 屏蔽默认的contextPad
  // CustomContextpadProvider: ['type', CustomContextpadProvider],
};

// 需要注入 descriptor!!! TODO
// import { customDescriptors } from './config.default.js';

export default class CustomModeler extends Modeler {
  constructor(options) {
    super(options);
    this._customElements = [];
  }
}
CustomModeler.prototype._modules = [].concat(CustomModeler.prototype._modules, [
  CustomPalette, // 自定义tool绘制
  // CustomPaletteProvider,
  CustomRendererModule,
  CustomContextpad,
  CustomTranslateModule,
]);

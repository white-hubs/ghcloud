// import ghy from './Descriptors/descriptor.ghy.json';
import bpmn from 'bpmn-moddle/resources/bpmn/json/bpmn.json';
import { parseDescriptors } from './utils/parseDescriptorToTypeProperties';
parseDescriptors.parse(bpmn);

import TaskRender from '../Renderer/TaskRender';
const config = {
  customDescriptors: {
    ghy: {
      name: 'Ghy',
      prefix: 'Ghy',
      uri: 'http://ghy',
      xml: {
        tagAlias: 'lowerCase',
      },
      associations: [],
      types: [
        {
          name: 'Start',
          superClass: ['bpmn:CatchEvent'],
          properties: [],
        },
        {
          name: 'End',
          superClass: ['bpmn:ThrowEvent'],
          properties: [],
        },
        {
          name: 'UserTask',
          superClass: ['bpmn:UserTask'],
          properties: [],
        },
        {
          name: 'Task',
          superClass: ['bpmn:Task'],
          properties: [],
        },
      ],
    },
    customProperties: {
      name: 'Custom',
      prefix: 'custom',
      uri: 'http://custom',
      xml: {
        tagAlias: 'lowerCase',
      },
      associations: [],
      types: [
        {
          name: 'BewitchedStartEvent',
          extends: ['bpmn:StartEvent'],
          properties: [
            {
              name: 'spell',
              isAttr: true,
              type: 'String',
            },
          ],
        },
        {
          name: 'customProperty',
          extends: ['bpmn:FlowNode'],
          properties: [
            {
              name: 'url',
              isAttr: true,
              type: 'String',
            },
            {
              name: 'method',
              isAttr: true,
              type: 'String',
            },
            {
              name: 'isLogin',
              isAttr: true,
              type: 'Boolean',
            },
            {
              name: 'timeout',
              isAttr: true,
              type: 'Number',
            },
            {
              name: 'users',
              isAttr: true,
              type: 'Array',
              tips:
                '只有简单的数组可以, 对象或者数组里面包含对象都不行, 并且数组也会转成用逗号连接的字符串',
            },
          ],
        },
      ],
    },
  },
  customPalettes: {
    'create.bpmn:StartEvent': {
      group: 'GHY',
      title: '开始',
      className: 'bpmn-icon-start-event-none',
    },
    'create.bpmn:UserTask': {
      group: 'GHY',
      title: '用户任务',
      className: 'bpmn-icon-task',
    },
    'create.bpmn:EndEvent': {
      group: 'GHY',
      title: '结束',
      className: 'bpmn-icon-end-event-none',
    },
    // 'Ghy-separator': {
    //   group: 'GHY',
    //   separator: true,
    // },
    // 'create.Ghy:Start': {
    //   group: 'GHY',
    //   className: 'ghy-palette-icon iconfont icon-xingzhuang-tuoyuanxing', // 自定义样式名字
    //   // separator: true,
    // },
    // 'create.Ghy:UserTask': {
    //   group: 'GHY',
    //   className: 'ghy-palette-icon iconfont icon-gongdan', // 自定义样式名字
    // },
    // 'create.Ghy:Task': {
    //   group: 'GHY',
    //   className: 'ghy-palette-icon iconfont icon-gongdan', // 自定义样式名字
    // },
    // 'create.Ghy:End': {
    //   group: 'GHY',
    //   className: 'ghy-palette-icon iconfont icon-ditu-yuan', // 自定义样式名字
    // },
    // 尝试添加一个bpmn自身的工具, 并把它加入GHY的group
    // 'hand-tool': {
    //     group: 'GHY',
    //     className: 'ghy-palette-icon iconfont icon-bug', // 自定义样式名字
    // }
  },
  customElements: {
    // 配合customRenderer, customPalettes
    'Ghy:Start': {
      url:
        'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/rules.png',
      attr: { x: 0, y: 0, width: 48, height: 48 },
    },
    'Ghy:End': {
      url:
        'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/rules.png',
      attr: { x: 0, y: 0, width: 48, height: 48 },
    },
    'Ghy:UserTask': {
      attr: { width: 200, height: 120 },
      render: TaskRender,
    },
    'Ghy:Task': {
      attr: { width: 200, height: 120 },
      render: TaskRender,
    },
  },
  customContextPad: {
    // 'append.Ghy:Start': {
    //   group: 'GHY',
    //   className: 'ghy-contextPad-icon iconfont icon-xingzhuang-tuoyuanxing',
    // },
    // 'append.Ghy:UserTask': {
    //   group: 'GHY',
    //   className: 'ghy-contextPad-icon iconfont icon-xingzhuang-tuoyuanxing',
    // },
    // 'append.Ghy:End': {
    //   group: 'GHY',
    //   className: 'ghy-contextPad-icon iconfont icon-ditu-yuan',
    // },
    'append.bpmn:StartEvent': {
      group: 'GHY',
      className: 'bpmn-icon-start-event-none',
    },
    'append.bpmn:UserTask': {
      group: 'GHY',
      className: 'bpmn-icon-task',
    },
    'append.bpmn:EndEvent': {
      group: 'GHY',
      className: 'bpmn-icon-end-event-none',
    },
    delete: {
      group: 'GHY',
      className: 'bpmn-icon-trash',
    },
  },
};
export const { customDescriptors } = config;
export const { customPalettes } = config;
export const { customElements } = config;
export const { customContextPad } = config;
// export const customContextPad = config.customContextPad;
export const BPMN_USE_ENV = {
  STACK: 'React',
  FRAME: 'AntDesign',
};

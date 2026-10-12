import { customContextPad } from '../config.default';

export default class CustomContextpadProvider {
  constructor(
    contextPad,
    config,
    injector,
    translate,
    bpmnFactory,
    elementFactory,
    create,
    modeling,
    connect,
  ) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    this.bpmnFactory = bpmnFactory;
    this.modeling = modeling;
    this.connect = connect;
    this.config = config || {};
    if (this.config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }
    contextPad.registerProvider(this);
  }
  getContextPadEntries(element) {
    // TODO: 根据element的type返回不同的contxtpad
    const createActionFun = (type) => {
      return (event, element) => {
        const shape = this.elementFactory.createShape({ type: type });
        shape.businessObject.name = type.replace(/\.|\:/g, ''); // 设置名字
        if (this.autoPlace) {
          this.autoPlace.append(element, shape);
        } else {
          this.create.start(event, shape, element);
        }
      };
    };
    const createContextPadEntries = () => {
      const entries = {};
      const keys = Object.keys(customContextPad);
      keys.forEach((key) => {
        if (/^append/.test(key)) {
          entries[key] = Object.assign(
            {
              group: 'default',
              className: `default-contextpad-icon d-p-i-${key.split(':')[1]}`,
              title: `${key.replace(/\.|\:/g, '')}`,
              action: {
                click: createActionFun(key.split('.')[1]),
                dragstart: createActionFun(key.split('.')[1]),
              },
            },
            customContextPad[key],
          );
        } else if (key === 'delete') {
          entries[key] = Object.assign(
            {
              group: 'GHY',
              className: 'el-icon-delete',
              title: this.translate('删除节点'),
              action: {
                click: (event, element) => {
                  this.modeling.removeElements([element]);
                },
              },
            },
            customContextPad[key],
          );
        }
      });
      return entries;
    };
    return createContextPadEntries();
    // 创建函数需要按 功能 来分类, append/delete/edit/replace...
    // return {
    //     'append.GhyEnd': {
    //         group: 'GHY',
    //         className: 'el-icon-cpu',
    //         title: this.translate('创建 GhyEnd'),
    //         action: {
    //             click: appendTask,
    //             dragstart: appendTaskStart
    //         }
    //     },
    //     'delete': {
    //         group: 'GHY',
    //         className: 'el-icon-delete',
    //         title: this.translate('删除节点'),
    //         action: {
    //             click: (event, element) => {
    //                 this.modeling.removeElements([element]);
    //             },
    //         }
    //     },
    //     'edit': {
    //         group: 'GHY',
    //         className: 'el-icon-search',
    //         title: this.translate('编辑节点'),
    //         action: {
    //             click: (event, element) => {
    //             },
    //         }
    //     },
    // };
  }
}
CustomContextpadProvider.$inject = [
  'contextPad',
  'config',
  'injector',
  'translate',
  'bpmnFactory',
  'elementFactory',
  'create',
  'modeling',
  'connect',
];

// import defaultPalatteProvider from 'bpmn-js/lib/features/palette/PaletteProvider'
import {
  customElements,
  customPalettes,
  descriptors,
} from '../config.default.js';
// 导出公共类
export default class CustomPaletteProvider {
  constructor(
    bpmnFactory,
    create,
    elementFactory,
    palette,
    translate,
    globalConnect,
  ) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    this.globalConnect = globalConnect;

    palette.registerProvider(this);
  }
  // 这个函数就是绘制palette的核心
  getPaletteEntries() {
    const createActionFun = (type, name) => {
      // 在这里可以配置属性
      // ...
      return (event) => {
        const businessObject = this.bpmnFactory.create(type);
        // 手动编辑属性
        businessObject.name = name || type.split(':').join('');
        const shape = this.elementFactory.createShape({
          type,
          businessObject,
        });
        this.create.start(event, shape);
      };
    };
    const createPalleteConfig = () => {
      let pallete = {};
      // 最好判断一下 返回的palette绘制 最好customPalettes, customPalettes, descriptors 里面都有
      const keys = Object.keys(customPalettes);
      keys.forEach((key) => {
        if (customPalettes[key].separator) {
          pallete[key] = Object.assign({}, customPalettes[key]);
          return;
        }
        pallete[key] = Object.assign(
          {
            group: 'default',
            className: `default-palette-icon d-p-i-${key.split(':')[1]}`,
            title: `${key.replace(/\.|\:/g, '')}`,
            action: {
              dragstart: createActionFun(
                key.split('.')[1],
                customPalettes[key].title,
              ),
              click: createActionFun(
                key.split('.')[1],
                customPalettes[key].title,
              ),
            },
          },
          customPalettes[key],
        );
      });
      return pallete;
    };
    // ------- eg ---------
    // return {
    //     'create.GhyEnd': {
    //         group: 'GHY',
    //         className: 'el-icon-cpu',
    //         title: '创建 GhyEnd',
    //         action: {
    //             dragstart: createActionFun('Ghy:End'),
    //             click: createActionFun('Ghy:End'),
    //         }
    //     }
    // }
    return createPalleteConfig();
  }
}
// 注入
CustomPaletteProvider.$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate',
  'globalConnect',
];

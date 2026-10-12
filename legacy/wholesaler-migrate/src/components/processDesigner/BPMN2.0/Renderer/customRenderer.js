import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'; // 引入默认的renderer
// import DefaultRenderer from 'diagram-js/lib/draw/DefaultRenderer'; // 引入默认的renderer
import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove,
} from 'tiny-svg';

import { customElements } from '../config.default';

const HIGH_PRIORITY = 1500; // 最高优先级, defaultRenderer是1000
export default class CustomRendererProvider extends BaseRenderer {
  // 继承BaseRenderer
  constructor(eventBus, styles, bpmnRenderer, textRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.CONNECTION_STYLE = styles.style(['no-fill'], {
      strokeWidth: 5,
      stroke: 'fuchsia',
    });
    this.SHAPE_STYLE = styles.style({
      fill: 'white',
      stroke: 'fuchsia',
      strokeWidth: 2,
    });

    this.bpmnRenderer = bpmnRenderer;
    this.textRenderer = textRenderer;
    // this.drawShapeFuncs = {};
    this.customElements = customElements || {};
  }

  canRender(element) {
    // ignore labels
    return !element.labelTarget;
  }
  // registerDrawShapeFunc(type, func){
  //     this.drawShapeFuncs[type] = func;
  // }
  drawShape(parentNode, element) {
    // 核心函数就是绘制shape
    const type = element.type; // 获取到类型
    const customShape = this.customElements[type];
    if (customShape) {
      if (customShape.render && typeof customShape.render === 'function') {
        // 有render方法 用render
        const render = customShape.render.apply(this, [
          parentNode,
          element,
          type,
          customShape,
          svgAppend,
          svgAttr,
          svgClasses,
          svgCreate,
          svgRemove,
        ]);
        return render;
      } else if (customShape.url && typeof customShape.url === 'string') {
        // 有图用图
        const { url, attr } = customShape;
        const customIcon = svgCreate('image', {
          // 在这里创建了一个image
          ...attr,
          href: url,
        });
        element['width'] = attr.width; // 这里我是取了巧, 直接编辑了元素的宽高
        element['height'] = attr.height;
        svgAppend(parentNode, customIcon);
        return customIcon;
      } else {
        // 默认就画个框框!
        const { url, attr } = customShape;
        const { width, height } = attr;
        const rect = svgCreate('polygon');
        svgAttr(rect, {
          points: `0,0 0,${height} ${width},${height} ${width},0`,
          stroke: '#ff4400',
          strokeWidth: 2,
          fill: '#fff',
        });
        element['width'] = attr.width;
        element['height'] = attr.height;
        svgAppend(parentNode, rect);
        return rect;
      }
    }
  }

  getShapePath(shape) {
    return this.bpmnRenderer.getShapePath(shape);
  }
}

CustomRendererProvider.$inject = [
  'eventBus',
  'styles',
  'bpmnRenderer',
  'textRenderer',
];

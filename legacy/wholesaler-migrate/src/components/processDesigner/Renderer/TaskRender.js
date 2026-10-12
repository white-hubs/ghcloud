import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove,
} from 'tiny-svg';
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer';
const textRenderer = new TextRenderer();
import { createRoundRectPath } from './utils/path';

const DISPLAY_FIELDS = [
  { name: 'time', label: '节点时限' },
  { name: 'assignee', label: '节点处理人' },
];
/**
 * @param {parent} <svg标签>,父节点
 * @param {element} <bpmn节点>
 * @param {type} <bpmn节点类型>
 */
export default (parent, element, type, customShape) => {

  if (customShape?.attr) {
    element = Object.assign(element, customShape.attr);
  }
  const { width, height } = element;
  const container = svgCreate('g', { class: 'task-container' });
  const header = svgCreate('g');
  const body = svgCreate('g');
  const footer = svgCreate('g');
  svgAppend(container, header);
  svgAppend(container, body);
  svgAppend(container, footer);
  // 这里只有header和footer
  const headerHeight = height;
  const bodyHeight = 0;
  svgAttr(footer, { transform: `translate(0, ${headerHeight + bodyHeight})` });
  // header 内容
  // 节点头部圆角背景
  const roundPath = svgCreate('path');
  svgAttr(roundPath, {
    d: createRoundRectPath({
      width: width,
      height: headerHeight,
      raduis: [5, 5, 5, 5],
    }),
    stroke: '#FF9933',
    strokeWidth: 1,
    fill: '#FF9933',
  });
  svgAppend(header, roundPath);
  // 节点头部大标题
  const title = svgCreate('g');
  const titleText = textRenderer.createText(
    element?.businessObject?.name || 'USER_TASK',
    {
      box: { width, height: headerHeight },
      align: 'center-middle',
      style: { fill: '#FFF', fontSize: 14 },
    },
  );
  svgAppend(title, titleText);
  svgAppend(header, title);

  svgAppend(parent, container);
  return container;
};

// export default (parent, element, type, customShape) => {

//   if (customShape?.attr) {
//     element = Object.assign(element, customShape.attr);
//   }
//   const { width, height } = element;
//   const container = svgCreate('g', { class: 'task-container' });
//   const header = svgCreate('g');
//   const body = svgCreate('g');
//   const footer = svgCreate('g');
//   svgAppend(container, header);
//   svgAppend(container, body);
//   svgAppend(container, footer);
//   // 这里只有header和footer
//   const headerHeight = height / 2;
//   const bodyHeight = 0;
//   const footerHeight = height / 2;
//   svgAttr(footer, { transform: `translate(0, ${headerHeight + bodyHeight})` });
//   // header 内容
//   // 节点头部圆角背景
//   const roundPath = svgCreate('path');
//   svgAttr(roundPath, {
//     d: createRoundRectPath({
//       width: width,
//       height: headerHeight,
//       raduis: [5, 5],
//     }),
//     stroke: '#FF9933',
//     strokeWidth: 1,
//     fill: '#FF9933',
//   });
//   svgAppend(header, roundPath);
//   // 节点头部大标题
//   const title = svgCreate('g');
//   const titleText = textRenderer.createText(
//     element?.businessObject?.name || 'USER_TASK',
//     {
//       box: { width, height: headerHeight },
//       align: 'center-middle',
//       style: { fill: '#FFF', fontSize: 14 },
//     },
//   );
//   svgAppend(title, titleText);
//   svgAppend(header, title);

//   // footer 内容
//   const roundPath2 = svgCreate('path');
//   svgAttr(roundPath2, {
//     d: createRoundRectPath({
//       width: width,
//       height: headerHeight,
//       raduis: [0, 0, 5, 5],
//     }),
//     stroke: '#FF9933',
//     strokeWidth: 1,
//     fill: '#FFFFFF',
//   });
//   svgAppend(footer, roundPath2);
//   // 节点信息 循环添加
//   const len = DISPLAY_FIELDS.length;
//   const footerPadding = 8;
//   const fieldHeight = Math.floor(footerHeight / len - footerPadding);
//   for (let i = 0; i < len; i++) {
//     const f = DISPLAY_FIELDS[i];
//     const field = svgCreate('g');
//     svgAttr(field, {
//       transform: `translate(0, ${i * fieldHeight + footerPadding})`,
//     });
//     const fieldText = textRenderer.createText(
//       `${f.label}: ${element.businessObject[f.name]}`,
//       {
//         box: { width, height: fieldHeight },
//         align: 'center-middle',
//         style: { fill: '#333', fontSize: 12 },
//       },
//     );
//     svgAppend(field, fieldText);
//     svgAppend(footer, field);
//   }

//   svgAppend(parent, container);
//   return container;
// };

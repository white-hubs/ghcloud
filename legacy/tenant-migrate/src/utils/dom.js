// 一些dom操作
function getParentNode(element) {
  const node = element.parentNode;
  if (!node || node.tagName === "BODY") {
    // 只找到body
    return null;
  } else {
    return node;
  }
}
export function getParentsByClassName(element, className) {
  if (!element || !className) {
    return null;
  }
  const parentNode = getParentNode(element);
  if (!parentNode) {
    return null;
  }
  const classNames = [...parentNode.classList];
  if (classNames.includes(className)) {
    return parentNode;
  } else {
    return getParentsByClassName(parentNode, className);
  }
}

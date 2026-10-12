interface ComponentStyle {
  zIndex?: number;
  left?: string;
  top?: string;
  width?: string;
  height?: string;
}
export const useComponentStyle = (attr: { x: number; y: number; }, index: number): ComponentStyle => {
  if (!attr) return {}
  const componentStyle = {
    zIndex: index + 1,
    left: `${attr.x}px`,
    top: `${attr.y}px`
  }
  return componentStyle
}
export const useSizeStyle = (attr: { w: number; h: number; }, scale?: number): ComponentStyle => {
  if (!attr) return {}
  return {
    width: `${scale ? scale * attr.w : attr.w}px`,
    height: `${scale ? scale * attr.h : attr.h}px`
  }
}

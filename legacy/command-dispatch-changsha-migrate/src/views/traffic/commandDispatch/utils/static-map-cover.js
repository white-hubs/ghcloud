export const calculateCoverLayout = ({ containerWidth, containerHeight, imageWidth, imageHeight }) => {
  const dimensions = [containerWidth, containerHeight, imageWidth, imageHeight].map(Number);
  if (!dimensions.every((value) => Number.isFinite(value) && value > 0)) return null;
  const [width, height, sourceWidth, sourceHeight] = dimensions;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;
  return { renderedWidth, renderedHeight, offsetX: (width - renderedWidth) / 2, offsetY: (height - renderedHeight) / 2 };
};

export const projectNormalizedPoint = (point, layout) => {
  if (!layout) return null;
  const x = Number(point?.x);
  const y = Number(point?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { left: layout.offsetX + x * layout.renderedWidth, top: layout.offsetY + y * layout.renderedHeight };
};

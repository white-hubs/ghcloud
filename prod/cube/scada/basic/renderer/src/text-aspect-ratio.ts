const PRECISION_DIGITS = 6;

export interface HtmlTextSizeCompensationStyle {
  width: string;
  height: string;
  transform: string;
  transformOrigin: string;
}

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function createTextAspectCompensationTransform(
  viewBoxWidth: number,
  viewBoxHeight: number,
  renderedWidth: number,
  renderedHeight: number,
  anchorX: number,
  anchorY: number,
): string | undefined {
  if (![viewBoxWidth, viewBoxHeight, renderedWidth, renderedHeight].every(finitePositive)) {
    return undefined;
  }

  const scaleX = renderedWidth / viewBoxWidth;
  const scaleY = renderedHeight / viewBoxHeight;
  const horizontalCompensation = Number((scaleY / scaleX).toFixed(PRECISION_DIGITS));
  return `translate(${anchorX} ${anchorY}) scale(${horizontalCompensation} 1) translate(${-anchorX} ${-anchorY})`;
}

export function createHtmlTextSizeCompensationStyle(
  viewBoxWidth: number,
  viewBoxHeight: number,
  renderedWidth: number,
  renderedHeight: number,
): HtmlTextSizeCompensationStyle | undefined {
  if (![viewBoxWidth, viewBoxHeight, renderedWidth, renderedHeight].every(finitePositive)) {
    return undefined;
  }

  const scaleX = renderedWidth / viewBoxWidth;
  const scaleY = renderedHeight / viewBoxHeight;
  const widthPercent = Number((scaleX * 100).toFixed(PRECISION_DIGITS));
  const heightPercent = Number((scaleY * 100).toFixed(PRECISION_DIGITS));
  const inverseX = Number((1 / scaleX).toFixed(PRECISION_DIGITS));
  const inverseY = Number((1 / scaleY).toFixed(PRECISION_DIGITS));
  return {
    width: `${widthPercent}%`,
    height: `${heightPercent}%`,
    transform: `scale(${inverseX}, ${inverseY})`,
    transformOrigin: "0 0",
  };
}

export function applyTextAspectRatioCompensation(root: Element, renderedWidth: number, renderedHeight: number): void {
  const svg = root.querySelector("svg");
  if (!svg || svg.getAttribute("preserveAspectRatio") !== "none") {
    return;
  }

  const viewBox = (svg.getAttribute("viewBox") ?? "").trim().split(/\s+/u).map(Number);
  const viewBoxWidth = viewBox[2];
  const viewBoxHeight = viewBox[3];
  if (!finitePositive(viewBoxWidth) || !finitePositive(viewBoxHeight)) {
    return;
  }

  for (const text of svg.querySelectorAll('[data-preserve-text-aspect="true"]')) {
    const anchorX = Number(text.getAttribute("x"));
    const anchorY = Number(text.getAttribute("y"));
    const transform = createTextAspectCompensationTransform(viewBoxWidth, viewBoxHeight, renderedWidth, renderedHeight, anchorX, anchorY);
    if (transform) {
      text.setAttribute("transform", transform);
    }
  }

  const htmlStyle = createHtmlTextSizeCompensationStyle(viewBoxWidth, viewBoxHeight, renderedWidth, renderedHeight);
  if (!htmlStyle) return;
  for (const content of svg.querySelectorAll('[data-preserve-html-text-size="true"]')) {
    const style = (content as HTMLElement).style;
    if (!style) continue;
    Object.assign(style, htmlStyle);
  }
}

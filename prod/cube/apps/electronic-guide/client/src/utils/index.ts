// 获取assets静态资源
export const getAssetsFile = (url: string): string => new URL(`../assets/images/${url}`, import.meta.url).href;
// 获取应该放大或者缩放的比例
export const getScale = (): number => {
  const { VITE_DESIGN_WIDTH } = import.meta.env;
  const viteDesignWidth = Number(VITE_DESIGN_WIDTH);
  const designWidth = isNaN(viteDesignWidth) ? 1920 : viteDesignWidth;
  const scale = document.documentElement.clientWidth / designWidth;
  return scale;
};

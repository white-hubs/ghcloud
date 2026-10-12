export const DEFAULT_PAGE_NAME = "未命名画面";

/** 项目详情页会先创建一条空画面记录，编辑器首次保存前用空对象内容识别该状态。 */
export function isNewPlaceholderPageContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content) as unknown;
    return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length === 0);
  } catch {
    return false;
  }
}

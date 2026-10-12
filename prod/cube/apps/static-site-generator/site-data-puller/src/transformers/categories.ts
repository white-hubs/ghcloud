import type { ArticleCategory, ArticleCategoryApi } from "../types.ts";

function flattenCategories(categories: ArticleCategoryApi[]): ArticleCategory[] {
  const result: ArticleCategory[] = [];
  for (const cat of categories) {
    result.push({
      id: cat.id,
      categoryName: cat.categoryName,
      sort: cat.sort ?? 0,
    });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children));
    }
  }
  return result;
}

export function transformCategories(apiCategories: ArticleCategoryApi[]): ArticleCategory[] {
  return flattenCategories(apiCategories);
}

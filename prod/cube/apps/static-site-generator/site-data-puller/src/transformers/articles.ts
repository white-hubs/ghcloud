import type { Article, ArticleApi } from "../types.ts";

function formatTimestamp(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  // 后端可能返回毫秒时间戳
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isNaN(num) && num > 1_000_000_000_000) {
    const date = new Date(num);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  // 已经是格式化字符串
  return String(value);
}

function extractDate(datetime: string): string {
  if (!datetime) return "";
  return datetime.split(" ")[0] ?? "";
}

export function transformArticles(apiArticles: ArticleApi[]): Article[] {
  return apiArticles.map((article) => {
    const createTime = formatTimestamp(article.createTime);
    const updateTime = formatTimestamp(article.updateTime);
    const id = String(article.id);
    return {
      id: article.id,
      title: article.title ?? "",
      date: extractDate(createTime),
      createTime,
      updateTime,
      summary: article.summary ?? "",
      content: article.content ?? "",
      coverImageUrl: article.coverImageUrl ?? "",
      author: article.author ?? "",
      viewCount: article.viewCount ?? 0,
      category: article.categoryName ?? "",
      categoryId: article.categoryId,
      href: `/information/detail-${id}.html`,
    };
  });
}

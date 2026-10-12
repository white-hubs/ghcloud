export interface Article {
  id: string;
  title: string;
  date: string;
  summary: string;
  categoryId?: string | undefined;
  categoryName?: string;
  coverImageUrl: string;
  author: string;
  content: string;
  sort: number;
  status: number;
  createdTime: string;
  updatedTime: string;
}

export interface ArticleCategoryOption {
  id: string;
  categoryName: string;
}

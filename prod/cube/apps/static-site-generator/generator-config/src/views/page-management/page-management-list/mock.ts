export interface PageItem {
  id: string;
  pageName: string;
  pageRoute: string;
  pageTitle: string;
  layout: string;
  createdTime: string;
  updatedTime: string;
}

const MOCK_DATA: PageItem[] = [
  {
    id: "builtin-information-list",
    pageName: "文章列表页",
    pageRoute: "/information.html",
    pageTitle: "资讯中心",
    layout: "default",
    createdTime: "2024-01-01 00:00:00",
    updatedTime: "2024-01-01 00:00:00",
  },
  {
    id: "builtin-information-detail",
    pageName: "文章详情模板",
    pageRoute: "/information/detail-{id}.html",
    pageTitle: "文章详情",
    layout: "default",
    createdTime: "2024-01-01 00:00:00",
    updatedTime: "2024-01-01 00:00:00",
  },
  {
    id: "builtin-consultation",
    pageName: "咨询页面",
    pageRoute: "/consultation.html",
    pageTitle: "立即咨询",
    layout: "default",
    createdTime: "2024-01-01 00:00:00",
    updatedTime: "2024-01-01 00:00:00",
  },
  {
    id: "1",
    pageName: "首页",
    pageRoute: "/",
    pageTitle: "首页",
    layout: "default",
    createdTime: "2024-01-15 10:00:00",
    updatedTime: "2024-03-20 14:30:00",
  },
  {
    id: "2",
    pageName: "关于我们",
    pageRoute: "/about",
    pageTitle: "关于我们",
    layout: "default",
    createdTime: "2024-01-20 11:00:00",
    updatedTime: "2024-03-18 16:00:00",
  },
  {
    id: "3",
    pageName: "产品服务",
    pageRoute: "/products",
    pageTitle: "产品服务",
    layout: "default",
    createdTime: "2024-02-01 09:00:00",
    updatedTime: "2024-03-15 10:00:00",
  },
];

export async function getMockPageList(): Promise<PageItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_DATA]), 300);
  });
}

export async function deleteMockPage(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_DATA.findIndex((item) => item.id === id);
      if (index > -1) MOCK_DATA.splice(index, 1);
      resolve();
    }, 300);
  });
}

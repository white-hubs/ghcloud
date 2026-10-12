import type { ComponentInstance } from "@/designer";

export interface LayoutFormData {
  id?: string;
  layoutName: string;
  slot: string;
  components: ComponentInstance[];
}

const MOCK_LAYOUTS: LayoutFormData[] = [
  {
    id: "1",
    layoutName: "default",
    slot: "main",
    components: [
      {
        name: "NavMenu",
        props: {
          logo: "https://qiniu.guhecloud.com/imgs/icons/13.png?imageView2/0/format/webp/q_74",
          phone: "400-105-5388",
          logoAlt: "古河云科技-AI+安全管理产品与解决方案服务商",
          contactText: "立即咨询",
          contactHref: "/consultation.html",
          transparentBgColor: "transparent",
          items: [
              {
                name: "首页",
                routePath: "/",
                menuType: "none"
              },
              {
                name: "开河中枢",
                routePath: "/product-center/river.html",
                menuType: "simple",
                children: [
                  {
                    name: "开河平台",
                    routePath: "/product-center/river.html"
                  },
                  {
                    name: "业务引擎",
                    routePath: "/engines/business.html"
                  },
                  {
                    name: "数据引擎",
                    routePath: "/engines/data.html"
                  },
                  {
                    name: "物联引擎",
                    routePath: "/engines/iot.html"
                  },
                  {
                    name: "AI引擎",
                    routePath: "/engines/ai.html"
                  },
                  {
                    name: "孪生引擎",
                    routePath: "/engines/twin.html"
                  }
                ]
              },
              {
                name: "产品中心",
                routePath: "#",
                menuType: "complex",
                descTitle: "产品中心",
                descDetail: "古河云科技打造企业级SaaS平台，服务客户500+，建设项目240+，助力AI+全场景落地。",
                subGroups: [
                  {
                    subTitle: "应用产品",
                    list: [
                      {
                        name: "内部管理",
                        routePath: "/product-center/internal.html"
                      },
                      {
                        name: "安全管理",
                        routePath: "/product-center/safe.html"
                      },
                      {
                        name: "农批运营",
                        routePath: "/product-center/agriculture.html"
                      },
                      {
                        name: "医院运营",
                        routePath: "/product-center/hospital.html"
                      },
                      {
                        name: "运维作业",
                        routePath: "/product-center/operation.html"
                      },
                      {
                        name: "基础管理",
                        routePath: "/product-center/base.html"
                      },
                      {
                        name: "集成管理",
                        routePath: "/product-center/integration.html"
                      }
                    ]
                  },
                  {
                    subTitle: "硬件产品",
                    list: [
                      {
                        name: "视频安全",
                        routePath: "/product-center/video.html"
                      },
                      {
                        name: "消防安全",
                        routePath: "/product-center/fire.html"
                      },
                      {
                        name: "电气管理",
                        routePath: "/product-center/electric.html"
                      },
                      {
                        name: "考勤管理",
                        routePath: "/product-center/attendance.html"
                      },
                      {
                        name: "机房动环",
                        routePath: "/product-center/env.html"
                      },
                      {
                        name: "电子巡更",
                        routePath: "/product-center/patrol.html"
                      },
                      {
                        name: "肉类滑轨",
                        routePath: "/product-center/meat-track.html"
                      }
                    ]
                  },
                  {
                    subTitle: "服务产品",
                    list: [
                      {
                        name: "建模服务",
                        routePath: "/product-center/modeling.html"
                      },
                      {
                        name: "定制服务",
                        routePath: "/product-center/customized.html"
                      },
                      {
                        name: "安全托管",
                        routePath: "/product-center/managed.html"
                      }
                    ]
                  }
                ]
              },
              {
                name: "解决方案",
                routePath: "/programme/park.html",
                menuType: "complex",
                descTitle: "解决方案",
                descDetail: "基于产品矩阵的行业化延伸，形成了覆盖场馆、园区、医院、农批市场、交通等多个行业的安全管理解决方案体系。",
                subGroups: [
                  {
                    subTitle: "行业解决方案",
                    list: [
                      {
                        name: "智慧产业园解决方案",
                        routePath: "/programme/park.html"
                      },
                      {
                        name: "智慧体育馆解决方案",
                        routePath: "/programme/physical.html"
                      },
                      {
                        name: "智慧高铁站解决方案",
                        routePath: "/programme/railway.html"
                      },
                      {
                        name: "智慧医院解决方案",
                        routePath: "/programme/hospital.html"
                      }
                    ]
                  },
                  {
                    subTitle: "场景解决方案",
                    list: [
                      {
                        name: "消防安全管理",
                        routePath: "/programme/fire-safety.html"
                      },
                      {
                        name: "视频安全监测",
                        routePath: "/programme/video-safety.html"
                      },
                      {
                        name: "电气安全管理",
                        routePath: "/programme/electric-safety.html"
                      },
                      {
                        name: "节能降耗管理",
                        routePath: "/programme/energy-saving.html"
                      },
                      {
                        name: "智能巡检管理",
                        routePath: "/programme/smart-patrol.html"
                      },
                      {
                        name: "综合监测预警",
                        routePath: "/programme/monitoring-early-warning.html"
                      },
                      {
                        name: "应急调度管理",
                        routePath: "/programme/emergency-dispatch.html"
                      },
                      {
                        name: "安全培训演练",
                        routePath: "/programme/safety-training.html"
                      },
                      {
                        name: "肉类滑轨交易",
                        routePath: "/programme/agriculture.html"
                      },
                      {
                        name: "AI智能体管理",
                        routePath: "/programme/ai-agent.html"
                      }
                    ]
                  }
                ]
              },
              {
                name: "行业案例",
                routePath: "/industry.html",
                menuType: "none"
              },
              {
                name: "渠道合作",
                routePath: "/cooperation.html",
                menuType: "none"
              },
              {
                name: "资讯中心",
                routePath: "/information.html",
                menuType: "none"
              },
              {
                name: "服务保障",
                routePath: "/service.html",
                menuType: "none"
              },
              {
                name: "关于我们",
                routePath: "/about.html",
                menuType: "none"
              }
            ],
        },
      },
      {
        name: "__slot__",
        props: { slot: "main" },
      },
      {
        name: "FloatingSidebar",
        props: {
          items: [
            {
              name: "电话咨询",
              icon: "phone",
              content: "400-1055-388",
              img: "",
              linkUrl: "tel:4001055388",
            },
            {
              name: "免费试用",
              icon: "",
              content: "试",
              img: "",
              linkUrl: "/consultation.html",
            },
            {
              name: "在线咨询",
              icon: "message",
              content: "",
              img: "",
              linkUrl: "",
            },
            {
              name: "微信公众号",
              icon: "wechat",
              content: "",
              img: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/qr-wechat.png",
              linkUrl: "",
            },
          ],
        },
      },
      {
        name: "SiteFooter",
        props: {
          logo: "https://qiniu.guhecloud.com/imgs/icons/7.png?imageView2/0/format/webp/q_74",
          slogan: "看见不可见，守护未发生！",
          phone: "400-105-5388",
          email: "ghy@guhecloud.com",
          companyAddress: "成都市高新区天府大道中段666号",
          copyrightYear: "2017",
          copyrightCompany: "成都古河云科技有限公司",
          icp: "蜀ICP备18001555号-1",
          icpLink: "https://beian.miit.gov.cn/",
          qrCodes: [
            {
              image: "https://qiniu.guhecloud.com/imgs/icons/8.png?imageView2/0/format/webp/q_75",
              label: "扫码关注\n古河云公众号",
            },
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/qr-video.png",
              label: "扫码关注\n古河云视频号",
            },
          ],
          navGroups: [
            {
              title: "关于公司",
              links: [
                {
                  name: "公司介绍",
                  url: "/about.html#brief",
                },
                {
                  name: "发展历程",
                  url: "/about.html#course",
                },
                {
                  name: "企业文化",
                  url: "/about.html#culture",
                },
                {
                  name: "联系我们",
                  url: "/about.html#contact",
                },
              ],
            },
            {
              title: "产品中心",
              links: [
                {
                  name: "物联管理",
                  url: "/product-center/app.html",
                },
                {
                  name: "业务底座",
                  url: "/product-center/base.html",
                },
                {
                  name: "孪生可视",
                  url: "/product-center/river.html",
                },
                {
                  name: "安全调度",
                  url: "/product-center/safe.html",
                },
                {
                  name: "集成运维",
                  url: "/product-center/integration.html",
                },
                {
                  name: "节能降耗",
                  url: "/product-center/electric.html",
                },
              ],
            },
            {
              title: "解决方案",
              links: [
                {
                  name: "智慧写字楼",
                  url: "/programme/park.html",
                },
                {
                  name: "智慧产业园",
                  url: "/programme/park.html",
                },
                {
                  name: "智慧医院",
                  url: "/programme/hospital.html",
                },
                {
                  name: "智慧高铁站",
                  url: "/programme/railway.html",
                },
                {
                  name: "智慧体育馆",
                  url: "/programme/physical.html",
                },
                {
                  name: "智慧管廊",
                  url: "/programme/park.html",
                },
              ],
            },
          ],
          socialLinks: [
            {
              name: "头条",
              url: "https://www.toutiao.com/c/user/token/MS4wLjABAAAA5ix6CEOwIusGkT9rTArDTh0n0KGjH9gvwYvfODxlkiNCsyNKd6J5HlXa40mJTfy9/?source=m_redirect&wid=1692684038577",
              icon: "https://qiniu.guhecloud.com/imgs/icons/9.png?imageView2/0/format/webp/q_75",
              hoverIcon: "https://qiniu.guhecloud.com/imgs/icons/72.png?imageView2/0/format/webp/q_75",
            },
            {
              name: "知乎",
              url: "https://www.zhihu.com/people/cheng-du-gu-he-yun-ke-ji",
              icon: "https://qiniu.guhecloud.com/imgs/icons/10.png?imageView2/0/format/webp/q_75",
              hoverIcon: "https://qiniu.guhecloud.com/imgs/icons/73.png?imageView2/0/format/webp/q_75",
            },
            {
              name: "小红书",
              url: "https://www.xiaohongshu.com/user/profile/647005e7000000001c02a8b5?xhsshare=CopyLink&appuid=647005e7000000001c02a8b5&apptime=1692683517",
              icon: "https://qiniu.guhecloud.com/imgs/icons/55.png?imageView2/0/format/webp/q_75",
              hoverIcon: "https://qiniu.guhecloud.com/imgs/icons/74.png?imageView2/0/format/webp/q_75",
            },
            {
              name: "抖音",
              url: "https://www.douyin.com/user/MS4wLjABAAAAN2GMGw_kBiAe7bgqSO8wM7QWz-Yfw4K3jM3zZMMB9jVpS2RxgwP56Pl2eAJhXKyZ",
              icon: "https://qiniu.guhecloud.com/imgs/icons/12.png?imageView2/0/format/webp/q_75",
              hoverIcon: "https://qiniu.guhecloud.com/imgs/icons/75.png?imageView2/0/format/webp/q_75",
            },
          ],
          friendLinks: [
            {
              name: "金锐智能",
              url: "http://www.jrzn.net/",
            },
            {
              name: "四川招标",
              url: "http://sichuan.okcis.cn",
            },
          ],
          contacts: [
            {
              label: "咨询热线",
              value: "400-105-5388",
              href: "tel:4001055388",
            },
            {
              label: "商务合作",
              value: "15281057317（总部-彭先生）",
              href: "tel:15281057317",
            },
            {
              label: "",
              value: "18390838872（长沙-孙先生）",
              href: "tel:18390838872",
              indent: true,
            },
            {
              label: "",
              value: "13923463730（深圳-姜先生）",
              href: "tel:13923463730",
              indent: true,
            },
            {
              label: "申报及其它",
              value: "19180505602（总部-龚女士）",
              href: "tel:19180505602",
            },
            {
              label: "公司邮箱",
              value: "ghy@guhecloud.com",
              href: "mailto:ghy@guhecloud.com",
            },
          ],
          contactTitle: "联系我们",
          friendLinkTitle: "友情链接",
          offices: [
            {
              label: "总部",
              contact: "15281057317（总经理 - 彭安）",
            },
          ],
        },
      },
    ],
  },
];

export async function getMockLayoutDetail(id: string): Promise<LayoutFormData | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const layout = MOCK_LAYOUTS.find((l) => l.id === id);
      resolve(layout ? { ...layout, components: layout.components.map((c) => ({ ...c })) } : null);
    }, 300);
  });
}

export async function saveMockLayout(data: LayoutFormData): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.id) {
        const index = MOCK_LAYOUTS.findIndex((l) => l.id === data.id);
        if (index > -1) {
          MOCK_LAYOUTS[index] = { ...data };
        }
      } else {
        const newLayout: LayoutFormData = {
          ...data,
          id: String(MOCK_LAYOUTS.length + 1),
        };
        MOCK_LAYOUTS.push(newLayout);
      }
      resolve();
    }, 300);
  });
}

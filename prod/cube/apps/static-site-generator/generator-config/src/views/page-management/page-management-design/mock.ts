import type { ComponentInstance } from "@/designer";

export interface PageFormData {
  id?: string;
  pageName: string;
  pageRoute: string;
  layout: string;
  status?: number;
  meta: {
    title?: string;
    description?: string;
    keywords?: string;
    navStyle?: string;
    ogImage?: string;
  };
  components: ComponentInstance[];
}

export interface LayoutOption {
  label: string;
  value: string;
}

const MOCK_PAGES: PageFormData[] = [
  {
    id: "builtin-information-list",
    pageName: "文章列表页",
    pageRoute: "/information.html",
    layout: "default",
    meta: {
      title: "资讯中心 - 古河云科技",
      description: "了解最新行业动态与公司资讯",
      keywords: "行业动态,产品资讯,公司新闻",
      navStyle: "light",
    },
    components: [
      {
        name: "SwiperCarousel",
        props: {
          items: [
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/cases-banner.webp",
              title: "与您一起连接数字世界",
              subtitle:
                "垂直于数字孪生、物联、建模领域的资讯整合、同步传导，将企业动态、行业热点相结合，全方位解读行业最新变化、了解企业成长等。",
              titleColor: "#ffffff",
              subtitleColor: "#ffffff",
            },
          ],
        },
      },
      {
        name: "CategoryTabs",
        props: {
          categories: [
            { id: "company", name: "公司动态", href: "/information/category/company.html#category-filter" },
            { id: "industry", name: "行业新闻", href: "/information/category/industry.html#category-filter" },
            { id: "product", name: "产品动态", href: "/information/category/product.html#category-filter" },
            { id: "policy", name: "政策报告", href: "/information/category/policy.html#category-filter" },
          ],
          activeId: "all",
          allHref: "/information.html#category-filter",
          urlAware: true,
          allText: "全部分类",
        },
      },
      {
        name: "NewsSection",
        props: {
          news: [],
          limit: 0,
          enableCategoryFilter: true,
          layout: "list",
        },
      },
    ],
  },
  {
    id: "builtin-information-detail",
    pageName: "文章详情模板",
    pageRoute: "/information/detail-{id}.html",
    layout: "default",
    meta: {
      title: "文章详情 - 古河云科技",
      description: "",
      keywords: "",
      navStyle: "light",
    },
    components: [
      {
        name: "SwiperCarousel",
        props: {
          items: [
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/cases-banner.webp",
              title: "资讯中心",
              subtitle: "垂直于数字孪生、物联、建模领域的资讯整合",
              titleColor: "#ffffff",
              subtitleColor: "#ffffff",
            },
          ],
        },
      },
      {
        name: "ArticleDetail",
        props: {
          title: "${title}",
          createTime: "${create_time}",
          content: "${content}",
        },
      },
    ],
  },
  {
    id: "builtin-consultation",
    pageName: "咨询页面",
    pageRoute: "/consultation.html",
    layout: "default",
    meta: {
      title: "立即咨询 - 古河云科技",
      description: "留下您的联系方式，我们将尽快与您取得联系",
      keywords: "咨询,联系",
      navStyle: "light",
    },
    components: [
      {
        name: "ConsultationForm",
        props: {
          backgroundImage: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/consultation-jump-bg.webp",
          formTitle: "为您提供专属服务",
          formSubtitle: "表单将在提交后24小时内与您联系，敬请留意接听",
          nameLabel: "*姓名",
          contactLabel: "*联系方式",
          companyLabel: "企业名称",
          sceneLabel: "应用场景",
          namePlaceholder: "您的姓名",
          contactPlaceholder: "联系方式",
          companyPlaceholder: "企业名称",
          scenePlaceholder: "应用场景",
          submitText: "提交",
        },
      },
    ],
  },
  {
    id: "1",
    pageName: "首页",
    pageRoute: "/",
    layout: "default",
    meta: {
      title: "首页 - 古河云科技",
      description:
        "古河云科技以自研「开河智能中枢」为核心，深耕「AI+安全应急」领域，深度融合人工智能、大模型与数字孪生技术，为批发市场、物流仓储、能源行业、园区、交通、医疗、场馆等场景提供AI安全风险管理解决方案，助力企业重塑安全应急管理新范式。",
      keywords:
        "安全风险监测,监测预警,AI智能体,消防安全,视频监测,节能降耗,应急调度,电气安全,智能巡检,智慧园区,AI引擎,边缘计算,数字孪生,IBMS",
      navStyle: "dark",
    },
    components: [
      {
        name: "SwiperCarousel",
        props: {
          items: [
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/hero-banner.png",
              title: "看见不可见·守护未发生",
              subtitle: "物联感知 ｜AI分析｜孪生空间｜智能场景",
              description: "AI驱动的全场景主动安全防御生态构建者",
              primaryButton: {
                text: "了解更多",
                link: "/about.html",
                color: "#1578FF",
              },
              titleColor: "#ffffff",
              subtitleColor: "#ffffff",
            },
          ],
        },
      },
      {
        name: "CaseVideoShowcase",
        props: {
          title: "古河云标杆案例",
          subtitle: "一键了解古河云数字孪生技术",
          videoUrl: "https://qiniu.guhecloud.com/video/凤凰山0830长.mp4",
          thumbnail: "https://qiniu.guhecloud.com/imgs/components/carousel/6.png?imageView2/0/format/webp/q_74",
          duration: "1:10",
          playButtonText: "播放视频",
        },
      },
      {
        name: "EngineCards",
        props: {
          platformTitle: "开河智能中枢，让数据融合变得简单",
          title: "开河智能中枢",
          subtitle: "一主体，五核心，为客户构建AI安全分析大脑",
          description: "开放融合，开辟新河\n平台以中台化思想，云架构为核心，为企业构建一套可通用于业务拓展、三方系统融合业务底层支撑平台。",
          learnMoreLink: "/product-center/river.html",
          learnMoreText: "了解更多",
          items: [
            {
              icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/engine-twin.svg",
              name: "孪生引擎",
              description: "工具化能力封装，场景化构建，高仿真还原，通用与信创环境同时支持。",
              href: "/engines/twin",
            },
            {
              icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/engine-data.svg",
              name: "数据引擎",
              description: "整合多源异构数据，提供高效的数据存储和服务化能力。",
              href: "/engines/data",
            },
            {
              icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/engine-ai.svg",
              name: "AI引擎",
              description: "围绕安全监测等关键场景，实现快速预警建立，分析识别查准率达95%。",
              href: "/engines/ai",
            },
            {
              icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/engine-iot.svg",
              name: "物联引擎",
              description: "自研物联接入管理，主流协议接入支持80%以上，实现物模型高效联动处理。",
              href: "/engines/iot",
            },
            {
              icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/homepage/engine-business.svg",
              name: "业务引擎",
              description: "提供统一的API管理和调用方式，支持业务功能的复用和灵活组合。",
              href: "/engines/business",
            },
          ],
        },
      },
      {
        name: "ProductMatrix",
        props: {
          title: "深耕空间智能安全管理，构建一体化产品矩阵",
          subtitle: "基于开河智能中枢，一体化，深度构建多场景细分解决方案，并提供整合综合智能管理平台方案",
          softwareCategory: {
            name: "软件产品",
            items: [
              {
                name: "消防安全",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-fire.webp",
                href: "/programme/fire-safety.html",
              },
              {
                name: "电气安全",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-electric.webp",
                href: "/programme/electric-safety.html",
              },
              {
                name: "视频安全",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-video.webp",
                href: "/programme/video-safety.html",
              },
              {
                name: "智能巡检",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-patrol.webp",
                href: "/programme/smart-patrol.html",
              },
              {
                name: "节能降耗",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-energy.webp",
                href: "/programme/energy-saving.html",
              },
              {
                name: "监测预警",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-monitor.webp",
                href: "/programme/monitoring-early-warning.html",
              },
              {
                name: "AI智能体",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/ai-agent.webp",
                href: "/programme/ai-agent.html",
              },
              {
                name: "应急调度",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-dispatch.webp",
                href: "/programme/emergency-dispatch.html",
              },
              {
                name: "安全培训",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-training.webp",
                href: "/programme/safety-training.html",
              },
              {
                name: "肉类滑轨",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/software-meat.webp",
                href: "/programme/agriculture.html",
              },
            ],
          },
          hardwareCategory: {
            name: "硬件产品",
            items: [
              {
                name: "安防监控",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-security.webp",
                href: "/product-center/hardware.html",
              },
              {
                name: "消防安全",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-fire.webp",
                href: "/product-center/hardware.html",
              },
              {
                name: "电气安全",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-electric.webp",
                href: "/product-center/hardware.html",
              },
              {
                name: "考勤管理",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-attendance.webp",
                href: "/product-center/hardware.html",
              },
              {
                name: "机房动环",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-env.webp",
                href: "/product-center/hardware.html",
              },
              {
                name: "电子巡更",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-patrol.webp",
                href: "/product-center/hardware.html",
              },
              {
                name: "肉类滑轨",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/hardware-meat.webp",
                href: "/product-center/hardware.html",
              },
            ],
          },
          serviceCategory: {
            name: "服务产品",
            items: [
              {
                name: "建模服务",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/service-modeling.webp",
                href: "/product-center/modeling.html",
              },
              {
                name: "托管服务",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/service-managed.webp",
                href: "/product-center/managed.html",
              },
              {
                name: "个性化服务",
                icon: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/icons/product-matrix/service-customized.webp",
                href: "/product-center/customized.html",
              },
            ],
          },
        },
      },
      {
        name: "CaseShowcase",
        props: {
          title: "深度构建多场景细分解决方案",
          subtitle: "依托人工智能技术，助力企业轻松解决业务难点、卡点、堵点。",
          showIndicators: true,
          viewMoreLink: "/consultation.html",
          viewMoreText: "立即咨询",
          cases: [
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/case6.png",
              title: "智慧医院",
              subtitle: "打造孪生智慧医疗生态圈",
              href: "/programme/hospital.html",
            },
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/case2.png",
              title: "智慧高铁站",
              subtitle: "全新定义智慧交通「新速度」",
              href: "/programme/railway.html",
            },
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/case3.png",
              title: "智慧体育馆",
              subtitle: "加速迈进「虚实共生」的智慧场馆",
              href: "/programme/physical.html",
            },
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/case4.png",
              title: "智慧肉类滑轨",
              subtitle: "促进滑轨交易业务快速发展",
              href: "/programme/agriculture.html",
            },
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/case5.png",
              title: "智慧产业园",
              subtitle: "建设「全维思考」的智慧园区",
              href: "/programme/park.html",
            },
            {
              image: "https://cdn.homie.smallwai.com/homie/zee/ghy-test-static/images/cases/case1.png",
              title: "智慧场馆",
              subtitle: "加速迈进「虚实共生」的智慧场馆",
              href: "/industry/venue.html",
            },
          ],
        },
      },
      {
        name: "BusinessIconMarquee",
        props: {
          title: "众多企业数字化的优先选择",
          subtitle: "为500+企业伙伴提供全方位、先进的孪生空间管理服务",
          logos: [
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/1.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/2.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/3.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/4.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/5.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/6.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/7.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/8.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/9.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/10.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/11.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/12.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/13.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/14.png",
            "https://qiniu.guhecloud.com/imgs/components/bussinessicon/15.png",
          ],
        },
      },
      {
        name: "NewsSection",
        props: {
          title: "与您一起连接数字世界",
          subtitle: "了解行业新闻，拔高企业视角，古河云前沿阵地，快速了解硬核科技",
          viewMoreLink: "/information.html",
          viewMoreText: "查看更多",
          news: [],
          limit: 4,
        },
      },
    ],
  },
];

const MOCK_LAYOUT_OPTIONS: LayoutOption[] = [{ label: "default", value: "default" }];

export async function getMockPageDetail(id: string): Promise<PageFormData | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = MOCK_PAGES.find((p) => p.id === id);
      resolve(page ? { ...page, components: page.components.map((c) => ({ ...c })) } : null);
    }, 300);
  });
}

export async function saveMockPage(data: PageFormData): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.id) {
        const index = MOCK_PAGES.findIndex((p) => p.id === data.id);
        if (index > -1) {
          MOCK_PAGES[index] = { ...data };
        }
      } else {
        const newPage: PageFormData = {
          ...data,
          id: String(MOCK_PAGES.length + 1),
        };
        MOCK_PAGES.push(newPage);
      }
      resolve();
    }, 300);
  });
}

export async function getMockLayoutOptions(): Promise<LayoutOption[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_LAYOUT_OPTIONS]), 300);
  });
}

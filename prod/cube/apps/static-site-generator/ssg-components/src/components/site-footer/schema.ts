export const schema = {
  name: "SiteFooter",
  title: "网站页脚",
  description: "站点底部页脚，含导航、联系方式、友情链接、二维码",
  interactive: false,
  props: {
    logo: {
      type: "string" as const,
      required: false,
      label: "Logo 图片",
      defaultValue: "https://placehold.co/320x80/ffffff/1578FF?text=LOGO",
      editor: "image" as const,
    },
    slogan: { type: "string" as const, required: false, label: "标语文本", defaultValue: "看见不可见，守护未发生！" },
    phone: { type: "string" as const, required: false, label: "咨询热线 (兼容)", defaultValue: "400-000-0000" },
    email: { type: "string" as const, required: false, label: "公司邮箱 (兼容)", defaultValue: "service@example.com" },
    managerName: { type: "string" as const, required: false, label: "总经理姓名", defaultValue: "示例经理" },
    managerPhone: { type: "string" as const, required: false, label: "总经理电话", defaultValue: "138-0000-0000" },
    companyAddress: { type: "string" as const, required: false, label: "公司地址", defaultValue: "成都市高新区示例大道 88 号" },
    copyrightYear: { type: "string" as const, required: false, label: "版权年份前缀", defaultValue: "2017" },
    copyrightCompany: { type: "string" as const, required: false, label: "版权公司名称", defaultValue: "成都古河云科技有限公司" },
    icp: { type: "string" as const, required: false, label: "ICP备案号", defaultValue: "蜀ICP备0000000号" },
    icpLink: { type: "string" as const, required: false, label: "ICP备案链接", defaultValue: "https://beian.miit.gov.cn/" },
    contactTitle: { type: "string" as const, required: false, label: "联系区块标题", defaultValue: "联系我们" },
    friendLinkTitle: { type: "string" as const, required: false, label: "友情链接标题", defaultValue: "友情链接" },
    qrCodes: {
      type: "array" as const,
      required: false,
      label: "二维码列表",
      defaultValue: [
        {
          image: "https://placehold.co/240x240/ffffff/1578FF?text=QR",
          label: "扫码关注\n官方账号",
        },
      ],
      itemType: {
        image: { type: "string" as const, required: true, label: "二维码图片", editor: "image" as const },
        label: { type: "string" as const, required: false, label: "二维码说明" },
      },
    },
    socialLinks: {
      type: "array" as const,
      required: false,
      label: "社交媒体图标",
      defaultValue: [
        {
          name: "微信",
          url: "#",
          icon: "https://placehold.co/64x64/22334b/ffffff?text=W",
          hoverIcon: "https://placehold.co/64x64/ffffff/1578FF?text=W",
        },
      ],
      itemType: {
        name: { type: "string" as const, required: true, label: "平台名称" },
        url: { type: "string" as const, required: true, label: "链接地址" },
        icon: { type: "string" as const, required: false, label: "图标", editor: "image" as const },
        hoverIcon: { type: "string" as const, required: false, label: "悬停图标", editor: "image" as const },
      },
    },
    navGroups: {
      type: "array" as const,
      required: false,
      label: "站内链接分组",
      defaultValue: [
        {
          title: "关于公司",
          links: [
            { name: "公司介绍", url: "/about.html" },
            { name: "联系我们", url: "/contact.html" },
          ],
        },
        {
          title: "产品中心",
          links: [
            { name: "产品概览", url: "/products.html" },
            { name: "解决方案", url: "/solutions.html" },
          ],
        },
      ],
      itemType: {
        title: { type: "string" as const, required: true, label: "分组标题" },
        links: {
          type: "array" as const,
          required: true,
          label: "链接列表",
          defaultValue: [],
          itemType: {
            name: { type: "string" as const, required: true, label: "链接名称" },
            url: { type: "string" as const, required: true, label: "链接地址" },
          },
        },
      },
    },
    friendLinks: {
      type: "array" as const,
      required: false,
      label: "友情链接",
      defaultValue: [{ name: "合作伙伴", url: "#" }],
      itemType: {
        name: { type: "string" as const, required: true, label: "网站名称" },
        url: { type: "string" as const, required: true, label: "链接地址" },
      },
    },
    contacts: {
      type: "array" as const,
      required: false,
      label: "联系方式列表（推荐）",
      defaultValue: [
        { label: "咨询热线", value: "400-000-0000", href: "tel:4000000000" },
        { label: "公司邮箱", value: "service@example.com", href: "mailto:service@example.com" },
      ],
      itemType: {
        label: { type: "string" as const, required: true, label: "联系类型" },
        value: { type: "string" as const, required: true, label: "联系内容" },
        href: { type: "string" as const, required: false, label: "超链接" },
      },
    },
    offices: {
      type: "array" as const,
      required: false,
      label: "联系方式列表（兼容）",
      itemType: {
        label: { type: "string" as const, required: true, label: " office 名称" },
        contact: { type: "string" as const, required: true, label: "联系方式" },
      },
      defaultValue: [
        { label: "北京办公室", contact: "010-0000-0000" },
        { label: "成都总部", contact: "028-0000-0000" },
      ],
    },
  },
} as const;

import type { DefaultTheme, HeadConfig, UserConfig } from 'vitepress'
import * as path from 'path'
import vueJsx from '@vitejs/plugin-vue-jsx'
import eslintPlugin from 'vite-plugin-eslint'
import { demoPreviewPlugin } from '../code/components/demo-preview/plugins/demo-preview'

function head (): HeadConfig[] {
  return [
    ['link', { href: '/favicon.ico', rel: 'icon', type: 'image/svg+xml' }],
    [
      'meta',
      {
        content:
          'width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no',
        name: 'viewport',
      },
    ],
    ['link', { href: '/favicon.ico', rel: 'icon' }],
    ['script', { src: '/lib/tailwind-css-4.js' }],
  ]
}

function nav (): DefaultTheme.NavItem[] {
  return [
    {
      link: '/',
      text: '首页',
    },
    {
      text: '文档',
      items: [
        {
          text: '指南',
          link: '/guide/cube-introduction',
        },
        {
          text: '开河基建',
          link: '/infrastructure/cube-ui',
        },
        {
          text: '业务PC端',
          link: '/development/pc/base-components/modal',
        },
        {
          text: '业务移动端',
          link: '/development/mobile',
        },
        {
          text: '可视化端',
          link: '/development/visualization',
        },
      ],
    },
    {
      text: '🦄 工具支持',
      items: [
        {
          link: '/plugins/chrome',
          text: 'Chrome 插件',
        },
        {
          link: '/plugins/product-maker',
          text: '制品工具',
        }
      ]
    },
    // {
    //   text: '其他',
    //   items: [
    //     {
    //       link: '/',
    //       text: '建设中',
    //     },
    //   ]
    // }
  ]
}

function sidebar (): DefaultTheme.Sidebar {
  return {
    '/guide/': [
      {
        text: '入门',
        base: '/guide/',
        items: [
          { text: '什么是开河平台', link: 'cube-introduction' },
          { text: '开河平台前端架构', link: 'cube-frontend-architecture' }
        ]
      },
      {
        text: '开发准备',
        base: '/guide/',
        items: [
          { text: '运行环境', link: 'cube-introduction' },
          {
            text: 'IDE 配置',
            items: [
              { text: '插件安装', link: 'ide-plugins' },
              { text: 'Eslint 校验', link: 'ide-eslint' },
            ]
          }
        ]
      },
      {
        text: '开发规范',
        base: '/guide/',
        items: [
          { text: '开发流程', link: 'cube-introduction' },
          { text: '协作规范', link: 'cube-introduction' },
          { text: '提交规范', link: 'cube-introduction' },
          { text: '设计规范', link: 'cube-introduction' },
          { text: '发布规范', link: 'cube-introduction' },
        ]
      },
    ],
    '/infrastructure/': [
      {
        text: '基础建设',
        base: '/infrastructure/',
        items: [
          { text: 'Cube-UI', link: 'cube-ui' },
          { text: '桥接 SDK', link: 'bridge' },
          { text: '地图 SDK', link: 'cube-introduction' },
          { text: '孪生 SDK', link: 'cube-introduction' },
          { text: '字典服务', link: 'cube-introduction' },
          { text: 'Console日志', link: 'cube-introduction' },
          { text: '业务主应用事件总线', link: 'cube-introduction' },
          { text: '物联 web socket', link: 'cube-introduction' },
          { text: '消息 web socket', link: 'cube-introduction' },
          { text: '常用工具函数封装', link: 'cube-introduction' },
          { text: '前端运维', link: 'cube-introduction' },
        ]
      },
    ],
    '/development/': [
      {
        text: '业务PC端',
        base: '/development/pc',
        items: [
          { text: '应用创建', link: 'chrome' },
          { text: '主题色配置', link: 'product-maker' },
          { text: '基础组件', link: '/base-components/modal' },
        ]
      },
      {
        text: '业务移动端',
        base: '/development/mobile',
        items: [
          { text: '应用创建', link: 'chrome' },
          { text: '主题色配置', link: 'product-maker' },
          { text: '业务组件', link: 'product-maker' },
          { text: '桥接能力', link: '/bridge' },
        ]
      },
      {
        text: '可视化端',
        base: '/development/',
        items: [
          { text: '模型交互', link: 'chrome' },
          { text: '卡片开发', link: 'product-maker' },
          { text: 'BI 配置', link: 'product-maker' },
        ]
      },
    ],
    '/plugins/': [
      {
        text: '工具支持',
        base: '/plugins/',
        items: [
          { text: 'Chrome 插件', link: 'chrome' },
          { text: '制品工具', link: 'product-maker' }
        ]
      }
    ]
  }
}

export const vitePressConfig: UserConfig<DefaultTheme.Config> = {
  appearance: false,
  srcDir: './src',
  title: 'Ghcloud Frontend',
  description: '',
  head: head(),
  markdown: {
    preConfig (md) {
      md.use(demoPreviewPlugin)
    },
  },
  themeConfig: {
    logo: '/favicon.ico',
    nav: nav(),
    sidebar: sidebar(),
    docFooter: {
      next: '下一页',
      prev: '上一页',
    },
    socialLinks: [
      {
        icon: {
          svg: '<svg t="1741885606970" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3676" width="200" height="200"><path d="M932.317184 567.76704L885.10464 422.46144l-93.57312-287.997952c-4.8128-14.81728-25.776128-14.81728-30.590976 0L667.36128 422.459392H356.62848L263.051264 134.46144c-4.8128-14.81728-25.776128-14.81728-30.593024 0l-93.57312 287.997952-47.210496 145.309696a32.165888 32.165888 0 0 0 11.68384 35.96288l408.6272 296.890368L920.61696 603.734016c11.272192-8.192 15.990784-22.71232 11.68384-35.964928" fill="#FC6D26" p-id="3677"></path><path d="M512.002048 900.62848l155.365376-478.171136H356.634624z" fill="#E24329" p-id="3678"></path><path d="M512.004096 900.62848L356.63872 422.47168H138.901504z" fill="#FC6D26" p-id="3679"></path><path d="M138.891264 422.465536l-47.214592 145.309696a32.16384 32.16384 0 0 0 11.685888 35.96288L511.991808 900.62848z" fill="#FCA326" p-id="3680"></path><path d="M138.893312 422.459392h217.737216L263.053312 134.46144c-4.8128-14.819328-25.778176-14.819328-30.590976 0z" fill="#E24329" p-id="3681"></path><path d="M512.002048 900.62848l155.365376-478.154752H885.10464z" fill="#FC6D26" p-id="3682"></path><path d="M885.11488 422.465536l47.214592 145.309696a32.16384 32.16384 0 0 1-11.685888 35.96288L512.014336 900.62848z" fill="#FCA326" p-id="3683"></path><path d="M885.096448 422.459392H667.36128l93.577216-287.997952c4.814848-14.819328 25.778176-14.819328 30.590976 0z" fill="#E24329" p-id="3684"></path></svg>',
        },
        link: 'http://git.guhecloud.com:8000/ghcloud/ghcloud'
      }
    ],
    // 站点页脚配置
    footer: {
      message: '探索智慧新空间',
      copyright: 'Copyright © 2017-present Ghcloud Frontend',
    },
  },
  vite: {
    plugins: [
      vueJsx(),
      // eslintPlugin({
      //   include: ['src/**/*.{ts,tsx}', '.vitepress/**/*.{ts}', '*.mts'],
      // }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
        '@code': path.resolve(__dirname, '../code'),
        '@ghcloud/cube-theme': path.resolve(__dirname, '../node_modules/@ghcloud/cube-theme'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@cube-ui-prefix': 'cube-docs',
            '@ant-prefix': 'cube-docs',
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': 'cube-docs',
            '@cube-theme-antd3-scope-selector': '#app'
          },
          javascriptEnabled: true
        }
      },
    },
    ssr: {
      noExternal: ['ant-design-vue', '@ant-design/icons-vue'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://192.168.0.240:8848',
          changeOrigin: true,
        }
      }
    }
  },
}

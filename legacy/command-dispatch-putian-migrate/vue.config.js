const path = require("path");

const Timestamp = new Date().getTime();
module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  publicPath: process.env.PUBLIC_PATH || '',
  configureWebpack: {
    // webpack 配置
    output: {
      // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
      filename: `[name].${Timestamp}.js`,
      chunkFilename: `[name].${Timestamp}.js`,
    },
    externals: {
      vue: "Vue",
      vuex: "Vuex",
      "vue-router": "VueRouter",
      AMap: "AMap",
    },
  },
  chainWebpack: (config) => {
    // 强制 less 规则使用本项目 resolve 的 less-loader（7.x），避免 workspace 中 webpack5 版本导致 this.getOptions 报错
    const projectLessLoader = require.resolve("less-loader", { paths: [__dirname] });
    ["vue-modules", "vue", "normal-modules", "normal"].forEach((oneOf) => {
      config.module.rule("less").oneOf(oneOf).use("less-loader").loader(projectLessLoader);
    });

    const svgRule = config.module.rule("svg");
    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear();
    svgRule
      .test(/\.svg$/)
      .include.add(path.resolve(__dirname, "./src/assets/icons/svgs"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      });
    const fileRule = config.module.rule("file");
    fileRule.uses.clear();
    fileRule
      .test(/\.svg$/)
      .exclude.add(path.resolve(__dirname, "./src/assets/icons/svgs"))
      .end()
      .use("file-loader")
      .loader("file-loader");
    // // 去掉 path上的fill
    // config.module
    //   .rule('svgo')
    //   .test(/\.svg$/)
    //   .use('svgo-loader')
    //   .loader('svgo-loader')
    //   .tap((options) => ({
    //     ...options,
    //     plugins: [{ removeAttrs: { attrs: 'fill' } }],
    //   }))
    //   .end();
    // 使用 less-loader 的 additionalData 替代 style-resources-loader，避免 webpack5 下 getOptions 不兼容
    // const types = ["vue-modules", "vue", "normal-modules", "normal"];
    // types.forEach((type) =>
    //   addStyleResource(config.module.rule("less").oneOf(type))
    // );
  },
  devServer: {
    // host: "localhost",
    port: 8082, // 端口号
    https: false, // https:{type:Boolean}
    // open: true, //配置自动启动浏览器
    //配置跨域
    proxy: {
      "/api": {
        // 要代理的地址
        target: process.env.VUE_APP_SERVICE_URL,
        // ws: true,
        //允许跨域
        changeOrigin: true,
        // 如果是https接口的话，需要配置这个参数
        secure: true,
        //重写接口
        pathRewrite: {
          "^/api": "",
        },
      },
      "/filesource": {
        target: process.env.VUE_APP_FILE_SOURCE,
        // ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/filesource": "",
        },
      },
      "/bimresource": {
        target: process.env.VUE_APP_BIM_SOURCE,
        changeOrigin: true,
        pathRewrite: {
          "^/bimresource": "",
        },
      },
    },
    before(app) {
      app.get("*.gz", function (req, res, next) {
        res.setHeader("Content-Encoding", "gzip");
        next();
      });
    },
  },
  css: {
    loaderOptions: {
      less: {
        additionalData: `@import "${path.resolve(__dirname, "src/styles/theme/color.less")}";`,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },
};

// 已改用 css.loaderOptions.less.additionalData 注入全局 less，不再使用 style-resources-loader
// function addStyleResource(rule) {
//   rule
//     .use("style-resource")
//     .loader("style-resources-loader")
//     .options({
//       patterns: [
//         path.resolve(__dirname, "src/styles/index.less"),
//       ],
//     });
// }

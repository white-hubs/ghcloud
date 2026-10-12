const path = require("path");
// function resolve(dir) {
//   return path.join(__dirname, dir);
// }
module.exports = {
  publicPath: process.env.BUILD_PUBLIC_PATH,
  chainWebpack: (config) => {
    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
    svgRule.use("svg-sprite-loader").loader("svg-sprite-loader").options({
      symbolId: "icon-[name]",
    });
    const types = ["vue-modules", "vue", "normal-modules", "normal"];
    types.forEach((type) =>
      addStyleResource(config.module.rule("less").oneOf(type))
    );
  },
  devServer: {
    // host: "localhost",
    port: 8083, // 端口号
    https: false, // https:{type:Boolean}
    // open: true, //配置自动启动浏览器
    //配置跨域
    proxy: {
      "/api": {
        // 要代理的地址
        target: process.env.SERVICE_URL,
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
    },
  },
};

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [
        path.resolve(__dirname, "src/styles/index.less"), // 需要全局导入的less
      ],
    });
}

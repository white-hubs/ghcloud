const path = require("path");
const { generateTheme } = require("antd-theme-generator");
// ant-design-vue/dist/antd.less
const options = {
  antDir: path.join(__dirname, "./node_modules/ant-design-vue"), //antd包目录
  stylesDir: path.join(__dirname, "./src/styles"), //自己写的样式目录
  varFile: path.join(__dirname, "./src/styles/variables.less"), //自定义样式入口文件
  mainLessFile: path.join(__dirname, "./src/styles/index.less"), //自定义样式入口文件
  themeVariables: [
    //需要改写的antd主题变量
    "@primary-color", //基础颜色
    "@text-color", //文本颜色，如果不更改，将会和primary-color保持一致
    "@text-color-secondary",
    "@heading-color",
    "@layout-body-background", //body背景色
    "@btn-primary-bg",
    "@layout-header-background",
  ],
  indexFileName: "index.html",
  outputFilePath: path.join(__dirname, "./public/color.less"), //输出less文件路径
};
generateTheme(options)
  .then(() => {
    console.log("Theme generated successfully");
  })
  .catch((error) => {
    console.log("Error", error);
  });

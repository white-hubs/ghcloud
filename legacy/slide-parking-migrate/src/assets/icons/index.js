let allIcons = [];
// 导入所有png文件
let contexts = require.context("./", true, /\.png$/);
let reg = new RegExp("([^/.]+)[.]");

contexts.keys().forEach((key) => {
  const name = reg.exec(key)[1];
  const icon = contexts(key);
  allIcons.push({
    name: name,
    src: icon,
    type: "png",
  });
});


export default allIcons;



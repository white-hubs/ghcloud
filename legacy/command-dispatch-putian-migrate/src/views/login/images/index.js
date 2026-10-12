let allJpg = [];
// 导入所有jpg文件
let contexts = require.context("./", true, /\.jpg$/);
// let reg = new RegExp('([^/.]+)[.]');
contexts.keys().forEach((key) => {
  allJpg.push(contexts(key));
});

export default allJpg;

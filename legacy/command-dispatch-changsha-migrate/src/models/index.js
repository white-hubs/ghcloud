import _ from "lodash";

const models = {};

// 使用 import.meta.glob 导入所有 .js 文件（排除 index.js 和 common）
const modules = import.meta.glob("./**/*.js", { eager: true });

Object.entries(modules).forEach(([path, module]) => {
  // 提取文件名（不带扩展名）
  const modelName = _.last(path.split("/")).replace(".js", "");

  // 排除条件：不是 index.js 且不是 common 且有默认导出且是函数
  if (!path.includes("index.js") && !path.includes("common") && module.default && _.isFunction(module.default)) {
    models[modelName] = module.default;
  }
});

export default models;

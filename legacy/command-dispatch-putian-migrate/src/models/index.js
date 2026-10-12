import _ from "lodash";
let models = {};
let contexts = require.context("./", true, /\.js$/);
contexts.keys().forEach((key) => {
  let model = contexts(key);
  const modelName = _.last(key.split("/")).replace(".js", "");
  if (
    !key.includes("index.js") &&
    !key.includes("common") &&
    _.isFunction(model.default)
  ) {
    models[modelName] = model.default;
  }
});
export default models;

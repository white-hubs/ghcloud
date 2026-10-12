
import _ from "lodash";
let models = {};
// let contexts =  import.meta.glob('./**/*.js')
// for (const key in contexts) {
//   const modelName = _.last(key.split("/")).replace(".js", "");
//   if (
//     !key.includes("index.js") &&
//     !key.includes("common") &&
//     _.isFunction(contexts[key])
//   ) {
//     models[modelName] = contexts[key].default;
//   }
// }
export default models;
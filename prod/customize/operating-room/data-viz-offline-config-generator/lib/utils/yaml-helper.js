import { readFileSync } from 'fs';
import { load } from 'js-yaml';


/** yaml读取 */
const reader = (filePath) => {
  try {
    // 读取 YAML 文件内容  
    const fileContents = readFileSync(filePath, 'utf8');

    // 解析 YAML 内容  
    const data = load(fileContents);

    return data
  } catch (e) {
  }
}

export default {
  reader
}


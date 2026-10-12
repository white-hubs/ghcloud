const ZD_ICON_BASE = '/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg'
const IconKeyPlace = `${ZD_ICON_BASE}/key-place.svg`

// 可用的图标列表
export const availableIcons: Record<string, string> = {
  '公厕': `${ZD_ICON_BASE}/公厕.svg`,
  '公园': `${ZD_ICON_BASE}/公园.svg`,
  '垃圾转运站': `${ZD_ICON_BASE}/垃圾转运站.svg`,
  '政府事业单位': `${ZD_ICON_BASE}/政府事业单位.svg`,
  '社区工作站': `${ZD_ICON_BASE}/社区工作站.svg`
}

// 关键词映射，用于提高匹配准确度
const keywordMap = {
  // 公厕相关关键词
  '厕所': '公厕',
  '男厕': '公厕',
  '女厕': '公厕',
  '卫生间': '公厕',
  'toilet': '公厕',
  'wc': '公厕',
  
  // 公园相关关键词
  '花园': '公园',
  '绿地': '公园',
  '休闲区': '公园',
  'park': '公园',
  'garden': '公园',
  
  // 垃圾转运站相关关键词
  '垃圾站': '垃圾转运站',
  '垃圾处理': '垃圾转运站',
  '垃圾': '垃圾转运站',
  'rubbish': '垃圾转运站',
  'garbage': '垃圾转运站',
  
  // 政府事业单位相关关键词
  '政府': '政府事业单位',
  '政企单位': '政府事业单位',
  '事业单位': '政府事业单位',
  '机关': '政府事业单位',
  'government': '政府事业单位',
  'institution': '政府事业单位',
  
  // 社区工作站相关关键词
  '社区': '社区工作站',
  '工作站': '社区工作站',
  '社区服务': '社区工作站',
  'community': '社区工作站',
  'station': '社区工作站'
}

// 计算Levenshtein距离（编辑距离）的函数
export const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // 初始化矩阵
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 删除
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// 计算相似度（0-1之间，1表示完全相同）
export const calculateSimilarity = (a: string, b: string): number => {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

// 检查名称是否包含某个关键词
const containsKeyword = (name: string, keyword: string): boolean => {
  return name.toLowerCase().includes(keyword.toLowerCase());
};

// 根据名称找到最匹配的图标
export const findBestMatchingIcon = (name: string): any => {
  if (!name) return IconKeyPlace;
  
  // 1. 首先检查是否直接匹配图标名称
  if (availableIcons[name]) {
    return availableIcons[name];
  }
  
  // 2. 检查是否匹配关键词映射
  const lowerName = name.toLowerCase();
  for (const [keyword, iconName] of Object.entries(keywordMap)) {
    if (containsKeyword(lowerName, keyword)) {
      return availableIcons[iconName];
    }
  }
  
  // 3. 使用编辑距离进行模糊匹配
  let bestMatch = '';
  let highestSimilarity = -1;

  // 计算与每个图标名称的相似度
  Object.keys(availableIcons).forEach(iconName => {
    const similarity = calculateSimilarity(name, iconName);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = iconName;
    }
  });

  // 如果相似度低于阈值，使用默认图标
  return highestSimilarity > 0.3 ? availableIcons[bestMatch] : IconKeyPlace
}
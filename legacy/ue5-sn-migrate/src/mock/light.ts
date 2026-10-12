
interface Option {
  label: string;
  value: number;
  color?: string;
  img?: string;
  open?: number;
  close?: number;
  data?: number[];
  rate:number;
}
// 设备实时数据
export const getDevicePeriod = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "正常", value: 70, color: "#FFAB10" },
          { label: "离线", value: 10, color: "#2F8DFF" },
          { label: "故障", value: 20, color: "#F14545" },
          { label: "报警", value: 55, color: "#19F8F7" },
        ],
        'THIS_WEEK': [
          { label: "正常", value: 150, color: "#FFAB10" },
          { label: "离线", value: 22, color: "#2F8DFF" },
          { label: "故障", value: 50, color: "#F14545" },
          { label: "报警", value: 10, color: "#19F8F7" },
        ],
        'THIS_MONTH': [
          { label: "正常", value: 230, color: "#FFAB10" },
          { label: "离线", value: 150, color: "#2F8DFF" },
          { label: "故障", value: 131, color: "#F14545" },
          { label: "报警", value: 156, color: "#19F8F7" },
        ],
        'THIS_YEAR': [
          { label: "正常", value: 562, color: "#FFAB10" },
          { label: "离线", value: 204, color: "#2F8DFF" },
          { label: "故障", value: 220, color: "#F14545" },
          { label: "报警", value: 268, color: "#19F8F7" },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "正常", value: 130, color: "#FFAB10" },
        { label: "离线", value: 110, color: "#2F8DFF" },
        { label: "故障", value: 50, color: "#F14545" },
        { label: "报警", value: 45, color: "#19F8F7" },
      ],
      'THIS_WEEK': [
        { label: "正常", value: 158, color: "#FFAB10" },
        { label: "离线", value: 62, color: "#2F8DFF" },
        { label: "故障", value: 57, color: "#F14545" },
        { label: "报警", value: 68, color: "#19F8F7" },
      ],
      'THIS_MONTH': [
        { label: "正常", value: 230, color: "#FFAB10" },
        { label: "离线", value: 59, color: "#2F8DFF" },
        { label: "故障", value: 80, color: "#F14545" },
        { label: "报警", value: 96, color: "#19F8F7" },
      ],
      'THIS_YEAR': [
        { label: "正常", value: 362, color: "#FFAB10" },
        { label: "离线", value: 254, color: "#2F8DFF" },
        { label: "故障", value: 120, color: "#F14545" },
        { label: "报警", value: 108, color: "#19F8F7" },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "正常", value: 65, color: "#FFAB10" },
        { label: "离线", value: 24, color: "#2F8DFF" },
        { label: "故障", value: 27, color: "#F14545" },
        { label: "报警", value: 58, color: "#19F8F7" },
      ],
      'THIS_WEEK': [
        { label: "正常", value: 251, color: "#FFAB10" },
        { label: "离线", value: 122, color: "#2F8DFF" },
        { label: "故障", value: 57, color: "#F14545" },
        { label: "报警", value: 65, color: "#19F8F7" },
      ],
      'THIS_MONTH': [
        { label: "正常", value: 340, color: "#FFAB10" },
        { label: "离线", value: 50, color: "#2F8DFF" },
        { label: "故障", value: 31, color: "#F14545" },
        { label: "报警", value: 56, color: "#19F8F7" },
      ],
      'THIS_YEAR': [
        { label: "正常", value: 462, color: "#FFAB10" },
        { label: "离线", value: 24, color: "#2F8DFF" },
        { label: "故障", value: 112, color: "#F14545" },
        { label: "报警", value: 68, color: "#19F8F7" },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 群控组实时数据
export const getGroupControl = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "群控组总数", value: 0 },
          { label: "控制回路数", value: 10 },
          { label: "开启回路数", value: 20 },
          { label: "关闭回路数", value: 55 },
        ],
        'THIS_WEEK': [
          { label: "群控组总数", value: 0 },
          { label: "控制回路数", value: 22 },
          { label: "开启回路数", value: 60 },
          { label: "关闭回路数", value: 80 },
        ],
        'THIS_MONTH': [
          { label: "群控组总数", value: 0 },
          { label: "控制回路数", value: 145 },
          { label: "开启回路数", value: 159 },
          { label: "关闭回路数", value: 176 },
        ],
        'THIS_YEAR': [
          { label: "群控组总数", value: 0 },
          { label: "控制回路数", value: 215 },
          { label: "开启回路数", value: 250 },
          { label: "关闭回路数", value: 268 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 110 },
        { label: "开启回路数", value: 120 },
        { label: "关闭回路数", value: 155 },
      ],
      'THIS_WEEK': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 122 },
        { label: "开启回路数", value: 160 },
        { label: "关闭回路数", value: 180 },
      ],
      'THIS_MONTH': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 145 },
        { label: "开启回路数", value: 159 },
        { label: "关闭回路数", value: 176 },
      ],
      'THIS_YEAR': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 215 },
        { label: "开启回路数", value: 250 },
        { label: "关闭回路数", value: 228 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 210 },
        { label: "开启回路数", value: 210 },
        { label: "关闭回路数", value: 255 },
      ],
      'THIS_WEEK': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 222 },
        { label: "开启回路数", value: 160 },
        { label: "关闭回路数", value: 180 },
      ],
      'THIS_MONTH': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 195 },
        { label: "开启回路数", value: 259 },
        { label: "关闭回路数", value: 176 },
      ],
      'THIS_YEAR': [
        { label: "群控组总数", value: 0 },
        { label: "控制回路数", value: 225 },
        { label: "开启回路数", value: 250 },
        { label: "关闭回路数", value: 268 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 时控实时数据
export const getTimeControl = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "计划成功数", value: 52, rate: 0.5 },
          { label: "待执行计划数", value: 10, rate: 0.5 },
          { label: "计划失败", value: 20, rate: 0.5 },
        ],
        'THIS_WEEK': [
          { label: "计划成功数", value: 62, rate: 0.5 },
          { label: "待执行计划数", value: 30, rate: 0.5 },
          { label: "计划失败", value: 26, rate: 0.5 },
        ],
        'THIS_MONTH': [
          { label: "计划成功数", value: 175, rate: 0.5 },
          { label: "待执行计划数", value: 118, rate: 0.5 },
          { label: "计划失败", value: 130, rate: 0.5 },
        ],
        'THIS_YEAR': [
          { label: "计划成功数", value: 282, rate: 0.5 },
          { label: "待执行计划数", value: 250, rate: 0.5 },
          { label: "计划失败", value: 227, rate: 0.5 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "计划成功数", value: 92 ,rate:0.5},
        { label: "待执行计划数", value: 50 ,rate:0.5},
        { label: "计划失败", value: 60 ,rate:0.5},
      ],
      'THIS_WEEK': [
        { label: "计划成功数", value: 102,rate:0.5 },
        { label: "待执行计划数", value: 70 ,rate:0.5},
        { label: "计划失败", value: 76 ,rate:0.5},
      ],
      'THIS_MONTH': [
        { label: "计划成功数", value: 105 ,rate:0.5},
        { label: "待执行计划数", value: 168 ,rate:0.5},
        { label: "计划失败", value: 190 ,rate:0.5},
      ],
      'THIS_YEAR': [
        { label: "计划成功数", value: 212 ,rate:0.5},
        { label: "待执行计划数", value: 290,rate:0.5 },
        { label: "计划失败", value: 267 ,rate:0.5},
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "计划成功数", value: 52,rate:0.5 },
        { label: "待执行计划数", value: 20,rate:0.5 },
        { label: "计划失败", value: 25,rate:0.5 },
      ],
      'THIS_WEEK': [
        { label: "计划成功数", value: 162,rate:0.5 },
        { label: "待执行计划数", value: 130 ,rate:0.5},
        { label: "计划失败", value: 126,rate:0.5 },
      ],
      'THIS_MONTH': [
        { label: "计划成功数", value: 175 ,rate:0.5},
        { label: "待执行计划数", value: 118,rate:0.5 },
        { label: "计划失败", value: 130,rate:0.5 },
      ],
      'THIS_YEAR': [
        { label: "计划成功数", value: 282 ,rate:0.5},
        { label: "待执行计划数", value: 170,rate:0.5 },
        { label: "计划失败", value: 227 ,rate:0.5},
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 设备分类统计
export const getDeviceClass = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "泛光照明", value: 52 },
          { label: "智能照明", value: 10 },
        ],
        'THIS_WEEK': [
          { label: "泛光照明", value: 62 },
          { label: "智能照明", value: 30 },
        ],
        'THIS_MONTH': [
          { label: "泛光照明", value: 175 },
          { label: "智能照明", value: 118 },
        ],
        'THIS_YEAR': [
          { label: "泛光照明", value: 282 },
          { label: "智能照明", value: 250 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "泛光照明", value: 92 },
        { label: "智能照明", value: 50 },
      ],
      'THIS_WEEK': [
        { label: "泛光照明", value: 102 },
        { label: "智能照明", value: 70 },
      ],
      'THIS_MONTH': [
        { label: "泛光照明", value: 105 },
        { label: "智能照明", value: 168 },
      ],
      'THIS_YEAR': [
        { label: "泛光照明", value: 212 },
        { label: "智能照明", value: 290 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "泛光照明", value: 52 },
        { label: "智能照明", value: 20 },
      ],
      'THIS_WEEK': [
        { label: "泛光照明", value: 162 },
        { label: "智能照明", value: 130 },
      ],
      'THIS_MONTH': [
        { label: "泛光照明", value: 175 },
        { label: "智能照明", value: 118 },
      ],
      'THIS_YEAR': [
        { label: "泛光照明", value: 282 },
        { label: "智能照明", value: 170 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 照明回路实况
export const getLoopData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "泛光照明", open: 10, close: 2 },
          { label: "智能照明", open: 16, close: 4 },
        ],
        'THIS_WEEK': [
          { label: "泛光照明", open: 25, close: 10 },
          { label: "智能照明", open: 26, close: 13 },
        ],
        'THIS_MONTH': [
          { label: "泛光照明", open: 50, close: 22 },
          { label: "智能照明", open: 66, close: 14 },
        ],
        'THIS_YEAR': [
          { label: "泛光照明", open: 110, close: 92 },
          { label: "智能照明", open: 116, close: 84 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "泛光照明", open: 110, close: 52 },
        { label: "智能照明", open: 216, close: 84 },
      ],
      'THIS_WEEK': [
        { label: "泛光照明", open: 200, close: 122 },
        { label: "智能照明", open: 168, close: 54 },
      ],
      'THIS_MONTH': [
        { label: "泛光照明", open: 108, close: 82 },
        { label: "智能照明", open: 326, close: 104 },
      ],
      'THIS_YEAR': [
        { label: "泛光照明", open: 410, close: 202 },
        { label: "智能照明", open: 416, close: 124 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "泛光照明", open: 105, close: 101 },
        { label: "智能照明", open: 16, close: 94 },
      ],
      'THIS_WEEK': [
        { label: "泛光照明", open: 150, close: 172 },
        { label: "智能照明", open: 156, close: 124 },
      ],
      'THIS_MONTH': [
        { label: "泛光照明", open: 130, close: 192 },
        { label: "智能照明", open: 186, close: 184 },
      ],
      'THIS_YEAR': [
        { label: "泛光照明", open: 210, close: 152 },
        { label: "智能照明", open: 316, close: 154 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 照明能耗分析
export const getlightAnalysis = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "泛光照明", data: [82, 85, 75, 76, 78, 98, 85, 72, 85, 73, 86, 78, 98, 85, 82, 75, 83, 96, 78, 98, 75, 82, 85, 83] },
          { label: "智能照明", data: [54, 45, 56, 58, 59, 55, 55, 64, 55, 56, 58, 59, 55, 55, 54, 45, 56, 58, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "泛光照明", data: [176, 115, 135, 123, 140, 220, 115] },
          { label: "智能照明", data: [156, 165, 155, 173, 180, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "泛光照明", data: [117, 115, 133, 139, 128, 128, 125, 122, 125, 113, 116, 108, 108, 115, 112, 115] },
          { label: "智能照明", data: [184, 185, 176, 158, 157, 155, 155, 154, 155, 166, 168, 169, 185, 175, 184, 175] },
        ],
        'THIS_YEAR': [
          { label: "泛光照明", data: [326, 215, 225, 223, 340, 320] },
          { label: "智能照明", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
    [
      "BUILD", {
        'TODAY': [
          { label: "泛光照明", data: [82, 85, 75, 76, 78, 98, 85, 72, 85, 73, 86, 78, 98, 85, 82, 75, 83, 96, 78, 98, 75, 82, 85, 83] },
          { label: "智能照明", data: [54, 45, 56, 58, 59, 55, 55, 64, 55, 56, 58, 59, 55, 55, 54, 45, 56, 58, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "泛光照明", data: [176, 115, 135, 123, 140, 220, 115] },
          { label: "智能照明", data: [156, 165, 155, 173, 180, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "泛光照明", data: [117, 115, 133, 139, 128, 128, 125, 122, 125, 113, 116, 108, 108, 115, 112, 115] },
          { label: "智能照明", data: [184, 185, 176, 158, 157, 155, 155, 154, 155, 166, 168, 169, 185, 175, 184, 175] },
        ],
        'THIS_YEAR': [
          { label: "泛光照明", data: [326, 215, 225, 223, 340, 320] },
          { label: "智能照明", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
    [
      "FLOOR", {
        'TODAY': [
          { label: "泛光照明", data: [82, 85, 75, 76, 78, 98, 85, 72, 85, 73, 86, 78, 98, 85, 82, 75, 83, 96, 78, 98, 75, 82, 85, 83] },
          { label: "智能照明", data: [54, 45, 56, 58, 59, 55, 55, 64, 55, 56, 58, 59, 55, 55, 54, 45, 56, 58, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "泛光照明", data: [176, 115, 135, 123, 140, 220, 115] },
          { label: "智能照明", data: [156, 165, 155, 173, 180, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "泛光照明", data: [117, 115, 133, 139, 128, 128, 125, 122, 125, 113, 116, 108, 108, 115, 112, 115] },
          { label: "智能照明", data: [184, 185, 176, 158, 157, 155, 155, 154, 155, 166, 168, 169, 185, 175, 184, 175] },
        ],
        'THIS_YEAR': [
          { label: "泛光照明", data: [326, 215, 225, 223, 340, 320] },
          { label: "智能照明", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};


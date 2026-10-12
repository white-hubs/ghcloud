
interface Option {
  label: string;
  value: number;
  color?: string;
  img?: string;
  open?: number;
  close?: number;
  data?: number[];
  time?: string;
}
// 气体使用量概览
export const getUseData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "氧气", value: 52 },
          { label: "二氧化碳", value: 10 },
          { label: "笑气", value: 20 },
          { label: "压缩空气", value: 55 },
          { label: "负压吸引", value: 20 },
          { label: "氦气", value: 55 },
        ],
        'THIS_WEEK': [
          { label: "氧气", value: 72 },
          { label: "二氧化碳", value: 22 },
          { label: "笑气", value: 60 },
          { label: "压缩空气", value: 80 },
          { label: "负压吸引", value: 60 },
          { label: "氦气", value: 80 },
        ],
        'THIS_MONTH': [
          { label: "氧气", value: 153 },
          { label: "二氧化碳", value: 145 },
          { label: "笑气", value: 159 },
          { label: "压缩空气", value: 176 },
          { label: "负压吸引", value: 159 },
          { label: "氦气", value: 176 },
        ],
        'THIS_YEAR': [
          { label: "氧气", value: 165 },
          { label: "二氧化碳", value: 215 },
          { label: "笑气", value: 250 },
          { label: "压缩空气", value: 268 },
          { label: "负压吸引", value: 250 },
          { label: "氦气", value: 268 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "氧气", value: 115 },
        { label: "二氧化碳", value: 110 },
        { label: "笑气", value: 120 },
        { label: "压缩空气", value: 155 },
        { label: "负压吸引", value: 120 },
        { label: "氦气", value: 155 },
      ],
      'THIS_WEEK': [
        { label: "氧气", value: 65 },
        { label: "二氧化碳", value: 122 },
        { label: "笑气", value: 160 },
        { label: "压缩空气", value: 180 },
        { label: "负压吸引", value: 120 },
        { label: "氦气", value: 155 },
      ],
      'THIS_MONTH': [
        { label: "氧气", value: 176 },
        { label: "二氧化碳", value: 145 },
        { label: "笑气", value: 159 },
        { label: "压缩空气", value: 176 },
        { label: "负压吸引", value: 220 },
        { label: "氦气", value: 255 },
      ],
      'THIS_YEAR': [
        { label: "氧气", value: 185 },
        { label: "二氧化碳", value: 215 },
        { label: "笑气", value: 250 },
        { label: "压缩空气", value: 228 },
        { label: "负压吸引", value: 320 },
        { label: "氦气", value: 355 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "氧气", value: 35 },
        { label: "二氧化碳", value: 210 },
        { label: "笑气", value: 210 },
        { label: "压缩空气", value: 255 },
        { label: "负压吸引", value: 150 },
        { label: "氦气", value: 165 },
      ],
      'THIS_WEEK': [
        { label: "氧气", value: 77 },
        { label: "二氧化碳", value: 222 },
        { label: "笑气", value: 160 },
        { label: "压缩空气", value: 180 },
        { label: "负压吸引", value: 120 },
        { label: "氦气", value: 155 },
      ],
      'THIS_MONTH': [
        { label: "氧气", value: 105 },
        { label: "二氧化碳", value: 195 },
        { label: "笑气", value: 259 },
        { label: "压缩空气", value: 176 },
        { label: "负压吸引", value: 120 },
        { label: "氦气", value: 155 },
      ],
      'THIS_YEAR': [
        { label: "氧气", value: 175 },
        { label: "二氧化碳", value: 225 },
        { label: "笑气", value: 250 },
        { label: "压缩空气", value: 268 },
        { label: "负压吸引", value: 220 },
        { label: "氦气", value: 255 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 设备总览
export const getEquipmentData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "气体报警箱", value: 70, color: "#FFAB10" },
          { label: "压力表", value: 10, color: "#2F8DFF" },
          { label: "流量计", value: 20, color: "#F14545" },
        ],
        'THIS_WEEK': [
          { label: "气体报警箱", value: 150, color: "#FFAB10" },
          { label: "压力表", value: 22, color: "#2F8DFF" },
          { label: "流量计", value: 50, color: "#F14545" },
        ],
        'THIS_MONTH': [
          { label: "气体报警箱", value: 230, color: "#FFAB10" },
          { label: "压力表", value: 150, color: "#2F8DFF" },
          { label: "流量计", value: 131, color: "#F14545" },
        ],
        'THIS_YEAR': [
          { label: "气体报警箱", value: 562, color: "#FFAB10" },
          { label: "压力表", value: 204, color: "#2F8DFF" },
          { label: "流量计", value: 220, color: "#F14545" },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "气体报警箱", value: 130, color: "#FFAB10" },
        { label: "压力表", value: 110, color: "#2F8DFF" },
        { label: "流量计", value: 50, color: "#F14545" },
      ],
      'THIS_WEEK': [
        { label: "气体报警箱", value: 158, color: "#FFAB10" },
        { label: "压力表", value: 62, color: "#2F8DFF" },
        { label: "流量计", value: 57, color: "#F14545" },
      ],
      'THIS_MONTH': [
        { label: "气体报警箱", value: 230, color: "#FFAB10" },
        { label: "压力表", value: 59, color: "#2F8DFF" },
        { label: "流量计", value: 80, color: "#F14545" },
      ],
      'THIS_YEAR': [
        { label: "气体报警箱", value: 362, color: "#FFAB10" },
        { label: "压力表", value: 254, color: "#2F8DFF" },
        { label: "流量计", value: 120, color: "#F14545" },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "气体报警箱", value: 65, color: "#FFAB10" },
        { label: "压力表", value: 24, color: "#2F8DFF" },
        { label: "流量计", value: 27, color: "#F14545" },
      ],
      'THIS_WEEK': [
        { label: "气体报警箱", value: 251, color: "#FFAB10" },
        { label: "压力表", value: 122, color: "#2F8DFF" },
        { label: "流量计", value: 57, color: "#F14545" },
      ],
      'THIS_MONTH': [
        { label: "气体报警箱", value: 340, color: "#FFAB10" },
        { label: "压力表", value: 50, color: "#2F8DFF" },
        { label: "流量计", value: 31, color: "#F14545" },
      ],
      'THIS_YEAR': [
        { label: "气体报警箱", value: 462, color: "#FFAB10" },
        { label: "压力表", value: 24, color: "#2F8DFF" },
        { label: "流量计", value: 112, color: "#F14545" },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 气体使用明细
export const getGasDetail = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "氧化二氮", time: '09:00', value: 56 },
          { label: "二氧化碳", time: '10:00', value: 24 },
          { label: "氧气", time: '10:00', value: 64 },
          { label: "压缩空气", time: '10:00', value: 52 },
          { label: "氧化二氮", time: '10:00', value: 35 },
          { label: "二氧化碳", time: '10:00', value: 78 },
          { label: "氧气", time: '10:00', value: 45 },
          { label: "压缩空气", time: '10:00', value: 75 },
        ],
        'THIS_WEEK': [
          { label: "氧化二氮", time: '09:00', value: 50 },
          { label: "二氧化碳", time: '10:00', value: 35 },
          { label: "氧气", time: '10:00', value: 80 },
          { label: "压缩空气", time: '10:00', value: 72 },
          { label: "氧化二氮", time: '10:00', value: 35 },
          { label: "二氧化碳", time: '10:00', value: 68 },
          { label: "氧气", time: '10:00', value: 45 },
          { label: "压缩空气", time: '10:00', value: 75 },
        ],
        'THIS_MONTH': [
          { label: "氧化二氮", time: '09:00', value: 66 },
          { label: "二氧化碳", time: '10:00', value: 42 },
          { label: "氧气", time: '10:00', value: 68 },
          { label: "压缩空气", time: '10:00', value: 72 },
          { label: "氧化二氮", time: '10:00', value: 25 },
          { label: "二氧化碳", time: '10:00', value: 71 },
          { label: "氧气", time: '10:00', value: 43 },
          { label: "压缩空气", time: '10:00', value: 45 },
        ],
        'THIS_YEAR': [
          { label: "氧化二氮", time: '09:00', value: 50 },
          { label: "二氧化碳", time: '10:00', value: 44 },
          { label: "氧气", time: '10:00', value: 67 },
          { label: "压缩空气", time: '10:00', value: 22 },
          { label: "氧化二氮", time: '10:00', value: 35 },
          { label: "二氧化碳", time: '10:00', value: 78 },
          { label: "氧气", time: '10:00', value: 25 },
          { label: "压缩空气", time: '10:00', value: 25 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "氧化二氮", time: '09:00', value: 56 },
        { label: "二氧化碳", time: '10:00', value: 24 },
        { label: "氧气", time: '10:00', value: 64 },
        { label: "压缩空气", time: '10:00', value: 52 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 78 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ],
      'THIS_WEEK': [
        { label: "氧化二氮", time: '09:00', value: 50 },
        { label: "二氧化碳", time: '10:00', value: 35 },
        { label: "氧气", time: '10:00', value: 80 },
        { label: "压缩空气", time: '10:00', value: 72 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 68 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ],
      'THIS_MONTH': [
        { label: "氧化二氮", time: '09:00', value: 86 },
        { label: "二氧化碳", time: '10:00', value: 34 },
        { label: "氧气", time: '10:00', value: 84 },
        { label: "压缩空气", time: '10:00', value: 52 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 78 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ],
      'THIS_YEAR': [
        { label: "氧化二氮", time: '09:00', value: 96 },
        { label: "二氧化碳", time: '10:00', value: 24 },
        { label: "氧气", time: '10:00', value: 64 },
        { label: "压缩空气", time: '10:00', value: 52 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 78 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "氧化二氮", time: '09:00', value: 106 },
        { label: "二氧化碳", time: '10:00', value: 124 },
        { label: "氧气", time: '10:00', value: 64 },
        { label: "压缩空气", time: '10:00', value: 52 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 78 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ],
      'THIS_WEEK': [
        { label: "氧化二氮", time: '09:00', value: 50 },
        { label: "二氧化碳", time: '10:00', value: 35 },
        { label: "氧气", time: '10:00', value: 80 },
        { label: "压缩空气", time: '10:00', value: 72 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 68 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ],
      'THIS_MONTH': [
        { label: "氧化二氮", time: '09:00', value: 56 },
        { label: "二氧化碳", time: '10:00', value: 24 },
        { label: "氧气", time: '10:00', value: 64 },
        { label: "压缩空气", time: '10:00', value: 52 },
        { label: "氧化二氮", time: '10:00', value: 35 },
        { label: "二氧化碳", time: '10:00', value: 78 },
        { label: "氧气", time: '10:00', value: 45 },
        { label: "压缩空气", time: '10:00', value: 75 },
      ],
      'THIS_YEAR': [
        { label: "氧化二氮", time: '09:00', value: 256 },
        { label: "二氧化碳", time: '10:00', value: 224 },
        { label: "氧气", time: '10:00', value: 264 },
        { label: "压缩空气", time: '10:00', value: 252 },
        { label: "氧化二氮", time: '10:00', value: 235 },
        { label: "二氧化碳", time: '10:00', value: 278 },
        { label: "氧气", time: '10:00', value: 245 },
        { label: "压缩空气", time: '10:00', value: 275 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 科室使用量概况
export const getOfficeUseData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "手术室", value: 145 },
          { label: "预麻室", value: 120 },
          { label: "恢复室", value: 110 },
          { label: "清创室", value: 100 },
          { label: "妇产科科室", value: 85 },
          { label: "ICU科室", value: 70 },
        ],
        'THIS_WEEK': [
          { label: "手术室", value: 170 },
          { label: "预麻室", value: 150 },
          { label: "恢复室", value: 135 },
          { label: "清创室", value: 130 },
          { label: "妇产科科室", value: 120 },
          { label: "ICU科室", value: 110 },
        ],
        'THIS_MONTH': [
          { label: "手术室", value: 245 },
          { label: "预麻室", value: 190 },
          { label: "恢复室", value: 180 },
          { label: "清创室", value: 135 },
          { label: "妇产科科室", value: 125 },
          { label: "ICU科室", value: 100 },
        ],
        'THIS_YEAR': [
          { label: "手术室", value: 340 },
          { label: "预麻室", value: 320 },
          { label: "恢复室", value: 315 },
          { label: "清创室", value: 300 },
          { label: "妇产科科室", value: 245 },
          { label: "ICU科室", value: 220 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "手术室", value: 135 },
        { label: "预麻室", value: 100 },
        { label: "恢复室", value: 90 },
        { label: "清创室", value: 80 },
        { label: "妇产科科室", value: 65 },
        { label: "ICU科室", value: 50 },
      ],
      'THIS_WEEK': [
        { label: "手术室", value: 185 },
        { label: "预麻室", value: 140 },
        { label: "恢复室", value: 130 },
        { label: "清创室", value: 120 },
        { label: "妇产科科室", value: 95 },
        { label: "ICU科室", value: 50 },
      ],
      'THIS_MONTH': [
        { label: "手术室", value: 245 },
        { label: "预麻室", value: 240 },
        { label: "恢复室", value: 220 },
        { label: "清创室", value: 210 },
        { label: "妇产科科室", value: 205 },
        { label: "ICU科室", value: 190 },
      ],
      'THIS_YEAR': [
        { label: "手术室", value: 355 },
        { label: "预麻室", value: 300 },
        { label: "恢复室", value: 280 },
        { label: "清创室", value: 270 },
        { label: "妇产科科室", value: 245 },
        { label: "ICU科室", value: 200 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "手术室", value: 152 },
        { label: "预麻室", value: 110 },
        { label: "恢复室", value: 90 },
        { label: "清创室", value: 60 },
        { label: "妇产科科室", value: 50 },
        { label: "ICU科室", value: 30 },
      ],
      'THIS_WEEK': [
        { label: "手术室", value: 183 },
        { label: "预麻室", value: 152 },
        { label: "恢复室", value: 138 },
        { label: "清创室", value: 135 },
        { label: "妇产科科室", value: 105 },
        { label: "ICU科室", value: 80 },
      ],
      'THIS_MONTH': [
        { label: "手术室", value: 252 },
        { label: "预麻室", value: 210 },
        { label: "恢复室", value: 185 },
        { label: "清创室", value: 147 },
        { label: "妇产科科室", value: 130 },
        { label: "ICU科室", value: 124 },
      ],
      'THIS_YEAR': [
        { label: "手术室", value: 352 },
        { label: "预麻室", value: 340 },
        { label: "恢复室", value: 310 },
        { label: "清创室", value: 280 },
        { label: "妇产科科室", value: 230 },
        { label: "ICU科室", value: 200 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 流量使用趋势
export const getFlowData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "流量使用", data: [27, 30, 33, 31, 35, 34, 33, 32, 34, 38, 40, 39, 35, 30, 27, 25, 27, 31, 33, 35, 38, 37, 33, 30] },
        ],
        'THIS_WEEK': [
          { label: "流量使用", data: [126, 115, 125, 123, 140, 120, 115] },
        ],
        'THIS_MONTH': [
          { label: "流量使用", data: [17, 25, 33, 59, 88, 98, 115, 122, 125, 133, 156, 78, 98, 115, 12, 27] },
        ],
        'THIS_YEAR': [
          { label: "流量使用", data: [326, 315, 325, 333, 330, 325] },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "流量使用", data: [22, 25, 28, 26, 29, 30, 28, 27, 29, 33, 35, 34, 30, 25, 22, 23, 24, 26, 28, 29, 33, 32, 28, 25] },
      ],
      'THIS_WEEK': [
        { label: "流量使用", data: [129, 155, 125, 143, 140, 130, 155] },
      ],
      'THIS_MONTH': [
        { label: "流量使用", data: [17, 25, 33, 59, 88, 98, 115, 122, 125, 133, 156, 78, 98, 115, 12, 56] },
      ],
      'THIS_YEAR': [
        { label: "流量使用", data: [226, 215, 225, 223, 230, 220] },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "流量使用", data: [23, 26, 30, 28, 31, 32, 30, 29, 31, 35, 37, 36, 32, 27, 24, 22, 24, 28, 30, 31, 35, 34, 30, 27] },
      ],
      'THIS_WEEK': [
        { label: "流量使用", data: [126, 105, 125, 103, 140, 100, 115] },
      ],
      'THIS_MONTH': [
        { label: "流量使用", data: [17, 25, 33, 59, 88, 98, 115, 122, 125, 133, 156, 78, 98, 115, 12, 45] },
      ],
      'THIS_YEAR': [
        { label: "流量使用", data: [316, 305, 315, 323, 320, 315] },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 科室使用量top5
export const getOfficeUseTop = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "住院大楼", value: 75 },
          { label: "门诊大楼", value: 60 },
          { label: "牙科大楼", value: 55 },
          { label: "门诊大楼", value: 50 },
          { label: "门诊大楼", value: 45 },
          { label: "门诊大楼", value: 30 },
        ],
        'THIS_WEEK': [
          { label: "住院大楼", value: 78 },
          { label: "牙科大楼", value: 68 },
          { label: "门诊大楼", value: 65 },
          { label: "清创室", value: 55 },
          { label: "妇产科科室", value: 50 },
          { label: "ICU科室", value: 48 },
        ],
        'THIS_MONTH': [
          { label: "住院大楼", value: 85 },
          { label: "牙科大楼", value: 79 },
          { label: "门诊大楼", value: 75 },
          { label: "清创室", value: 71 },
          { label: "妇产科科室", value: 68 },
          { label: "ICU科室", value: 60 },
        ],
        'THIS_YEAR': [
          { label: "住院大楼", value: 97 },
          { label: "牙科大楼", value: 81 },
          { label: "门诊大楼", value: 77 },
          { label: "清创室", value: 57 },
          { label: "妇产科科室", value: 45 },
          { label: "ICU科室", value: 34 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "住院大楼", value: 75 },
        { label: "牙科大楼", value: 70 },
        { label: "门诊大楼", value: 68 },
        { label: "清创室", value: 65 },
        { label: "妇产科科室", value: 62 },
        { label: "ICU科室", value: 60 },
      ],
      'THIS_WEEK': [
        { label: "住院大楼", value: 75 },
        { label: "牙科大楼", value: 72 },
        { label: "门诊大楼", value: 70 },
        { label: "清创室", value: 67 },
        { label: "妇产科科室", value: 45 },
        { label: "ICU科室", value: 32 },
      ],
      'THIS_MONTH': [
        { label: "住院大楼", value: 76 },
        { label: "牙科大楼", value: 60 },
        { label: "门诊大楼", value: 50 },
        { label: "清创室", value: 45 },
        { label: "妇产科科室", value: 41 },
        { label: "ICU科室", value: 32 },
      ],
      'THIS_YEAR': [
        { label: "住院大楼", value: 75 },
        { label: "牙科大楼", value: 57 },
        { label: "门诊大楼", value: 38 },
        { label: "清创室", value: 30 },
        { label: "妇产科科室", value: 24 },
        { label: "ICU科室", value: 20 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "住院大楼", value: 79 },
        { label: "牙科大楼", value: 71 },
        { label: "门诊大楼", value: 60 },
        { label: "清创室", value: 50 },
        { label: "妇产科科室", value: 45 },
        { label: "ICU科室", value: 30 },
      ],
      'THIS_WEEK': [
        { label: "住院大楼", value: 83 },
        { label: "牙科大楼", value: 62 },
        { label: "门诊大楼", value: 58 },
        { label: "清创室", value: 45 },
        { label: "妇产科科室", value: 40 },
        { label: "ICU科室", value: 30 },
      ],
      'THIS_MONTH': [
        { label: "住院大楼", value: 82 },
        { label: "牙科大楼", value: 75 },
        { label: "门诊大楼", value: 65 },
        { label: "清创室", value: 57 },
        { label: "妇产科科室", value: 50 },
        { label: "ICU科室", value: 44 },
      ],
      'THIS_YEAR': [
        { label: "住院大楼", value: 72 },
        { label: "牙科大楼", value: 60 },
        { label: "门诊大楼", value: 50 },
        { label: "清创室", value: 40 },
        { label: "妇产科科室", value: 34 },
        { label: "ICU科室", value: 20 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 设备故障率
export const getEquipmentFailed = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "设备总数", value: 105 },
          { label: "故障总数", value: 50 },
        ],
        'THIS_WEEK': [
          { label: "设备总数", value: 205 },
          { label: "故障总数", value: 80 },
        ],
        'THIS_MONTH': [
          { label: "设备总数", value: 345 },
          { label: "故障总数", value: 100 },
        ],
        'THIS_YEAR': [
          { label: "设备总数", value: 505 },
          { label: "故障总数", value: 58 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "设备总数", value: 205 },
        { label: "故障总数", value: 70 },
      ],
      'THIS_WEEK': [
        { label: "设备总数", value: 245 },
        { label: "故障总数", value: 180 },
      ],
      'THIS_MONTH': [
        { label: "设备总数", value: 375 },
        { label: "故障总数", value: 52 },
      ],
      'THIS_YEAR': [
        { label: "设备总数", value: 565 },
        { label: "故障总数", value: 59 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "设备总数", value: 205 },
        { label: "故障总数", value: 80 },
      ],
      'THIS_WEEK': [
        { label: "设备总数", value: 305 },
        { label: "故障总数", value: 85 },
      ],
      'THIS_MONTH': [
        { label: "设备总数", value: 375 },
        { label: "故障总数", value: 100 },
      ],
      'THIS_YEAR': [
        { label: "设备总数", value: 565 },
        { label: "故障总数", value: 158 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};


interface Option {
  label: string;
  value: number;
  color?: string;
  img?: string;
  processing?: number;
  handle?: number;
  data?: number[];
  time?: string;
}
// 车辆通行情况
export const getCarData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "驶入", data: [16, 14, 17, 20, 11, 13, 15, 19, 6, 11, 13, 5, 9, 11, 13, 15, 12, 15, 18, 20,] },
          { label: "驶出", data: [6, 8, 11, 14, 17, 20, 11, 13, 15, 19, 13, 5, 9, 11, , 7, 12, 14, 16, 20, 7, 15, 13, 16, 19] },
        ],
        'THIS_WEEK': [
          { label: "驶入", data: [126, 115, 125, 123, 140, 120, 115] },
          { label: "驶出", data: [106, 125, 155, 173, 110, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "驶入", data: [117, 115, 113, 119, 118, 128, 125, 122, 125, 133, 126, 128, 128, 125, 122, 125] },
          { label: "驶出", data: [164, 165, 166, 168, 167, 165, 165, 164, 165, 166, 158, 159, 155, 155, 154, 165] },
        ],
        'THIS_YEAR': [
          { label: "驶入", data: [126, 215, 225, 223, 340, 320] },
          { label: "驶出", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
    [
      "BUILD", {
        'TODAY': [
          { label: "驶入", data: [82, 85, 82, 86, 88, 88, 85, 82, 85, 80, 78, 78, 78, 75, 72, 75, 73, 76, 78, 76, 75, 74, 75, 76] },
          { label: "驶出", data: [54, 55, 56, 58, 59, 55, 55, 64, 65, 66, 68, 69, 65, 65, 64, 45, 46, 48, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "驶入", data: [126, 115, 125, 123, 140, 120, 115] },
          { label: "驶出", data: [106, 125, 155, 173, 110, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "驶入", data: [117, 115, 113, 119, 118, 128, 125, 122, 125, 133, 126, 128, 128, 125, 122, 125] },
          { label: "驶出", data: [164, 165, 166, 168, 167, 165, 165, 164, 165, 166, 158, 159, 155, 155, 154, 165] },
        ],
        'THIS_YEAR': [
          { label: "驶入", data: [126, 215, 225, 223, 340, 320] },
          { label: "驶出", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
    [
      "FLOOR", {
        'TODAY': [
          { label: "驶入", data: [82, 85, 82, 86, 88, 88, 85, 82, 85, 80, 78, 78, 78, 75, 72, 75, 73, 76, 78, 76, 75, 74, 75, 76] },
          { label: "驶出", data: [54, 55, 56, 58, 59, 55, 55, 64, 65, 66, 68, 69, 65, 65, 64, 45, 46, 48, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "驶入", data: [126, 115, 125, 123, 140, 120, 115] },
          { label: "驶出", data: [106, 125, 155, 173, 110, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "驶入", data: [117, 115, 113, 119, 118, 128, 125, 122, 125, 133, 126, 128, 128, 125, 122, 125] },
          { label: "驶出", data: [164, 165, 166, 168, 167, 165, 165, 164, 165, 166, 158, 159, 155, 155, 154, 165] },
        ],
        'THIS_YEAR': [
          { label: "驶入", data: [126, 215, 225, 223, 340, 320] },
          { label: "驶出", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};
// 人员出入情况
export const getPersonData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "进入", data: [82, 85, 75, 76, 78, 98, 85, 72, 85, 73, 86, 78, 98, 85, 82, 75, 83, 96, 78, 98, 75, 82, 85, 83] },
          { label: "离开", data: [54, 45, 56, 58, 59, 55, 55, 64, 55, 56, 58, 59, 55, 55, 54, 45, 56, 58, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "进入", data: [176, 115, 135, 123, 140, 220, 115] },
          { label: "离开", data: [156, 165, 155, 173, 180, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "进入", data: [117, 115, 133, 139, 128, 128, 125, 122, 125, 113, 116, 108, 108, 115, 112, 115] },
          { label: "离开", data: [184, 185, 176, 158, 157, 155, 155, 154, 155, 166, 168, 169, 185, 175, 184, 175] },
        ],
        'THIS_YEAR': [
          { label: "进入", data: [326, 215, 225, 223, 340, 320] },
          { label: "离开", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
    [
      "BUILD", {
        'TODAY': [
          { label: "进入", data: [82, 85, 75, 76, 78, 98, 85, 72, 85, 73, 86, 78, 98, 85, 82, 75, 83, 96, 78, 98, 75, 82, 85, 83] },
          { label: "离开", data: [54, 45, 56, 58, 59, 55, 55, 64, 55, 56, 58, 59, 55, 55, 54, 45, 56, 58, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "进入", data: [176, 115, 135, 123, 140, 220, 115] },
          { label: "离开", data: [156, 165, 155, 173, 180, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "进入", data: [117, 115, 133, 139, 128, 128, 125, 122, 125, 113, 116, 108, 108, 115, 112, 115] },
          { label: "离开", data: [184, 185, 176, 158, 157, 155, 155, 154, 155, 166, 168, 169, 185, 175, 184, 175] },
        ],
        'THIS_YEAR': [
          { label: "进入", data: [326, 215, 225, 223, 340, 320] },
          { label: "离开", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
    [
      "FLOOR", {
        'TODAY': [
          { label: "进入", data: [82, 85, 75, 76, 78, 98, 85, 72, 85, 73, 86, 78, 98, 85, 82, 75, 83, 96, 78, 98, 75, 82, 85, 83] },
          { label: "离开", data: [54, 45, 56, 58, 59, 55, 55, 64, 55, 56, 58, 59, 55, 55, 54, 45, 56, 58, 59, 55, 55, 54, 54, 55] },
        ],
        'THIS_WEEK': [
          { label: "进入", data: [176, 115, 135, 123, 140, 220, 115] },
          { label: "离开", data: [156, 165, 155, 173, 180, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "进入", data: [117, 115, 133, 139, 128, 128, 125, 122, 125, 113, 116, 108, 108, 115, 112, 115] },
          { label: "离开", data: [184, 185, 176, 158, 157, 155, 155, 154, 155, 166, 168, 169, 185, 175, 184, 175] },
        ],
        'THIS_YEAR': [
          { label: "进入", data: [326, 215, 225, 223, 340, 320] },
          { label: "离开", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 门禁通行情况
export const getDoorData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "正常通行（次）", value: 52 },
          { label: "异常通行（次）", value: 10 },
        ],
        'THIS_WEEK': [
          { label: "正常通行（次）", value: 62 },
          { label: "异常通行（次）", value: 30 },
        ],
        'THIS_MONTH': [
          { label: "正常通行（次）", value: 175 },
          { label: "异常通行（次）", value: 118 },
        ],
        'THIS_YEAR': [
          { label: "正常通行（次）", value: 282 },
          { label: "异常通行（次）", value: 250 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "正常通行（次）", value: 92 },
        { label: "异常通行（次）", value: 50 },
      ],
      'THIS_WEEK': [
        { label: "正常通行（次）", value: 102 },
        { label: "异常通行（次）", value: 70 },
      ],
      'THIS_MONTH': [
        { label: "正常通行（次）", value: 105 },
        { label: "异常通行（次）", value: 168 },
      ],
      'THIS_YEAR': [
        { label: "正常通行（次）", value: 212 },
        { label: "异常通行（次）", value: 290 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "正常通行（次）", value: 52 },
        { label: "异常通行（次）", value: 20 },
      ],
      'THIS_WEEK': [
        { label: "正常通行（次）", value: 162 },
        { label: "异常通行（次）", value: 130 },
      ],
      'THIS_MONTH': [
        { label: "正常通行（次）", value: 175 },
        { label: "异常通行（次）", value: 118 },
      ],
      'THIS_YEAR': [
        { label: "正常通行（次）", value: 282 },
        { label: "异常通行（次）", value: 170 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};

// 安全态势总览
export const getSecurityStatic = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "安防报警", processing: 10, handle: 2 },
          { label: "消防报警", processing: 16, handle: 4 },
        ],
        'THIS_WEEK': [
          { label: "安防报警", processing: 25, handle: 10 },
          { label: "消防报警", processing: 26, handle: 13 },
        ],
        'THIS_MONTH': [
          { label: "安防报警", processing: 50, handle: 22 },
          { label: "消防报警", processing: 66, handle: 14 },
        ],
        'THIS_YEAR': [
          { label: "安防报警", processing: 110, handle: 92 },
          { label: "消防报警", processing: 116, handle: 84 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "安防报警", processing: 110, handle: 52 },
        { label: "消防报警", processing: 216, handle: 84 },
      ],
      'THIS_WEEK': [
        { label: "安防报警", processing: 200, handle: 122 },
        { label: "消防报警", processing: 168, handle: 54 },
      ],
      'THIS_MONTH': [
        { label: "安防报警", processing: 108, handle: 82 },
        { label: "消防报警", processing: 326, handle: 104 },
      ],
      'THIS_YEAR': [
        { label: "安防报警", processing: 410, handle: 202 },
        { label: "消防报警", processing: 416, handle: 124 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "安防报警", processing: 105, handle: 101 },
        { label: "消防报警", processing: 16, handle: 94 },
      ],
      'THIS_WEEK': [
        { label: "安防报警", processing: 150, handle: 172 },
        { label: "消防报警", processing: 156, handle: 124 },
      ],
      'THIS_MONTH': [
        { label: "安防报警", processing: 130, handle: 192 },
        { label: "消防报警", processing: 186, handle: 184 },
      ],
      'THIS_YEAR': [
        { label: "安防报警", processing: 210, handle: 152 },
        { label: "消防报警", processing: 316, handle: 154 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};
// 今日巡更情况
export const getTodayAnalysis = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "待接收", value: 120 },
          { label: "执行中", value: 85 },
          { label: "已完成", value: 155 },
        ],
        'THIS_WEEK': [
          { label: "待接收", value: 50 },
          { label: "执行中", value: 95 },
          { label: "已完成", value: 99 },
        ],
        'THIS_MONTH': [
          { label: "待接收", value: 120 },
          { label: "执行中", value: 85 },
          { label: "已完成", value: 155 },
        ],
        'THIS_YEAR': [
          { label: "执行中", value: 240 },
          { label: "待接收", value: 120 },
          { label: "已完成", value: 155 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "待接收", value: 220 },
        { label: "执行中", value: 185 },
        { label: "已完成", value: 255 },
      ],
      'THIS_WEEK': [
        { label: "待接收", value: 79 },
        { label: "执行中", value: 134 },
        { label: "已完成", value: 185 },
      ],
      'THIS_MONTH': [
        { label: "待接收", value: 76 },
        { label: "执行中", value: 85 },
        { label: "已完成", value: 200 },
      ],
      'THIS_YEAR': [
        { label: "执行中", value: 185 },
        { label: "待接收", value: 120 },
        { label: "已完成", value: 255 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "待接收", value: 90 },
        { label: "执行中", value: 85 },
        { label: "已完成", value: 168 },
      ],
      'THIS_WEEK': [
        { label: "待接收", value: 58 },
        { label: "执行中", value: 95 },
        { label: "已完成", value: 109 },
      ],
      'THIS_MONTH': [
        { label: "待接收", value: 60 },
        { label: "执行中", value: 85 },
        { label: "已完成", value: 185 },
      ],
      'THIS_YEAR': [
        { label: "执行中", value: 140 },
        { label: "待接收", value: 100 },
        { label: "已完成", value: 187 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};
// 电梯运行监测
export const getElevatorAnalysis = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "电梯总数", value: 0 },
          { label: "停止", value: 50 },
          { label: "运行", value: 20 },
          { label: "检修", value: 85 },
        ],
        'THIS_WEEK': [
          { label: "电梯总数", value: 0 },
          { label: "停止", value: 78 },
          { label: "运行", value: 70 },
          { label: "检修", value: 85 },
        ],
        'THIS_MONTH': [
          { label: "电梯总数", value: 0 },
          { label: "停止", value: 70 },
          { label: "运行", value: 60 },
          { label: "检修", value: 55 },
        ],
        'THIS_YEAR': [
          { label: "电梯总数", value: 0 },
          { label: "停止", value: 180 },
          { label: "运行", value: 120 },
          { label: "检修", value: 135 },
        ]
      }
    ],
    ["BUILD", {
      'TODAY': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 90 },
        { label: "运行", value: 70 },
        { label: "检修", value: 35 },
      ],
      'THIS_WEEK': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 140 },
        { label: "运行", value: 120 },
        { label: "检修", value: 155 },
      ],
      'THIS_MONTH': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 180 },
        { label: "运行", value: 120 },
        { label: "检修", value: 125 },
      ],
      'THIS_YEAR': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 120 },
        { label: "运行", value: 270 },
        { label: "检修", value: 195 },
      ]
    }],
    ["FLOOR", {
      'TODAY': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 70 },
        { label: "运行", value: 50 },
        { label: "检修", value: 59 },
      ],
      'THIS_WEEK': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 80 },
        { label: "运行", value: 125 },
        { label: "检修", value: 155 },
      ],
      'THIS_MONTH': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 110 },
        { label: "运行", value: 120 },
        { label: "检修", value: 155 },
      ],
      'THIS_YEAR': [
        { label: "电梯总数", value: 0 },
        { label: "停止", value: 210 },
        { label: "运行", value: 220 },
        { label: "检修", value: 255 },
      ]
    }],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};
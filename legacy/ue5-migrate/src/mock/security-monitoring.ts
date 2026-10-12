
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
// 报警趋势分析
export const getAarlmData = <T extends Record<string, any>>(params: {
  formPage?: FromPageType;
  timeType?: TimeType;
}): Option[] => {
  let mokeData = new Map<FromPageType, any>([
    [
      "PARK", {
        'TODAY': [
          { label: "报警总数", data: [16, 14, 17, 20, 11, 13, 15, 19, 6, 20 ,11, 13, 35, 29, 11, 13, 15, 12, 15, 18, 20,] },
          { label: "已处理报警数", data: [56, 34, 47, 20, 61, 53, 55, 39, 46, 20 ,11, 13, 15, 19, 11, 13, 15, 12, 27, 22, 30,]  },
        ],
        'THIS_WEEK': [
          { label: "报警总数", data: [126, 115, 125, 123, 140, 120, 115] },
          { label: "已处理报警数", data: [106, 125, 155, 173, 110, 130, 105] },
        ],
        'THIS_MONTH': [
          { label: "报警总数", data: [117, 115, 113, 119, 118, 128, 125, 122, 125, 133, 126, 128, 128, 125, 122, 125] },
          { label: "已处理报警数", data: [164, 165, 166, 168, 167, 165, 165, 164, 165, 166, 158, 159, 155, 155, 154, 165] },
        ],
        'THIS_YEAR': [
          { label: "报警总数", data: [126, 215, 225, 223, 340, 320] },
          { label: "已处理报警数", data: [326, 315, 325, 323, 240, 120] },
        ]
      }
    ],
  ]);
  return mokeData.get(params.formPage)[params.timeType];
};
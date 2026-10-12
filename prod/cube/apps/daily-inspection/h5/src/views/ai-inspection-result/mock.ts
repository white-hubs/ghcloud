import type { InspectionImageAnalyzeResponse } from "@ghcloud/cube-daily-inspection-service";

export interface AiInspectionFile {
  id: string;
  name: string;
  path: string;
  type: string;
}

export interface AiInspectionResultOption {
  itemName: string;
  itemValue: string;
  errorFlag: boolean;
}

export const mockPhoto: AiInspectionFile = {
  id: "mock-photo-001",
  name: "inspection-photo.jpg",
  path: "https://img.yzcdn.cn/vant/cat.jpeg",
  type: "jpg",
};

const resultOptions: AiInspectionResultOption[] = [
  { itemName: "正常", itemValue: "NORMAL", errorFlag: false },
  { itemName: "异常", itemValue: "ABNORMAL", errorFlag: true },
];

export const createMockAiInspectionResult = (photo: AiInspectionFile): InspectionImageAnalyzeResponse => ({
  targetName: "A栋 3F 设备间",
  images: [photo.id],
  normalItems: [
    {
      standardId: "standard-002",
      standardName: "通道巡检",
      standardItems: [
        {
          itemId: "item-002",
          itemName: "安全通道畅通情况",
          resultVO: { id: "result-001", name: "巡检结果", options: resultOptions },
          result: { id: "result-001", name: "巡检结果", itemName: "正常", itemValue: "NORMAL", errorFlag: false },
        },
      ],
      problemDescription: "",
      evidence: "AI识别该巡检项状态正常。",
      confidence: 0.95,
      needManualReview: false,
    },
  ],
  abnormalItems: [
    {
      standardId: "standard-001",
      standardName: "消防设施巡检",
      standardItems: [
        {
          itemId: "item-001",
          itemName: "灭火器压力状态",
          resultVO: { id: "result-001", name: "巡检结果", options: resultOptions },
          result: { id: "result-001", name: "巡检结果", itemName: "异常", itemValue: "ABNORMAL", errorFlag: true },
        },
      ],
      problemDescription: "AI识别到灭火器压力表指针接近红色区域，建议现场复核。",
      evidence: "检查灭火器有效期与压力状态，如压力不足请联系维保人员更换或充装。",
      confidence: 0.88,
      needManualReview: true,
    },
  ],
  unrecognizedItems: [
    {
      standardId: "standard-003",
      standardName: "设备标识巡检",
      standardItems: [
        {
          itemId: "item-003",
          itemName: "配电箱标识",
          resultVO: { id: "result-001", name: "巡检结果", options: resultOptions },
          problemDesc: "图片无法可靠识别该巡检项，需人工确认",
          evidence: "图片内容为室内天花板及监控摄像头，未能匹配配电箱标识特征。",
        },
      ],
      problemDescription: "",
      evidence: "",
      confidence: 0,
      needManualReview: true,
    },
  ],
});

export const mockRecognizeInspectionImage = async (photo: AiInspectionFile): Promise<InspectionImageAnalyzeResponse> => {
  await new Promise((resolve) => window.setTimeout(resolve, 800));
  return createMockAiInspectionResult(photo);
};

interface ConsumptionItem {
  label: string;
  value: number;
  color: string;
}

type TimeTypeKey = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";

const mockByTimeType = <T>(data: Record<TimeTypeKey, T>, params: string): T => data[params as TimeTypeKey] ?? data.TODAY;

export const getGasConsumptionData = (params: string): number[] =>
  mockByTimeType(
    {
      TODAY: [0, 0, 0, 0, 0, 0, 0, 104, 44, 78, 91, 12, 30, 51, 77, 15, 30, 20],
      THIS_WEEK: [145, 80, 102, 143, 30, 12, 50, 21],
      THIS_MONTH: [12, 128, 119, 80, 77, 70, 45, 30, 10, 58, 80, 47, 50, 100, 170, 39, 80, 90],
      THIS_YEAR: [15, 40, 100, 80, 100, 207],
    },
    params,
  );

export const EnergyConsumptionTrends = (params: string): number[] =>
  mockByTimeType(
    {
      TODAY: [0, 0, 0, 0, 0, 0, 0, 45, 20, 78, 51, 51, 5, 14, 30, 15, 30, 20],
      THIS_WEEK: [45, 80, 102, 43, 50, 68, 71, 91],
      THIS_MONTH: [14, 28, 19, 32, 47, 70, 45, 30, 10, 58, 46, 105, 108, 200, 170, 39, 80, 90],
      THIS_YEAR: [15, 40, 30, 200, 400, 300],
    },
    params,
  );

export const getCostInfoData = (params: string): ConsumptionItem[] =>
  mockByTimeType(
    {
      TODAY: [
        { label: "电能", value: 450, color: "#FFAB10" },
        { label: "水能", value: 234, color: "#2F8DFF" },
        { label: "燃气", value: 580, color: "#F14545" },
        { label: "蒸汽", value: 489, color: "#19F8F7" },
      ],
      THIS_WEEK: [
        { label: "电能", value: 1825, color: "#FFAB10" },
        { label: "水能", value: 4532, color: "#2F8DFF" },
        { label: "燃气", value: 2468, color: "#F14545" },
        { label: "蒸汽", value: 3878, color: "#19F8F7" },
      ],
      THIS_MONTH: [
        { label: "电能", value: 5687, color: "#FFAB10" },
        { label: "水能", value: 4535, color: "#2F8DFF" },
        { label: "燃气", value: 4456, color: "#F14545" },
        { label: "蒸汽", value: 8487, color: "#19F8F7" },
      ],
      THIS_YEAR: [
        { label: "电能", value: 10587, color: "#FFAB10" },
        { label: "水能", value: 56875, color: "#2F8DFF" },
        { label: "燃气", value: 13548, color: "#F14545" },
        { label: "蒸汽", value: 87384, color: "#19F8F7" },
      ],
    },
    params,
  );

interface EnergyAnalysisCategory {
  data: ConsumptionItem[];
  unit: string;
  title: string;
}

export const EnergySnalysis = (params: string): EnergyAnalysisCategory[] =>
  mockByTimeType(
    {
      TODAY: [
        {
          data: [
            { label: "动力用电", value: 72, color: "#FFAB10" },
            { label: "生活用电", value: 103, color: "#2F8DFF" },
            { label: "生产用电", value: 156, color: "#F14545" },
            { label: "其他用电", value: 78, color: "#19F8F7" },
          ],
          unit: "kWh",
          title: "电力",
        },
        {
          data: [
            { label: "生活用水", value: 167, color: "#FFAB10" },
            { label: "生成用水", value: 106, color: "#2F8DFF" },
            { label: "医疗用水", value: 187, color: "#F14545" },
            { label: "其他用水", value: 118, color: "#19F8F7" },
          ],
          unit: "m³",
          title: "水",
        },
        {
          data: [
            { label: "生活用气", value: 80, color: "#FFAB10" },
            { label: "生产用气", value: 182, color: "#2F8DFF" },
            { label: "动力用气", value: 91, color: "#F14545" },
            { label: "其他用气", value: 158, color: "#19F8F7" },
          ],
          unit: "m³",
          title: "燃气",
        },
      ],
      THIS_WEEK: [
        {
          data: [
            { label: "动力用电", value: 624, color: "#FFAB10" },
            { label: "生活用电", value: 702, color: "#2F8DFF" },
            { label: "生产用电", value: 516, color: "#F14545" },
            { label: "其他用电", value: 756, color: "#19F8F7" },
          ],
          unit: "kWh",
          title: "电力",
        },
        {
          data: [
            { label: "生活用水", value: 681, color: "#FFAB10" },
            { label: "生成用水", value: 559, color: "#2F8DFF" },
            { label: "医疗用水", value: 448, color: "#F14545" },
            { label: "其他用水", value: 330, color: "#19F8F7" },
          ],
          unit: "m³",
          title: "水",
        },
        {
          data: [
            { label: "生活用气", value: 514, color: "#FFAB10" },
            { label: "生产用气", value: 407, color: "#2F8DFF" },
            { label: "动力用气", value: 577, color: "#F14545" },
            { label: "其他用气", value: 782, color: "#19F8F7" },
          ],
          unit: "m³",
          title: "燃气",
        },
      ],
      THIS_MONTH: [
        {
          data: [
            { label: "动力用电", value: 2039, color: "#FFAB10" },
            { label: "生活用电", value: 2216, color: "#2F8DFF" },
            { label: "生产用电", value: 2592, color: "#F14545" },
            { label: "其他用电", value: 2820, color: "#19F8F7" },
          ],
          unit: "kWh",
          title: "电力",
        },
        {
          data: [
            { label: "生活用水", value: 4490, color: "#FFAB10" },
            { label: "生成用水", value: 4030, color: "#2F8DFF" },
            { label: "医疗用水", value: 3767, color: "#F14545" },
            { label: "其他用水", value: 4647, color: "#19F8F7" },
          ],
          unit: "m³",
          title: "水",
        },
        {
          data: [
            { label: "生活用气", value: 3678, color: "#FFAB10" },
            { label: "生产用气", value: 3628, color: "#2F8DFF" },
            { label: "动力用气", value: 4558, color: "#F14545" },
            { label: "其他用气", value: 3421, color: "#19F8F7" },
          ],
          unit: "m³",
          title: "燃气",
        },
      ],
      THIS_YEAR: [],
    },
    params,
  );


export interface AnalysisMetricChart {
  title: string;
  chartType: string;
  categories: string[];
  values: number[];
  valueName: string;
}

export interface AnalysisMetricText {
  label: string;
  value: string;
}

export interface AnalysisInfo {
  name?: string;
  analysisStatus: 'ToBeAnalyzed' | 'Analyzed' | 'Analyzing' | 'AIAnalyzing';
  fraction?: number;
  expanded?: boolean;
  children?: AnalysisInfo[];
  code?: string;
  title?: string;
  aiSuggestions?: string[];
  data?: string;
  displayCharts?: AnalysisMetricChart[];
  displayTexts?: AnalysisMetricText[];
  metric?: string;
  img?: string;
  level?: number;
}

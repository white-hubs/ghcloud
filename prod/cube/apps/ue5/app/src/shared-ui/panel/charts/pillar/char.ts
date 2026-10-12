interface publicStyle {
  color: string;
  width?: number;
}
export interface textConfig {
  text: string;
  textStyle: publicStyle;
  padding: number[];
}

export interface legend {
  data: string[];
}

export interface lineStyle {
  color: string[];
  width: number;
  type: string;
}
export interface axisLine {
  lineStyle: publicStyle;
}

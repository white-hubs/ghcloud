export interface BaseAPIResult<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

interface TimeListState {
  value?: [Dayjs, Dayjs] | undefined;
  totalNumber?: number | undefined;
  key: string;
  nextKey?: string;
  nextDayBool?: number;
  startTime?: Dayjs;
  endTime?: Dayjs;
}[]

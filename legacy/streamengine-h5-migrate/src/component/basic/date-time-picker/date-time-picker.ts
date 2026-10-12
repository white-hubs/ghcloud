import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table'
import { StyleValue } from 'vue'

export enum DateTimePickerMiniumUint {
  DAY = 'DAY',
  HALF_DAY = 'HALF_DAY',
  HOUR = 'HOUR',
  MINUTE = 'MINUTE'
}

export interface DateTimePickerProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  modelValue?: string[];
  defaultValue?: Date | string;
  minDate?: string[];
  maxDate?: string[];
  style?: StyleValue;
  miniumUnit?: DateTimePickerMiniumUint;
  errorMessage?: string;
  echoMode?: boolean;
  isLink?: boolean;
  autoCurrentTime?: boolean;
  processType?: DynamicTableProcessType;
  readonly?: boolean;
  rangeChild?: boolean;
}

export enum TimeMeridiemType {
  // 上午
  MORNING = 0,
  // 下午
  AFTERNOON = 1
}

export const TimeMeridiemTypeLabel: Record<TimeMeridiemType, { enName: string; zhName: string; }> = {
  [TimeMeridiemType.MORNING]: {
    enName: 'AM',
    zhName: '上午'
  },
  [TimeMeridiemType.AFTERNOON]: {
    enName: 'PM',
    zhName: '下午'
  }
}

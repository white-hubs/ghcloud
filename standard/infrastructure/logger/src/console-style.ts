export enum ColorEnum {
  BLACK = 30,
  RED = 31,
  GREEN = 32,
  YELLOW = 33,
  BLUE = 34,
  MAGENTA = 35,
  CYAN = 36,
  WHITE = 37,
  GREY = 90,
  BRIGHT_RED = 91,
  BRIGHT_GREEN = 92,
  BRIGHT_YELLOW = 93,
  BRIGHT_BLUE = 94,
  BRIGHT_MAGENTA = 95,
  BRIGHT_CYAN = 96,
  BRIGHT_WHITE = 97,
}

export enum BackgroundColorEnum {
  BLACK = 40,
  RED = 41,
  GREEN = 42,
  YELLOW = 43,
  BLUE = 44,
  MAGENTA = 45,
  CYAN = 46,
  WHITE = 47,
  GREY = 100,
  BRIGHT_RED = 101,
  BRIGHT_GREEN = 102,
  BRIGHT_YELLOW = 103,
  BRIGHT_BLUE = 104,
  BRIGHT_MAGENTA = 105,
  BRIGHT_CYAN = 106,
  BRIGHT_WHITE = 107,
}

export enum FontEnum {
  BOLD = 1,
  ITALIC = 3,
  UNDERLINE = 4,
  LINE_THROUGH = 9,
}

export enum ControlEnum {
  // 前景色与背景色交换
  REVERSE = 7,
  // 闪烁
  BLINK = 5,

}

const controlChar = '\x1B['

export type Style = ColorEnum | BackgroundColorEnum | FontEnum | ControlEnum

export class ConsoleStyle {
  public static style (msg: string, style: Style[]): string {
    return `${controlChar}${style.join(';')}m${msg}${controlChar}0m`
  }
}

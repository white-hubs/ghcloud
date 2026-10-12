declare module 'qrcodejs2-fix' {
  export class QRCode {
    public constructor (containingElement: string | HTMLElement, config?: QRCodeConfig);

    public static stringToBytes (s: string): number[];
    public static CorrectLevel: CorrectLevel;

    public clear (): void;
    public makeCode (text: string): void;
  }

  interface QRCodeConfig {
    text?: string;
    width?: number;
    height?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: number;
  }

  interface CorrectLevel {
    L: number;
    M: number;
    Q: number;
    H: number;
  }

  export default QRCode;
}
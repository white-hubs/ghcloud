export interface Logger {
  debug: (...variables: unknown[]) => void;
  info: (...variables: unknown[]) => void;
  warn: (...variables: unknown[]) => void;
  error: (...variables: unknown[]) => void;
  fault: (...variables: unknown[]) => void;
}

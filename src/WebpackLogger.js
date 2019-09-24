export interface WebpackLogger {
  log(any): void;
  info(any): void;
  warn(any): void;
  error(any): void;
  debug(any): void;
}

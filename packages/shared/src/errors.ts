/** 論理的にありえないコードパスに到達した場合のエラー */
export class UnreachableError extends Error {
  constructor(value: never) {
    super(`到達不能: ${String(value)}`);
    this.name = "UnreachableError";
  }
}

/** 入力データのパースに失敗した場合のエラー */
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/** バリデーションに失敗した場合のエラー */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
